import cds from '@sap/cds';

import { SalesOrderHeaderModel } from '@/models/sales-order-header';
import { SalesOrderHeaderRepository } from './protocols';

export class SalesOrderHeaderRepositoryImpl implements SalesOrderHeaderRepository {
    public async bulkCreate(headers: SalesOrderHeaderModel[]): Promise<void> {
        const headerObjects = headers.map((headers) => headers.toCreationObject());
        await cds.create('sales.SalesOrderHeaders').entries(headerObjects);
    }
}
