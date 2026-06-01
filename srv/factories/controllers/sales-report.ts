import { SalesReportController } from '@/controllers/sales-report/protocols';
import { SalesReportControllerImpl } from '@/controllers/sales-report/implementation';
import { salesOrderReportService } from '@/factories/services/sales-report';

const makeSalesReportController = (): SalesReportController => {
    return new SalesReportControllerImpl(salesOrderReportService);
};

export const salesReportController = makeSalesReportController();
