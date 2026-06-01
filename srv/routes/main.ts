/* eslint-disable max-lines-per-function */
import '../configs/module-alias';

import { Service } from '@sap/cds';

import { Customers, SalesOrderHeader } from '@models/sales';
import { FullRequestParams } from '@/routes/protocols';
import { customerController } from '@/factories/controllers/customer';
import { salesOrderHeaderController } from '@/factories/controllers/sales-order-header';
import { salesReportController } from '@/factories/controllers/sales-report';

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
        const result = await salesOrderHeaderController.beforeCreate(req.data);
        if (result.hasError) {
            return req.reject(400, (result.error?.message as string) || 'Erro ao criar ordem de venda');
        }
        req.data.totalAmount = result.totalAmount;
    });
    service.after('CREATE', 'SalesOrderHeaders', async (req) => {
        await salesOrderHeaderController.afterCreate(req.data as SalesOrderHeader, req.user);
    });
    service.on('teste', async (req) => {
        console.log(`params: ${JSON.stringify(req.params)}`);
        console.log(`data: ${JSON.stringify(req.data)}`);
        return true;
    });
    service.on('getSalesReportByDays', async (req) => {
        const days = req.data?.days || 7;
        return salesReportController.findByDays(days);
    });
};
