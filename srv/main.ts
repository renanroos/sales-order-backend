import cds, { EventHandler, ResultsHandler, Service } from '@sap/cds';
import { Customers, SalesOrderItem, SalesOrderItems, Products, SalesOrderHeaders, Product } from '@models/sales';
import { request } from 'axios';

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

        let totalAmount = 0;
        items.forEach((item) => {
            totalAmount += (item.price as number) * (item.quantity as number);
        });
        req.data.totalAmount = totalAmount;
        console.log('Total Amount:', totalAmount);
    });

    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders) => {
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
        }
    });
}