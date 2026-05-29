import { User } from "@sap/cds";

import { SalesOrderHeader, SalesOrderHeaders, SalesOrderItem } from "@models/sales";
import { SalesOrderHeaderService, CreationPayloadValidationResult } from "./protocols";
import { SalesOrderHeaderModel } from "../../models/sales-order-header";
import { SalesOrderItemModel } from "../../models/sales-order-item";
import { ProductRepository } from "../../repositories/product/protocols";
import { CustomerRepository } from "@/srv/repositories/customer/protocols";
import { ProductModel } from "@/srv/models/product";
import { CustomerModel } from "@/srv/models/customer";
import { SalesOrderLogModel } from "@/srv/models/sales-order-logs";
import { SalesOrderLogRepository } from "@/srv/repositories/sales-order-logs/protocols";
import { LoggedUserModel } from "@/srv/models/logged-user";

export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly productRepository: ProductRepository,
        private readonly salesOrderLogRepository: SalesOrderLogRepository
    ) { }

    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        const productsIds: string[] = params.items?.map((item: SalesOrderItem) => item.product_id) as string[];
        const products = await this.getProductsByIds(params);
        if (!products) {
            return {
                hasError: true,
                error: new Error('Nenhum produto encontrado para os itens da ordem de venda')
            };
        }
        const items = this.getSalesOrderItems(params, products);
        const header = this.getSalesOrderHeader(params, items);
        const customer = await this.getCustomerById(params);
        if (!customer) {
            return {
                hasError: true,
                error: new Error('Customer não encontrado')
            };
        }
        const headerValidationResult = header.validateCreationPayload({ customer_id: customer.id });
        if (headerValidationResult.hasError) {
            return headerValidationResult;
        }

        return {
            hasError: false,
            totalAmount: header.calculateDiscount()
        };
    }

    public async afterCreate(params: SalesOrderHeader, loggedUser: User): Promise<void> {
        const headerAsArray = Array.isArray(params) ? params : [params] as SalesOrderHeaders;
        const logs: SalesOrderLogModel[] = [];
        for (const header of headerAsArray) {
            const products = await this.getProductsByIds(header) as ProductModel[];
            const items = this.getSalesOrderItems(header, products as ProductModel[]);
            const salesOrderHeader = this.getExistingSalesOrderHeader(header, items);
            const productsData = salesOrderHeader.getProductsData();
            for (const product of products) {
                const foundProduct = productsData.find(productData => productData.id === product.id);
                product.sell(foundProduct?.quantity as number);
                await this.productRepository.updateStock(product);
            }
            const user = this.getLoggedUser(loggedUser);
            const log = this.getSalesOrderLog(salesOrderHeader, user);
            logs.push(log);

            // const items = header.items as SalesOrderItems;
            // const productsData = items.map((item) => ({
            //     id: item.product_id as string,
            //     quantity: item.quantity as number
            // }));
            // const productsIds = productsData.map((productData) => productData.id);
            // const productsQuery = SELECT.from('sales.Products').where({ id: productsIds });
            // const products: Products = await cds.run(productsQuery);
            // for (const productData of productsData) {
            //     const foundProduct = products.find(product => product.id === productData.id) as Product;
            //     foundProduct.stock = (foundProduct.stock as number) - productData.quantity;
            //     await cds.update('sales.Products').where({ id: foundProduct.id }).with({ stock: foundProduct.stock });
            // }

            // const headerAsString = headerAsArray.map(header => JSON.stringify(header));
            // const userAsString = JSON.stringify(req.user);
            // const log = [{
            //     header_id: header.id,
            //     userData: userAsString,
            //     orderData: headerAsString
            // }];
            // await cds.create('sales.SalesOrderLogs').entries(log);
        }
        await this.salesOrderLogRepository.create(logs);
    }

    private async getProductsByIds(params: SalesOrderHeader): Promise<ProductModel[] | null> {
        const productsIds: string[] = params.items?.map((item: SalesOrderItem) => item.product_id) as string[];
        return this.productRepository.findByIds(productsIds);
    }

    private getSalesOrderItems(params: SalesOrderHeader, products: ProductModel[]): SalesOrderItemModel[] {
        return params.items?.map(item => SalesOrderItemModel.create({
            productId: item.product_id as string,
            price: item.price as number,
            quantity: item.quantity as number,
            products
        })) as SalesOrderItemModel[];
    }

    private getSalesOrderHeader(params: SalesOrderHeader, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.create({
            customerId: params.customer_id as string,
            items
        });
    }

    private getExistingSalesOrderHeader(params: SalesOrderHeader, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.with({
            id: params.id as string,
            customerId: params.customer_id as string,
            items,
            totalAmount: params.totalAmount as number
        });
    }

    private getCustomerById(params: SalesOrderHeader): Promise<CustomerModel | null> {
        const customerId = params.customer_id as string;
        return this.customerRepository.findById(params.customer_id as string);
    }

    private getLoggedUser(loggedUser: User): LoggedUserModel {
        return LoggedUserModel.create({
            id: loggedUser.id,
            roles: loggedUser.roles as unknown as string[],
            attributes: {
                id: loggedUser.attr.id as unknown as number,
                groups: loggedUser.attr.groups as unknown as string[]
            }
        });
    }

    private getSalesOrderLog(salesOrderHeader: SalesOrderHeaderModel, user: LoggedUserModel): SalesOrderLogModel {
        return SalesOrderLogModel.create({
            headerId: salesOrderHeader.id,
            userData: salesOrderHeader.toStringfiedObject(),
            orderData: user.toStringfiedObject()
        });
    }
}