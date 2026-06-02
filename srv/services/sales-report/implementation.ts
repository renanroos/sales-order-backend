import { ExpectedResult as SalesReportByDays } from '@models/db/types/SalesReportByDays';
import { SalesReportRepository } from '@/repositories/sales-report/protocols';
import { SalesReportService } from './protocols';

export class SalesReportServiceImpl implements SalesReportService {
    constructor(private readonly repository: SalesReportRepository) {}
    public async findByDays(days = 7): Promise<SalesReportByDays[] | null> {
        const reportData = await this.repository.findByDays(days);
        if (reportData === null) {
            return null;
        }
        return reportData?.map((r) => r.toObject());
    }

    public async findByCustomerId(customerId: string): Promise<SalesReportByDays[] | null> {
        const reportData = await this.repository.findByCustomerId(customerId);
        if (reportData === null) {
            return null;
        }
        return reportData?.map((r) => r.toObject());
    }
}
