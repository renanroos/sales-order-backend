import cds, { EventHandler, ResultsHandler, Service } from '@sap/cds';
import { Customers } from '@models/sales';

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
        if(!params.customer_id) {
            return req.reject(400, 'Customer Inválido');
        }

        if(!params.items || params.items.length === 0) {
            return req.reject(400, 'A ordem de venda deve conter pelo menos um item');
        }

        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id });
        const customer = await cds.run(customerQuery);
        if (!customer) {
            return req.reject(404, 'Customer não encontrado');
        }
    });
}