import { SalesOrderHeaderServiceImpl } from "@/srv/services/sales-order-headers/implementation";
import { CustomerRepositoryImpl } from "@/srv/repositories/customer/implementation";
import { ProductRepositoryImpl } from "@/srv/repositories/product/implementation";
import { SalesOrderHeaderController } from "@/srv/controllers/sales-order-header/protocols";
import { SalesOrderLogRepositoryImpl } from "@/srv/repositories/sales-order-logs/implementation";

const makeSalesOrderHeaderController = (): SalesOrderHeaderController => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRepository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository, salesOrderLogRepository);
}

export const salesOrderHeaderController = makeSalesOrderHeaderController();