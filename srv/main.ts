import { Customer, Customers } from '@models/sales';

const customer: Customer = {
    email: 'teste@teste.com',
    firstName: 'Renan',
    id: '12345678-1234-1234-1234-123456789012',
    lastName: 'Roos'
}

const customers: Customers = [customer];

const funcao = (variavel: string) => console.log(variavel); 
funcao('Hello World');