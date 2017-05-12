/// <reference path="../../typings/parse.d.ts" />

declare const require: any;
const request = require('request');

let apiToken = '' as string;
let accountId = '' as string;
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
function createCustomer(data: { [key: string]: any}) {
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
function getCustomerPaymentMethods(customerId: string) {
  return getFromRest({
    api_token: apiToken,
    customer_id: customerId,
  }, `customers/${customerId}/payment_methods`);
};

/**
 * Create credit card token
 * @param {Object} data: { number, CVV, firstName, lastName, month, year }
 */
function createToken(data: { [key: string]: any}, method: string = 'credit_card', test: boolean = true) {
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
function createPaymentMethod(customerId: string, tokenId: string, description: string = '', isDefault: boolean = true) {
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
function deletePaymentMethod(customerId: string, paymentMethodId: string) {
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
function createInvoice(email: string, customerId: string, dueDate: string, items: Array<{}>) {
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
function createChargeCustomer(cpmId: string, customerId: string, invoiceId: string, tokenId: string) {
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
function createCharge(email: string, items: Array<{}>, tokenId: any = null, method: string = 'bank_slip') {
  const data: any = {
    api_token: apiToken,
    email: email,
    items: items,
  };

  if (!tokenId || tokenId === '') {
    data.method = method;
  }

  if (tokenId && tokenId !== '') {
    data.token = tokenId;
  }

  return sendToRest(data, 'charge');
};

/**
 * Create new payment
 * @param {Object} data 
 * @returns {Object}
 */
function createNewPayment(data: any) {
  const iugu = initIugu(data.tokenId, data.accountId);
  return new Promise((resolve: any, reject: any) => {
    let dataReturn = {};
    if (data.directPayment === true) {
      if (data.creditCard) {
        return createToken(data.creditCard).then((token: any) => {
          return token;
        }).then((token) => {
          return createCharge(data.customer.email, data.items, token.id);
        }).then((response: any) => {
          resolve(response);
        }).catch((error: any) => {
          reject(error);
        });
      } else {
        reject('CREDIT CARD REQUIRED');
      }
    } else {
      if (data.customer.id) {
        return getCustomer(data.customer.id).then((customer: any) => {
          return customer;
        }).then((customer) => {
          if (data.creditCard.id === undefined) {
            return paymentWithNewCreditCard(customer, data);
          } else {
            return paymentWithPaymentMethod(customer, data);
          }
        }).then((response: any) => {
          resolve(response);
        }).catch((error: any) => {
          reject(error);
        });
      } else {
        return createCustomer(data.customer).then((customer: any) => {
          return customer;
        }).then((customer) => {
          return paymentWithNewCreditCard(customer, data);
        }).then((response) => {
          resolve(response);
        }).catch((error) => {
          reject(error);
        });
      }
    }
  });
};

function paymentWithNewCreditCard(customer: any, data: any) {
  return new Promise((resolve: any, reject: any) => {
    if (data.creditCard) {
      const dataReturn: any = {};
      dataReturn.customer = customer;
      
      return createToken(data.creditCard).then((token: any) => {
        dataReturn.token = token;
        return token;
      }).then((token) => {
        if (customer && token && data.creditCard.save === true) {
          return createPaymentMethod(customer.id, token.id, data.creditCard.description, data.creditCard.isDefault).then((cpm: any) => {
            dataReturn.cpm = cpm;
            return cpm;
          }).then((cpm) => {
            return createInvoice(customer.email, customer.id, data.dueDate, data.items);
          }).then((invoice) => {
            return createChargeCustomer(dataReturn.cpm["id"], customer["id"], invoice["id"], '');
          }).then((charge: any) => {
            dataReturn.charge = charge;
            resolve(dataReturn);
          }).catch((error: any) => {
            reject(error);
          });
        } else {
          return createInvoice(customer.email, customer.id, data.dueDate, data.items).then((invoice: any) => {
            dataReturn.invoice = invoice;
            return invoice;
          }).then((invoice) => {
            return createChargeCustomer('', customer.id, invoice.id, token.id).then((charge: any) => {
              dataReturn.charge = charge;
              return charge;
            });
          }).then(() => {
            resolve(dataReturn);
          }).catch((error: any) => {
            reject(error);
          });
        }
      });
    } else {
      reject('CREDIT CARD DATA REQUIRED');
    }
  });
}

function paymentWithPaymentMethod(customer: any, data: any) {
  return new Promise((resolve: any, reject: any) => {
    if (data.creditCard.id) {
      const dataReturn: any = {};
      dataReturn.customer = customer;

      return createInvoice(customer.email, customer.id, data.dueDate, data.items).then((invoice: any) => {
        dataReturn.invoice = invoice;
        return invoice;
      }).then((invoice) => {
        return createChargeCustomer(data.creditCard.id, customer.id, invoice.id, '');
      }).then((charge: any) => {
        dataReturn.charge = charge;
        resolve(dataReturn);
      }).catch((error) => {
        reject(error);
      });
    } else {
      reject('PAYMENT METHOD ID REQUIRED');
    }
  });
}

/**
 * Refund a invoice
 * @param {String} apiToken
 * @param {String} invoiceId 
 */
function refundInvoice(apiToken: String, invoiceId: String) {
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
function cancelInvoice(apiToken: string, invoiceId: string) {
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

  return new Promise((resolve: any, reject: any) => {
    request.post(options, (err: any, httpResponse: any, body: any) => {
      if (err) {
        reject(err);
      } else if (body) {
        resolve(body);
      }
    });
  });
}

function putToRest(data: Object, restPoint: string) {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };

  return new Promise((resolve, reject) => {
    request.put(options, (err: any, httpResponse: any, body: any) => {
      if (err) {
        reject(err);
      } else if (body) {
        resolve(body);
      }
    });
  });
}

function getFromRest(data: Object, restPoint: string) {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };

  return new Promise((resolve: any, reject: any) => {
    request.get(options, (err: any, httpResponse: any, body: any) => {
      if (err) {
        reject(err);
      } else if (body) {
        resolve(body);
      }
    });
  });
}

function deleteFromRest(data: Object, restPoint: string) {
  const options = {
    url: `${urlApi}${restPoint}`,
    contentType: 'application/json',
    json: true,
    body: data,
  };

  return new Promise((resolve: any, reject: any) => {
    request.del(options, (err: any, httpResponse: any, body: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}
