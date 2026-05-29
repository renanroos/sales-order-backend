import { SalesOrderHeader } from "@models/sales";

import { CreationPayloadValidationResult, SalesOrderHeaderController } from "./protocols";
import { SalesOrderHeaderService } from "../../services/sales-order-headers/protocols";

export class SalesOrderHeaderControllerImpl implements SalesOrderHeaderController {
    constructor(private readonly service: SalesOrderHeaderService) {};

    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        return this.service.beforeCreate(params);
    }
}