/// <reference path="../../typings/parse.d.ts" />

var CreditCard = Parse.Object.extend("CreditCard");

Parse.Cloud.define("registerCustomer", (request, response) => {
    const data = request.params;
    const user = request.user;
    if (!data || !user) {
        response.error("request.params or request.user is undefined");
        return;
    }
    let returnValue: any = null;
    if (user.get("externalCustomerId")) {
        response.success(true);
        return;
    } else {
        createCustomer(data).then((value) => {
            if (value["id"]) {
                returnValue = value;
                user.set("externalCustomerId", value["id"]);
                return user.save(null, { useMasterKey: true })
            } else {
                response.error(JSON.stringify(value));
            }
        }).then((object: Parse.Object) => {
            response.success(returnValue);
        }, (reason) => {
            response.error(reason);
        })
    }
});

Parse.Cloud.define("registerCreditCard", (request: Parse.Cloud.FunctionRequest, response: Parse.Cloud.FunctionResponse) => {
    const data = request.params;
    const user = request.user;
    if (!data || !user) {
        response.error("request.params or request.user is undefined");
        return
    }
    if (!user.get("externalCustomerId")) {
        response.error("This user doesn't have an externalCustomerId. Create a Iugu customer first.");
        return
    }
    let returnValue = null;
    createToken(data).then((value: any) => {
        if (value["id"]) {
            returnValue = value;
            const customerId = user.get("externalCustomerId") as string;
            return createPaymentMethod(customerId, value["id"], data["description"], true);
        } else {
            response.error(JSON.stringify(value));
        }
    }).then((value: any) => {
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
        const acl = new Parse.ACL(user);
        creditCard.setACL(acl);
        return creditCard.save();
    }).then((object: Parse.Object) => {
        response.success(object.toJSON());
    }, (reason) => {
        response.error(reason);
    });
});
