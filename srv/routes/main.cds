using {sales} from '../../db/schema';

@requires: ['authenticated-user']
service MainService {
    entity SalesOrderHeaders  as projection on sales.SalesOrderHeaders actions {
        //Bound
        function teste() returns Boolean;
    };
    entity SalesOrderStatuses as projection on sales.SalesOrderStatuses;
    entity Customers          as projection on sales.Customers;
    entity Products           as projection on sales.Products;

    //Unbound
    function teste2(parametro1: String) returns Boolean;
}
