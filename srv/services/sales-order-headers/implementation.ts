import { SalesOrderHeader, SalesOrderHeaders } from '@models/sales';
import { User } from '@sap/cds';

import { CreationPayloadValidationResult, SalesOrderHeaderService } from './protocols';
import { Payload as BulkCreateSalesOrderPayload } from '@models/db/types/BulkCreateSalesOrder';
import { CustomerModel } from '@/models/customer';
import { CustomerRepository } from '@/repositories/customer/protocols';
import { LoggedUserModel } from '@/models/logged-user';
import { ProductModel } from '@/models/product';
import { ProductRepository } from '@/repositories/product/protocols';
import { SalesOrderHeaderModel } from '@/models/sales-order-header';
import { SalesOrderHeaderRepository } from '@/repositories/sales-order-header/protocols';
import { SalesOrderItemModel } from '@/models/sales-order-item';
import { SalesOrderLogModel } from '@/models/sales-order-logs';
import { SalesOrderLogRepository } from '@/repositories/sales-order-logs/protocols';

export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly salesOrderHeaderRepository: SalesOrderHeaderRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly productRepository: ProductRepository,
        private readonly salesOrderLogRepository: SalesOrderLogRepository
    ) {}

    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        const productsValidationResult = await this.validadeProductsOnCreation(params);
        if (productsValidationResult.hasError) {
            return {
                hasError: true,
                error: new Error('Nenhum produto encontrado para os itens da ordem de venda')
            };
        }
        const items = this.getSalesOrderItems(params, productsValidationResult.products as ProductModel[]);
        const header = this.getSalesOrderHeader(params, items);
        const customerValidationResult = await this.validateCustomerOnCreation(params);
        if (customerValidationResult.hasError) {
            return {
                hasError: true,
                error: new Error('Customer não encontrado')
            };
        }
        const headerValidationResult = header.validateCreationPayload({
            customer_id: (customerValidationResult.customer as CustomerModel).id
        });
        if (headerValidationResult.hasError) {
            return headerValidationResult;
        }

        return {
            hasError: false,
            totalAmount: header.calculateDiscount()
        };
    }

    public async afterCreate(
        params: SalesOrderHeader | BulkCreateSalesOrderPayload[],
        loggedUser: User
    ): Promise<void> {
        const headerAsArray = Array.isArray(params) ? params : ([params] as SalesOrderHeaders);
        const logs: SalesOrderLogModel[] = [];
        for (const header of headerAsArray) {
            const products = (await this.getProductsByIds(header)) as ProductModel[];
            const items = this.getSalesOrderItems(header, products as ProductModel[]);
            const salesOrderHeader = this.getExistingSalesOrderHeader(header, items);
            const productsData = salesOrderHeader.getProductsData();
            for (const product of products) {
                const foundProduct = productsData.find((productData) => productData.id === product.id);
                product.sell(foundProduct?.quantity as number);
                await this.productRepository.updateStock(product);
            }
            const user = this.getLoggedUser(loggedUser);
            const log = this.getSalesOrderLog(salesOrderHeader, user);
            logs.push(log);
        }
        await this.salesOrderLogRepository.create(logs);
    }

    public async bulkCreateSalesOrder(
        headers: BulkCreateSalesOrderPayload[],
        loggedUser: User
    ): Promise<CreationPayloadValidationResult> {
        const bulkCreateHeaders: SalesOrderHeaderModel[] = [];
        for (const headerObject of headers) {
            const productValidationResult = await this.validadeProductsOnCreation(headerObject);
            if (productValidationResult.hasError) {
                return productValidationResult;
            }

            const items = this.getSalesOrderItems(headerObject, productValidationResult.products as ProductModel[]);
            const header = this.getSalesOrderHeader(headerObject, items);
            const customerValidationResult = await this.validateCustomerOnCreation(headerObject);
            if (customerValidationResult.hasError) {
                return customerValidationResult;
            }
            const headerValidationResult = header.validateCreationPayload({
                customer_id: (customerValidationResult.customer as CustomerModel).id
            });
            if (headerValidationResult.hasError) {
                return headerValidationResult;
            }
            bulkCreateHeaders.push(header);
        }
        await this.salesOrderHeaderRepository.bulkCreateSalesOrder(bulkCreateHeaders);
        await this.afterCreate(headers, loggedUser);
        return this.serializeBulkCreateResult(bulkCreateHeaders);
    }

    public async cloneSalesOrder(id: string, loggedUser: User): Promise<CreationPayloadValidationResult> {
        const header = await this.salesOrderHeaderRepository.findCompleteSalesOrderById(id);
        if (!header) {
            return {
                hasError: true,
                error: new Error('Pedido não encontrado')
            };
        }

        const headerValidationResult = header.validateCreationPayload({
            customer_id: header.customerId
        });
        if (headerValidationResult.hasError) {
            return headerValidationResult;
        }
        await this.salesOrderHeaderRepository.bulkCreateSalesOrder([header]);
        await this.afterCreate([header.toCreationObject()], loggedUser);
        return this.serializeBulkCreateResult([header]);
    }

    private serializeBulkCreateResult(headers: SalesOrderHeaderModel[]): CreationPayloadValidationResult {
        return {
            hasError: false,
            headers: headers.map((header) => header.toCreationObject())
        };
    }

    private async validadeProductsOnCreation(
        header: SalesOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<CreationPayloadValidationResult> {
        const products = await this.getProductsByIds(header);
        if (!products) {
            return {
                hasError: true,
                error: new Error('Nenhum produto encontrado para os itens da ordem de venda')
            };
        }
        return {
            hasError: false,
            products
        };
    }

    private async validateCustomerOnCreation(
        header: SalesOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<CreationPayloadValidationResult> {
        const customer = await this.getCustomerById(header);
        if (!customer) {
            return {
                hasError: true,
                error: new Error('Customer não encontrado')
            };
        }
        return {
            hasError: false,
            customer
        };
    }

    private async getProductsByIds(
        params: SalesOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<ProductModel[] | null> {
        const productsIds: string[] = params.items?.map((item) => item.product_id) as string[];
        return this.productRepository.findByIds(productsIds);
    }

    private getSalesOrderItems(
        params: SalesOrderHeader | BulkCreateSalesOrderPayload,
        products: ProductModel[]
    ): SalesOrderItemModel[] {
        return params.items?.map((item) =>
            SalesOrderItemModel.create({
                productId: item.product_id as string,
                price: item.price as number,
                quantity: item.quantity as number,
                products
            })
        ) as SalesOrderItemModel[];
    }

    private getSalesOrderHeader(
        params: SalesOrderHeader | BulkCreateSalesOrderPayload,
        items: SalesOrderItemModel[]
    ): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.create({
            customerId: params.customer_id as string,
            items
        });
    }

    private getExistingSalesOrderHeader(
        params: SalesOrderHeader | BulkCreateSalesOrderPayload,
        items: SalesOrderItemModel[]
    ): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.with({
            id: params.id as string,
            customerId: params.customer_id as string,
            items,
            totalAmount: params.totalAmount as number
        });
    }

    private getCustomerById(params: SalesOrderHeader | BulkCreateSalesOrderPayload): Promise<CustomerModel | null> {
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
