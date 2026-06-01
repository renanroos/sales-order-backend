export interface SalesReportService {
    findByDays(days: number): Promise<SalesReportByDays[] | null>;
}
