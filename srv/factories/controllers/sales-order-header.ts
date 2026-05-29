import { CustomerRepositoryImpl } from '@/repositories/customer/implementation';
import { ProductRepositoryImpl } from '@/repositories/product/implementation';
import { SalesOrderHeaderController } from '@/controllers/sales-order-header/protocols';
import { SalesOrderHeaderServiceImpl } from '@/services/sales-order-headers/implementation';
import { SalesOrderLogRepositoryImpl } from '@/repositories/sales-order-logs/implementation';

const makeSalesOrderHeaderController = (): SalesOrderHeaderController => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRepository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository, salesOrderLogRepository);
};

export const salesOrderHeaderController = makeSalesOrderHeaderController();
