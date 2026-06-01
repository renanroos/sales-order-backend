using {MainService} from '../routes/main';

annotate MainService.SalesOrderHeaders with @(UI: {
    SelectionFields: [
        id,
        status_id,
        totalAmount,
        customer_id
    ],

    LineItem       : [
        {
            $Type                : 'UI.DataField',
            // Label                : 'ID',
            //'{i18n>id}',
            Value                : id,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '18rem'
            }
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Cliente',
            Value                : customer.id,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '20rem'
            },
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Status',
            Value                : status.id,
            Criticality : (status.id = 'COMPLETED' ? 3 : (status.id = 'PENDING' ? 2 : 1 )),
            CriticalityRepresentation: #WithoutIcon,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '10rem'
            },
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Valor Total',
            Value                : totalAmount,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '10rem'
            },
        },
        {
            $Type                : 'UI.DataField',
            // Label                : 'Data de criação',
            Value                : createdAt,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '15rem'
            },
        },
        {
            $Type                : 'UI.DataField',
            // Label                : 'Criado por',
            Value                : createdBy,
            ![@HTML5.CssDefaults]: {
                $Type: 'HTML5.CssDefaultType',
                width: '20rem'
            },
        }
    ]
}) {
    id          @title: 'ID';
    totalAmount @title: 'Valor Total';
    createdAt   @title: 'Data de criação';
    createdBy   @title: 'Criado por';
    customer    @(
        title : 'Cliente',
        Common: {
            Label    : 'Cliente',
            Text     : customer.firstName,
            ValueList: {
                $Type         : 'Common.ValueListType',
                CollectionPath: 'Customers',
                Parameters    : [
                    {
                        $Type                : 'Common.ValueListParameterInOut',
                        ValueListProperty    : 'id',
                        LocalDataProperty    : 'customer_id',
                    },
                    {
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'firstName',
                    },
                    {
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'lastName',
                    },
                    {
                        $Type            : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'email',
                    },
                ]
            },
        }
    );
    status @(
        title: 'Status',
        Common: {
            Label    : 'Status',
            TextArrangement : #TextOnly,
            Text            : status.description,
            ValueListWithFixedValues,
            ValueList: {
                $Type         : 'Common.ValueListType',
                CollectionPath: 'SalesOrderStatuses',
                Parameters    : [
                    {
                        $Type                : 'Common.ValueListParameterInOut',
                        ValueListProperty    : 'id',
                        LocalDataProperty    : 'status_id',
                    }
                ]
            }
        }
    );
}


annotate MainService.SalesOrderStatuses with {
    id @Common.Text: description @Common.TextArrangement: #TextOnly;
}