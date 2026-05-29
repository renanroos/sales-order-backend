import { SalesOrderHeader } from '@models/sales';
import { User } from '@sap/cds';

export type CreationPayloadValidationResult = {
    hasError: boolean;
    totalAmount?: number;
    error?: Error;
};

export interface SalesOrderHeaderService {
    beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
    afterCreate(salesOrderHeader: SalesOrderHeader, loggedUser: User): Promise<void>;
}
