
import { SalesOrderHeaderServiceImpl } from "@/srv/services/sales-order-headers/implementation";
import { SalesOrderHeaderService } from "../../services/sales-order-headers/protocols";
import { ProductRepositoryImpl } from "@/srv/repositories/product/implementation";
import { CustomerRepositoryImpl } from "@/srv/repositories/customer/implementation";

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository);
}

export const salesOrderHeaderService = makeSalesOrderHeaderService();