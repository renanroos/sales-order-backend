import { CustomerRepositoryImpl } from '@/srv/repositories/customer/implementation';
import { ProductRepositoryImpl } from '@/srv/repositories/product/implementation';
import { SalesOrderHeaderService } from '../../services/sales-order-headers/protocols';
import { SalesOrderHeaderServiceImpl } from '@/srv/services/sales-order-headers/implementation';
import { SalesOrderLogRepositoryImpl } from '@/srv/repositories/sales-order-logs/implementation';

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRepository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository, salesOrderLogRepository);
};

export const salesOrderHeaderService = makeSalesOrderHeaderService();
