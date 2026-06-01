using {sales} from '../../db/schema';
using { db.types.SalesReportByDays } from '../../db/types';

@requires: ['authenticated-user']
// Entities
service MainService {
    entity SalesOrderHeaders  as projection on sales.SalesOrderHeaders
        actions {
            //Bound
            function teste() returns Boolean;
        };

    entity SalesOrderStatuses as projection on sales.SalesOrderStatuses;
    entity Customers          as projection on sales.Customers;
    entity Products           as projection on sales.Products;
}

// Functions
extend service MainService with {
    //Unbound
    function getSalesReportByDays(days: SalesReportByDays.Params:days) returns array of SalesReportByDays.ExpectedResult;
}

// Actions