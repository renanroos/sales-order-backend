import { CustomerRepositoryImpl } from '@/repositories/customer/implementation';
import { ProductRepositoryImpl } from '@/repositories/product/implementation';
import { SalesOrderHeaderRepositoryImpl } from '@/repositories/sales-order-header/implementation';
import { SalesOrderHeaderService } from '@/services/sales-order-headers/protocols';
import { SalesOrderHeaderServiceImpl } from '@/services/sales-order-headers/implementation';
import { SalesOrderLogRepositoryImpl } from '@/repositories/sales-order-logs/implementation';

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const salesOrderHeaderRepository = new SalesOrderHeaderRepositoryImpl();
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRepository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(
        salesOrderHeaderRepository,
        customerRepository,
        productRepository,
        salesOrderLogRepository
    );
};

export const salesOrderHeaderService = makeSalesOrderHeaderService();
