/// <reference path="../../typings/parse.d.ts" />
/// <reference path="../../typings/cron.d.ts" />

declare function require(name:string): any;
var cron = require('cron');

const AccessTokenObject = Parse.Object.extend('AccessToken');
const SubscriptionObject = Parse.Object.extend('Subscription');

/**
Refresh access token
*/
function refreshAccessToken(clientId: string, clientSecret: string) {
  
  var tokenQuery = new Parse.Query(AccessTokenObject);
  return tokenQuery.first().then((result: Parse.Object) => {
    let googleRefreshToken = result.get('googleRefreshToken');
    var postData = {} as Parse.Cloud.HTTPOptions;
    postData.method = 'POST';
    postData.url = 'https://accounts.google.com/o/oauth2/token';
    postData.body = {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: googleRefreshToken
    };
    return Parse.Cloud.httpRequest(postData);
  });
}

/**
* Get subscription data from Google Developer API
*/

function getSubscriptionAndroidData(subscription: Parse.Object, accessToken: string, bundleId: string, productName: string) {
  let getData = {} as Parse.Cloud.HTTPOptions;
  getData.method = 'GET';
  getData.url = 'https://www.googleapis.com/androidpublisher/v2/applications/' + bundleId + '/purchases/subscriptions/' + productName + '/tokens/' + subscription.get('androidPurchaseToken') + '?access_token=' + accessToken;
  var request = Parse.Cloud.httpRequest(getData).then((response) => {
    var data = {
      subscription: subscription,
      data: response.data
    }
    return data;
  });

  return request;
}

// /**
// * Get receipt data from iTunes Store API
// */
function getSubscriptionIOSData(subscription: Parse.Object, iTunesSharedSecret: string, environment: string){
  let postData = {} as Parse.Cloud.HTTPOptions;
  
  if (environment == 'production'){
    postData.url = 'https://buy.itunes.apple.com/verifyReceipt';
  } else {
    postData.url = 'https://sandbox.itunes.apple.com/verifyReceipt';
  }

  postData.method = 'POST';
  postData.headers = {
    'Content-Type': 'application/json'
  }
  postData.body = {
    'receipt-data': subscription.get('iOSReceipt'),
    'password': iTunesSharedSecret
  }
  var request = Parse.Cloud.httpRequest(postData).then((response) => {
    var data = {
      subscription: subscription,
      data: response.data
    }
    return data;
  });
  return request;
}

// /**
// * Validate android subscription
// */
function validateAndroidSubscriptions(clientId: string, clientSecret: string, bundleId: string, validatorField: string) {
	console.log('Validate Android Subscriptions!');

	var accessToken: string;

  refreshAccessToken(clientId, clientSecret).then((httpResponse) => {
		accessToken = httpResponse.data.access_token;
		let subscriptionsQuery = new Parse.Query(SubscriptionObject);
		subscriptionsQuery.exists('androidPurchaseToken');
		return subscriptionsQuery.find();
	}).then(function(subscriptions) {
		for (var index in subscriptions) {
			let subscription = subscriptions[index] as Parse.Object;
      let productName = subscription.get('product') as string;
      getSubscriptionAndroidData(subscription, accessToken, bundleId, productName).then((httpResponse) => {
				let subscriptionValid = httpResponse.data.error == undefined && httpResponse.data.cancelReason == undefined;
        let currentSubscription = httpResponse.subscription as Parse.Object;
				currentSubscription.set(validatorField, subscriptionValid);
				currentSubscription.save();
			});
		}
    console.log('Android check subscriptions successful');
		return true;
  });
}

/*
* Validate iOS subscription
*/
function validateIOSSubscriptions(iTunesSharedSecret: string, validatorField: string, environment: string) {
  console.log('Validate iOS Subscriptions!');

	let subscriptionsQuery = new Parse.Query(SubscriptionObject);
	subscriptionsQuery.exists('iOSReceipt');
	subscriptionsQuery.find().then((subscriptions: Parse.Object[]) => {
		for (var index in subscriptions) {
			let subscription = subscriptions[index] as Parse.Object;
			getSubscriptionIOSData(subscription, iTunesSharedSecret, environment).then((httpResponse) => {
				let subscriptionValid = httpResponse.data.status === 0;
        let currentSubscription = httpResponse.subscription as Parse.Object;
				currentSubscription.set(validatorField, subscriptionValid);
				if (subscriptionValid){
					currentSubscription.set('iOSReceipt', httpResponse.data.latest_receipt);
				}
				currentSubscription.save();
			});
		}
    console.log('iOS check subscriptions successful!');
		return true;
	});
}

/*
* Start cron to valid Android subscriptions
*/
function startAndroidSubscriptionsValidation(cronTime: string, clientId: string, clientSecret: string, bundleId: string, validatorField: string, timezone: string) {
	var androidJob = new cron.CronJob({
		cronTime: cronTime,
		onTick: function() {
      validateAndroidSubscriptions(clientId, clientSecret, bundleId, validatorField);
		},
		start: false,
		timeZone: timezone || 'America/Maceio'
	});
	return androidJob.start();
}

/*
* Start cron to valid iOS receipt
*/
function startIOSSubscriptionsValidation(cronTime: string, iTunesSharedSecret: string, validatorField: string, timezone: string, environment: string) {
	var iosJob = new cron.CronJob({
		cronTime: cronTime,
		onTick: function() {
      validateIOSSubscriptions(iTunesSharedSecret, validatorField, environment);
		},
		start: false,
		timeZone: timezone || 'America/Maceio'
	});
	return iosJob.start();
}