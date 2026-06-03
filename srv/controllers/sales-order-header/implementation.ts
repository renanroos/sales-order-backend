import { SalesOrderHeader } from '@models/sales';
import { User } from '@sap/cds';

import { CreationPayloadValidationResult, SalesOrderHeaderController } from './protocols';
import { Payload } from '@models/db/types/BulkCreateSalesOrder';
import { SalesOrderHeaderService } from '@/services/sales-order-headers/protocols';

export class SalesOrderHeaderControllerImpl implements SalesOrderHeaderController {
    constructor(private readonly service: SalesOrderHeaderService) {}

    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        return this.service.beforeCreate(params);
    }

    public async afterCreate(salesOrderHeader: SalesOrderHeader, loggedUser: User): Promise<void> {
        return this.service.afterCreate(salesOrderHeader, loggedUser);
    }

    public async bulkCreateSalesOrder(params: Payload[], loggedUser: User): Promise<CreationPayloadValidationResult> {
        return this.service.bulkCreateSalesOrder(params, loggedUser);
    }

    public async cloneSalesOrder(id: string, loggedUser: User): Promise<CreationPayloadValidationResult> {
        return this.service.cloneSalesOrder(id, loggedUser);
    }
}
