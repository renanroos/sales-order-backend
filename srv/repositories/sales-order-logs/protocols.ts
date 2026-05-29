import { SalesOrderLogModel } from "../../models/sales-order-logs";

export interface SalesOrderLogRepository {
    create(logs: SalesOrderLogModel[]): Promise<void>;
}