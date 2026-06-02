import { User } from '@sap/cds';

import { Payload as BulkCreateSalesOrderPayload } from '@models/db/types/BulkCreateSalesOrder';
import { CustomerModel } from '@/models/customer';
import { ProductModel } from '@/models/product';
import { SalesOrderHeader } from '@models/sales';

export type CreationPayloadValidationResult = {
    hasError: boolean;
    totalAmount?: number;
    products?: ProductModel[];
    customer?: CustomerModel;
    error?: Error;
    headers?: BulkCreateSalesOrderPayload[];
};

export interface SalesOrderHeaderService {
    beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
    afterCreate(salesOrderHeader: SalesOrderHeader, loggedUser: User): Promise<void>;
    bulkCreate(params: BulkCreateSalesOrderPayload[], loggedUser: User): Promise<CreationPayloadValidationResult>;
}
