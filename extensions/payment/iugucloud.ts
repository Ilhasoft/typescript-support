/// <reference path="../../typings/parse.d.ts" />

var CreditCard = Parse.Object.extend("CreditCard");

Parse.Cloud.define("registerCustomer", (request: Parse.Cloud.FunctionRequest, response: Parse.Cloud.FunctionResponse) => {
    const data = request.params;
    createCustomer(data).then((value) => {
        const user = request.user
        if (value["id"]) {
            user.set("externalCustomerId", value["id"]);
            user.save(null, { useMasterKey: true }).then((object: Parse.Object) => {
                response.success(value);
            }, (reason) => {
                response.error(reason);
            });
        } else {
            response.error(JSON.stringify(value));
        }
    }, (reason) => {
        response.error(reason);
    });
});

Parse.Cloud.define("registerCreditCard", (request: Parse.Cloud.FunctionRequest, response: Parse.Cloud.FunctionResponse) => {
    const data = request.params;
    const user = request.user;

    if (!user.get("externalCustomerId")) {
        return response.error("This user doesn't have an externalCustomerId. Create a Iugu customer first.");
    }

    let returnValue = null;
    createToken(data).then((value) => {
        if (value["id"]) {
            returnValue = value;
            const customerId = user.get("externalCustomerId") as string;
            return createPaymentMethod(customerId, value["id"], data["description"], true);
        }
    }).then((value) => {
        let creditCard: Parse.Object = new CreditCard();
        creditCard.set("cardExternalId", value["id"]);
        creditCard.set("cpf", data["cpf"]);
        creditCard.set("flag", data["flag"]);
        creditCard.set("yearOfValidity", Number(data["year"]));
        creditCard.set("monthOfValidity", Number(data["month"]));
        const cardNumber = data["number"] as string;
        const lastDigits = cardNumber.substring(cardNumber.length - 4, cardNumber.length);
        creditCard.set("lastDigits", lastDigits);
        creditCard.set("user", user);
        creditCard.set("name", data["description"]);
        creditCard.save().then((object: Parse.Object) => {
            response.success(object.toJSON());
        }, (reason) => {
            response.error(reason);
        })
    }, (reason) => {
        response.error(reason);
    });
});
