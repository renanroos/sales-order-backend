import { ExpectedResult as SalesReportByDays } from '@models/db/types/SalesReportByDays';
import { SalesReportController } from './protocols';
import { SalesReportService } from '@/services/sales-report/protocols';

export class SalesReportControllerImpl implements SalesReportController {
    constructor(private readonly service: SalesReportService) {}

    public async findByDays(days: number): Promise<SalesReportByDays[] | null> {
        return this.service.findByDays(days);
    }
}
