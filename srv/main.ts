import cds, { EventHandler, ResultsHandler, Service } from '@sap/cds';
import { Customers, SalesOrderItem, SalesOrderItems, Products, SalesOrderHeaders, Product } from '@models/sales';
import { customerController } from './factories/controllers/customer';
import { salesOrderHeaderController } from './factories/controllers/sales-order-header';
import { FullRequestParams } from './protocols';


export default (service: Service) => {
    service.before('READ', '*', (req) => {
        if (!req.user.is('read_only_user')) {
            return req.reject(403, 'Acesso negado');
        }
    });

    service.before(['WRITE', 'DELETE'], '*', (req) => {
        if (!req.user.is('admin')) {
            return req.reject(403, 'Acesso negado');
        }
    });

    service.after('READ', 'Customers', (customersList: Customers, request) => {
        (request as unknown as FullRequestParams<Customers>).results = customerController.afterRead(customersList);
    });

    service.before('CREATE', 'SalesOrderHeaders', async (req) => {
        const params = req.data;
        const result = await salesOrderHeaderController.beforeCreate(params);
        if (result.hasError) {
            return req.reject(400, result.error?.message as string || 'Erro ao criar ordem de venda');
        }
        req.data.totalAmount = result.totalAmount;
    });

    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders, req) => {
        const headerAsArray = Array.isArray(results) ? results : [results] as SalesOrderHeaders;
        for (const header of headerAsArray) {
            const items = header.items as SalesOrderItems;
            const productsData = items.map((item) => ({
                id: item.product_id as string,
                quantity: item.quantity as number
            }));
            const productsIds = productsData.map((productData) => productData.id);
            const productsQuery = SELECT.from('sales.Products').where({ id: productsIds });
            const products: Products = await cds.run(productsQuery);
            for (const productData of productsData) {
                const foundProduct = products.find(product => product.id === productData.id) as Product;
                foundProduct.stock = (foundProduct.stock as number) - productData.quantity;
                await cds.update('sales.Products').where({ id: foundProduct.id }).with({ stock: foundProduct.stock });
            }

            const headerAsString = headerAsArray.map(header => JSON.stringify(header));
            const userAsString = JSON.stringify(req.user);
            const log = [{
                header_id: header.id, 
                userData: userAsString, 
                orderData: headerAsString 
            }];
            await cds.create('sales.SalesOrderLogs').entries(log);
        }
    });
}