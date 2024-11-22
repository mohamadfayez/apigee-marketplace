import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Storage } from '@google-cloud/storage'
import { Firestore } from '@google-cloud/firestore';
import type { BucketSubscription, ApigeeApp, ApigeeAppCredential, ApiApp } from '$lib/interfaces';
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_API_HOST } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const storage = new Storage();
const firestore = new Firestore();

export const GET: RequestHandler = async ({ url }) => {

  const email = url.searchParams.get('email') ?? '';

  const document = firestore.doc('data-marketplace-storage/' + email);
  const doc = await document.get();

  if (doc.exists)
	  return json(doc.data()?.subscriptions);
  else
    return json([]);
};

export const POST: RequestHandler = async({ params, url, request}) => {
	const email = url.searchParams.get('email') ?? '';
	const product = url.searchParams.get('product') ?? '';
  const entity = url.searchParams.get('entityName') ?? '';
  let apiKey = "";
  const createdAt = url.searchParams.get('createdAt') ?? '';
  const status = "Active";

  // First create an app and get a key
  let storageApp: ApigeeApp = await createApiApp(email, product);
  if (storageApp && storageApp.credentials && storageApp.credentials.length > 0)
    apiKey = storageApp.credentials[0].consumerKey;
  createSubscription(email, product);
	
  const newUrl = `https://${PUBLIC_API_HOST}/v1/storage/download?file=${entity}.000000000000.parquet&apiKey=${apiKey}`;

  const document = firestore.doc('data-marketplace-storage/' + email);
  const doc = await document.get();
  let myData: { subscriptions: BucketSubscription[] } = {
    subscriptions: []
  };

  if (doc.exists) {
    myData = {
      subscriptions: doc.data()?.subscriptions
    }
  }

  var newSubscription: BucketSubscription = {
    product: product,
    url: newUrl,
    createdAt: createdAt,
    status: status,
    type: "PARQUET"
  };

  if (myData) {
    myData.subscriptions.push(newSubscription);

    await document.set(myData);
  }

	return json(newSubscription);
}

export const DELETE: RequestHandler = async({ params, url, request}) => {
	const email = url.searchParams.get('email') ?? '';
	const product = url.searchParams.get('product') ?? '';
  const createdAt = url.searchParams.get('createdAt') ?? '';

  const document = firestore.doc('data-marketplace-storage/' + email);
  const doc = await document.get();
  let myData: { subscriptions: BucketSubscription[] } = {
    subscriptions: []
  };

  if (doc.exists) {
    myData = {
      subscriptions: doc.data()?.subscriptions
    }
  }

  let mySub: BucketSubscription | undefined = myData.subscriptions.find(sub => sub.product === product && sub.createdAt === createdAt);
  if (mySub) {
    let index = myData.subscriptions.indexOf(mySub);
    myData.subscriptions.splice(index, 1);
  }

  if (myData) {
    await document.set(myData);
  }

	return json(mySub);
}

/* Creates an API app for a user. */
async function createApiApp(email: string, productId: string): Promise<any> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: productId + "_export",
      apiProducts: [productId]
    })
  });

  if (response.status == 409) {
    let appData = await getApiApp(email, productId + "_export");
    return appData;
  }
  else if (response.status != 201) {
    console.error(`Error creating api app ${productId + " export"} for user ${email} and products ${productId}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

/* Gets an API app from the Apigee API */
async function getApiApp(email: string, appId: string): Promise<ApiApp | undefined> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    // Success, get data
    let result: ApiApp = await response.json();
    return result;
  } else {
    console.error(`Error getting api app ${appId} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}

/* Creates an Apigee subscription to an API product */
async function createSubscription(email: string, productId: string) {
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/subscriptions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "apiproduct": productId
    })
  });

  if (response.status != 201) {
    console.error(`Error creating product ${productId} subscription for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}