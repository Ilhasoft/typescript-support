/// <reference path="../../typings/parse.d.ts" />

declare const require: any;
const request = require('request');

let apiToken = '';
let accountId = '';
let authToken = '';
let urlApi = 'https://api.iugu.com/v1/';

/**
 * Init API Iugu
 * @param {String} token
 * @param {String} account
 * @returns {Object}
 */
function initIugu(token: string, account: string) {
  apiToken = token;
  accountId = account;
}

/**
 * Get a customer data
 * @param {String} customerId
 * @returns {Object}
 */
function getCustomer(customerId: string) {
  return getFromRest({
    api_token: apiToken,
    customer_id: customerId,
  }, `customers/${customerId}`);
}

/**
 * Create a customer
 * @param {Object} data: { email, name, notes, cpfCnpj, zipCode, number, street, city, state, district, complement, customVariables }
 * @returns {Object}
 */
function createCustomer(data: { [key: string]: any}): Parse.Promise<any> {
  return sendToRest({
    api_token: apiToken,
    email: data["email"],
    name: data["name"],
    notes: data["notes"],
    cpf_cnpj: data["cpfCnpj"],
    zip_code: data["zipCode"],
    number: data["number"],
    street: data["street"],
    city: data["city"],
    state: data["state"],
    district: data["district"],
    complement: data["complement"],
    custom_variables: data["customVariables"],
  }, 'customers');
};

/**
 * Get list payment methods
 * @param {String} customerId
 * @returns {Object}
 */
function getCustomerPaymentMethods(customerId: string): Parse.Promise<any> {
  return getFromRest({
    api_token: apiToken,
    customer_id: customerId,
  }, `customers/${customerId}/payment_methods`);
};

/**
 * Create credit card token
 * @param {Object} data: { number, CVV, firstName, lastName, month, year }
 */
function createToken(data: { [key: string]: any}, method: string = 'credit_card', test: boolean = false): Parse.Promise<any> {
  return sendToRest({
    account_id: accountId,
    method: method,
    test: test,
    data: {
      number: data["number"],
      verification_value: data["CVV"],
      first_name: data["firstName"],
      last_name: data["lastName"],
      month: data["month"],
      year: data["year"],
    }
  }, 'payment_token');
};

/**
 * Create a payment method from customer
 * @param {String} customerId
 * @param {String} tokenId
 * @param {String} description
 * @param {Boolean} isDefault
 */
function createPaymentMethod(customerId: string, tokenId: string, description: string = '', isDefault: boolean = true): Parse.Promise<any> {
  return sendToRest({
    api_token: apiToken,
    customer_id: customerId,
    token: tokenId,
    description: description,
    set_as_default: isDefault,
  }, `customers/${customerId}/payment_methods`);
};

/**
 * Delete an existing payment method from customer
 * @param {string} customerId
 * @param {string} paymentId
 */
function deletePaymentMethod(customerId: string, paymentMethodId: string): Parse.Promise<any> {
    return deleteFromRest({
      api_token: apiToken
    }, `customers/${customerId}/payment_methods/${paymentMethodId}`);
}

/**
 * Create a new invoice
 * @param {Object} email
 * @param {String} customerId
 * @param {String} dueDate
 * @param {Array} items: { description, quantity, price_cents }
 * @returns {Object}
 */
function createInvoice(email: string, customerId: string, dueDate: string, items: any[]): Parse.Promise<any> {
  return sendToRest({
    api_token: apiToken,
    email: email,
    customer_id: customerId,
    due_date: dueDate,
    items: items,
  }, 'invoices');
};

/**
 * Create a charge from customer
 * @param {String} cpmId
 * @param {String} customerId
 * @param {String} invoiceId
 * @returns {Object}
 */
function createChargeCustomer(cpmId: string, customerId: string, invoiceId: string, tokenId: string): Parse.Promise<any> {
  const data: any = {
    api_token: apiToken,
    customer_id: customerId,
    invoice_id: invoiceId,
  };

  if (cpmId) {
    data.customer_payment_method_id = cpmId;
  }

  if (tokenId && tokenId !== '') {
    data.token = tokenId;
  }

  return sendToRest(data, 'charge');
};

/**
 * Create a direct charge
 * @param {String} tokenId
 * @param {String} email
 * @param {Array} items
 * @param {String} method
 * @returns {Object}
 */
function createCharge(email: string, items: Array<{}>, tokenId: any = null, method: string = 'bank_slip'): Parse.Promise<any> {
  const data: any = {
    email: email,
    items: items,
  };

  if (!tokenId || tokenId === '') {
    data.method = method;
  }

  if (tokenId && tokenId !== '') {
    data.token = tokenId;
  }

  return sendToRest(data, `charge?api_token=${apiToken}`);
};

/**
 * Create new payment
 * @param {Object} data 
 * @returns {Object}
 */
function createNewPayment(data: any): Parse.Promise<any> {
  // const iugu = initIugu(data.tokenId, data.accountId);
  let promise = new Parse.Promise();
  let dataReturn = {};
  if (data.directPayment === true) {
    if (data.creditCard) {
      createToken(data.creditCard).then((token: any) => {
        return createCharge(data.customer.email, data.items, token.id);
      }).then((response: any) => {
        promise.resolve(response);
      }, (error) => {
        promise.reject(error);
      });
    } else {
      return Parse.Promise.error('CREDIT CARD REQUIRED');
    }
  } else {
    if (data.customer.id) {
      getCustomer(data.customer.id).then((customer: any) => {
        if (!data.creditCard.id) {
          return paymentWithNewCreditCard(customer, data);
        } else {
          return paymentWithPaymentMethod(customer, data);
        }
      }).then((response: any) => {
        promise.resolve(response);
      }, (error) => {
        promise.reject(error);
      });
    } else {
      createCustomer(data.customer).then((customer: any) => {
        return paymentWithNewCreditCard(customer, data);
      }).then((response) => {
        promise.resolve(response);
      }, (error) => {
        promise.reject(error);
      });
    }
  }
  return promise;
};

function paymentWithNewCreditCard(customer: any, data: any): Parse.Promise<any> {
  if (!data.creditCard) {
    return Parse.Promise.error("CREDIT CARD DATA REQUIRED");
  }
  let promise = new Parse.Promise();
  const dataReturn: any = {};
  dataReturn.customer = customer;
  createToken(data.creditCard).then((token: any) => {
    dataReturn.token = token;
    if (customer && token && data.creditCard.save === true) {
      createPaymentMethod(customer.id, token.id, data.creditCard.description, data.creditCard.isDefault).then((cpm: any) => {
        dataReturn.cpm = cpm;
        return createInvoice(customer.email, customer.id, data.dueDate, data.items);
      }).then((invoice) => {
        return createChargeCustomer(dataReturn.cpm["id"], customer["id"], invoice["id"], '');
      }).then((charge: any) => {
        dataReturn.charge = charge;
        promise.resolve(dataReturn);
      }, (error) => {
        promise.reject(error);
      });
    } else {
      createInvoice(customer.email, customer.id, data.dueDate, data.items).then((invoice: any) => {
        dataReturn.invoice = invoice;
        return createChargeCustomer('', customer.id, invoice.id, token.id);
      }).then((charge: any) => {
        dataReturn.charge = charge;
        promise.resolve(dataReturn);
      }, (error) => {
        promise.reject(error);
      });
    }
  });
  return promise;
}

/**
 * Cerates a payment with an existing payment method
 * @param customer the customer object
 * @param data 
 */
function paymentWithPaymentMethod(customer: any, data: any): Parse.Promise<any> {
  if (!data.creditCard.id) {
    return Parse.Promise.error('PAYMENT METHOD ID REQUIRED');
  }
  let promise = new Parse.Promise<any>();
  const dataReturn: any = {};
  dataReturn.customer = customer;
  createInvoice(customer.email, customer.id, data.dueDate, data.items).then((invoice: any) => {
    dataReturn.invoice = invoice;
    return createChargeCustomer(data.creditCard.id, customer.id, invoice.id, '');
  }).then((charge: any) => {
    dataReturn.charge = charge;
    promise.resolve(dataReturn);
  }, (error) => {
    promise.reject(error);
  });
  return promise;
}

/**
 * Refund a invoice
 * @param {String} apiToken
 * @param {String} invoiceId 
 */
function refundInvoice(apiToken: String, invoiceId: String): Parse.Promise<any> {
  return sendToRest({
    api_token: apiToken,
    id: invoiceId,
  }, `invoices/${invoiceId}/refund`);
}

/**
 * Cancel a invoice
 * @param {String} apiToken 
 * @param {String} invoiceId 
 */
function cancelInvoice(apiToken: string, invoiceId: string): Parse.Promise<any> {
  return putToRest({
    api_token: apiToken,
    id: invoiceId,
  }, `invoices/${invoiceId}/cancel`);
}

function sendToRest(data: Object, restPoint: string) {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };
  let promise = new Parse.Promise();
  request.post(options, (err: any, httpResponse: any, body: any) => {
    if (err) {
      promise.reject(err);
    } else if (body) {
      promise.resolve(body);
    }
  });
  return promise;
}

function putToRest(data: Object, restPoint: string) {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };
  let promise = new Parse.Promise();
  request.put(options, (err: any, httpResponse: any, body: any) => {
    if (err) {
      promise.reject(err);
    } else if (body) {
      promise.resolve(body);
    }
  });
  return promise;
}

function getFromRest(data: Object, restPoint: string): Parse.Promise<any> {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };
  let promise = new Parse.Promise();
  request.get(options, (err: any, httpResponse: any, body: any) => {
    if (err) {
      promise.reject(err);
    } else if (body) {
      promise.resolve(body);
    }
  });
  return promise;
}

function deleteFromRest(data: Object, restPoint: string): Parse.Promise<any> {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };
  let promise = new Parse.Promise();
  request.del(options, (err: any, httpResponse: any, body: any) => {
    if (err) {
      promise.reject(err)
    } else {
      promise.resolve(body);
    }
  });
  return promise;
}
