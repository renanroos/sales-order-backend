using {MainService} from '../routes/main';

annotate MainService.SalesOrderHeaders with @(
    Capabilities: {
        DeleteRestrictions: {
            $Type: 'Capabilities.DeleteRestrictionsType',
            Deletable: false
        },
        // FilterFunctions: [ 'tolower' ],
        FilterRestrictions: {
        $Type                       : 'Capabilities.FilterRestrictionsType',
        FilterExpressionRestrictions: [{
            $Type             : 'Capabilities.FilterExpressionRestrictionType',
            Property          : createdAt,
            AllowedExpressions: ['SingleRange']
        }, 
        {
            Property: id,
            AllowedExpressions: ['SearchExpression']
        }]
    }},
    UI          : {
        SelectionFields   : [
            id,
            status_id,
            totalAmount,
            customer_id
        ],

        LineItem          : [
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
                $Type                    : 'UI.DataField',
                Label                    : 'Status',
                Value                    : status.id,
                Criticality              : (status.id = 'COMPLETED' ? 3 : (status.id = 'PENDING' ? 2 : 1)),
                CriticalityRepresentation: #WithoutIcon,
                ![@HTML5.CssDefaults]    : {
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
        ],
        HeaderInfo        : {
            @Type         : 'UI.HeaderInfoType',
            TypeName      : 'Pedido',
            TypeNamePlural: 'Pedidos',
            Title         : {
                $Type: 'UI.DataField',
                Value: 'Pedido: {id}',
            },
        },
        Facets            : [
            {
                $Type : 'UI.CollectionFacet',
                ID    : 'salesOrderHeader',
                Label : 'Informações do Cabeçalho do Pedido',
                Facets: [{
                    $Type : 'UI.ReferenceFacet',
                    Target: '@UI.FieldGroup#header',
                }]
            },
            {
                $Type : 'UI.CollectionFacet',
                ID    : 'salesOrderCustomer',
                Label : 'Dados do Cliente',
                Facets: [{
                    $Type : 'UI.ReferenceFacet',
                    Target: 'customer/@UI.FieldGroup#CustomerData',
                }]
            },
            {
                $Type : 'UI.CollectionFacet',
                ID    : 'salesOrderItems',
                Label : 'Itens do Pedido',
                Facets: [{
                    $Type : 'UI.ReferenceFacet',
                    Target: 'items/@UI.LineItem',
                }]
            },
        ],
        FieldGroup #header: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Label: 'ID',
                    Value: id,
                },
                {
                    $Type: 'UI.DataField',
                    Label: 'Valor Total',
                    Value: totalAmount,
                },
                {
                    $Type: 'UI.DataField',
                    Label: 'Criado por',
                    Value: createdBy,
                }
            ]
        },
    }
) {
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
                        $Type            : 'Common.ValueListParameterInOut',
                        ValueListProperty: 'id',
                        LocalDataProperty: 'customer_id',
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
    status      @(
        title : 'Status',
        Common: {
            Label          : 'Status',
            TextArrangement: #TextOnly,
            Text           : status.description,
            ValueListWithFixedValues,
            ValueList      : {
                $Type         : 'Common.ValueListType',
                CollectionPath: 'SalesOrderStatuses',
                Parameters    : [{
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'id',
                    LocalDataProperty: 'status_id',
                }]
            }
        }
    );
}


annotate MainService.SalesOrderStatuses with {
    id  @Common.Text: description  @Common.TextArrangement: #TextOnly;
};

annotate MainService.Customers with @(UI: {FieldGroup #CustomerData: {
    $Type: 'UI.FieldGroupType',
    Data : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: id,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nome',
            Value: firstName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Sobrenome',
            Value: lastName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'E-mail',
            Value: email,
        }
    ]
}});

annotate MainService.SalesOrderItems with @(UI: {LineItem: [
    {
        $Type                : 'UI.DataField',
        Label                : 'ID',
        Value                : id,
        ![@HTML5.CssDefaults]: {
            $Type: 'HTML5.CssDefaultType',
            width: '18rem'
        }
    },
    {
        $Type                : 'UI.DataField',
        Label                : 'Produto',
        Value                : product.name,
        ![@HTML5.CssDefaults]: {
            $Type: 'HTML5.CssDefaultType',
            width: '10rem'
        }
    },
    {
        $Type: 'UI.DataField',
        Label: 'Quantidade',
        Value: quantity,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Preço',
        Value: price,
    }
]}) {
    header  @UI.Hidden;
    product @UI.Hidden;
};
