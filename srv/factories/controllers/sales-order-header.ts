import { SalesOrderHeaderServiceImpl } from "@/srv/services/sales-order-headers/implementation";
import { CustomerRepositoryImpl } from "@/srv/repositories/customer/implementation";
import { ProductRepositoryImpl } from "@/srv/repositories/product/implementation";
import { SalesOrderHeaderController } from "@/srv/controllers/sales-order-header/protocols";

const makeSalesOrderHeaderController = (): SalesOrderHeaderController => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository);
}

export const salesOrderHeaderController = makeSalesOrderHeaderController();