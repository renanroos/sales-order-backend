import { User } from "@sap/cds";
import { SalesOrderHeader } from "@models/sales";

export type CreationPayloadValidationResult = {
    hasError: boolean;
    totalAmount?: number;
    error?: Error;
};

export interface SalesOrderHeaderController {
    beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
    afterCreate(salesOrderHeader: SalesOrderHeader, loggedUser: User): Promise<void>;
}