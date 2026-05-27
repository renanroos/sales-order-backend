import cds, { EventHandler, ResultsHandler, Service } from '@sap/cds';
import { Customers, SalesOrderItem, SalesOrderItems, Products } from '@models/sales';

export default (service: Service) => {
    service.after('READ', 'Customers', (results: Customers) => {
        results.forEach(customer => {
            if (!customer.email?.includes('@')) {
                customer.email = '${customer.email}@gmail.com';
            }
        });
    });

    service.before('CREATE', 'SalesOrderHeaders', async (req) => {
        const params = req.data;
        const items: SalesOrderItems = params.items;
        if (!params.customer_id) {
            return req.reject(400, 'Customer Inválido');
        }

        if (!params.items || params.items.length === 0) {
            return req.reject(400, 'A ordem de venda deve conter pelo menos um item');
        }

        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id });
        const customer = await cds.run(customerQuery);
        if (!customer) {
            return req.reject(404, 'Customer não encontrado');
        }

        const productsIds: string[] = params.items.map((item: SalesOrderItem) => item.product_id);
        const productsQuery = SELECT.from('sales.Products').where({ id: productsIds });
        const products: Products = await cds.run(productsQuery);
        // const dbProducts = products.map((product) => product.id);
        for (const item of items) {
            const dbProduct = products.find(product => product.id === item.product_id);
            if (!dbProduct) {
                return req.reject(404, `Produto com id ${item.product_id} não encontrado`);
            }

            // if(!productsIds.every(productId  => dbProducts.includes(productId)) ) {
            //     return req.reject(404, 'Produto não encontrado');
            // }
            if (dbProduct.stock === 0) {
                return req.reject(400, `Produto ${dbProduct.name} sem estoque disponível`);
            }
        }
    });
}