### Required apiKey and accountId
### Get accountId: https://app.iugu.com/account

```javascript
const apiKey = '6f9fe8ec0a96bd4d441741015ed25ghh';
const accountKey = 'A083919DEE244A0FA2705E309B378CD';
```

### Direct payment
```javascript
Parse.Cloud.define("createPayment", (request, response) => {
    createNewPayment({
        tokenId: apiKey,
        directPayment: true,
        customer: {
            email: 'usuarioavulso@gmail.com',
        },
        creditCard: {
            number: '4111111111111111',
            CVV: '123',
            firstName: 'Fulano',
            lastName: 'D Silva',
            month: '12',
            year: '2020',
        },
        items: [
            { description: 'Vaga 01', quantity: 1, price_cents: 1000 },
        ],
        }).then(success => response.success(success)).catch((error) => response.error(error));
});
```

### User and credit card registered
```javascript
Parse.Cloud.define("createPaymentUserCreditCard", (request, response) => {
    createNewPayment({
        tokenId: apiKey,
        accountId: accountKey,
        directPayment: false,
        customer: {
            id: '6FAC7358746246E9A12132D040405A68'
        },
        creditCard: {
            id: '9C0740CA93434A39977F83BAC5F9EDB0'
        },
        dueDate: '30/12/2017',
        items: [
            { description: 'Vaga 01', quantity: 1, price_cents: 1000 },
        ],
    }).then(success => response.success(success)).catch((error) => response.error(error));
});
```

### Registered user, saving a new credit card
```javascript
Parse.Cloud.define("createPaymentUserNewCreditCard", (request, response) => {
    createNewPayment({
        tokenId: apiKey,
        accountId: accountKey,
        directPayment: false,
        customer: {
            id: '6FAC7358746246E9A12132D040405A68'
        },
        creditCard: {
            number: '4111111111111111',
            CVV: '123',
            firstName: 'Fulano',
            lastName: 'D Silva',
            month: '12',
            year: '2020',
            save: true,
            description: 'Meu Cartão VISA',
            isDefault: true,
        },
        dueDate: '30/12/2017',
        items: [
            { description: 'Vaga 01', quantity: 1, price_cents: 1000 },
        ],
    }).then(success => response.success(success)).catch((error) => response.error(error));
});
```

### Saving user and credit card
```javascript
Parse.Cloud.define("createPaymentUserNew", (request, response) => {
    createNewPayment({
        tokenId: apiKey,
        accountId: accountKey,
        directPayment: false,
        customer: {
            email: 'fulano@teste.com',
            name: 'Fulano da Silva',
            notes: 'Anotações Gerais',
            cpfCnpj: '736.644.016-70',
            zipCode: '57063-880',
            number: '70',
            street: 'Rua de Baixo',
            city: 'Maceió',
            state: 'AL',
            district: 'Farol',
            complement: 'APT 200',
            customVariables: [],
        },
        creditCard: {
            number: '4111111111111111',
            CVV: '123',
            firstName: 'Fulano',
            lastName: 'D Silva',
            month: '12',
            year: '2020',
            save: true,
            description: 'Meu Cartão VISA',
            isDefault: true,
        },
        dueDate: '27/04/2017',
        items: [
            { description: 'Vaga 01', quantity: 1, price_cents: 1000 },
        ],
    }).then(success => response.success(success)).catch((error) => response.error(error));
});
```
