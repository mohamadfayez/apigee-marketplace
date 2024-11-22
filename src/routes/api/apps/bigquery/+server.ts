import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Storage, type GetSignedUrlConfig } from '@google-cloud/storage'
import { Firestore } from '@google-cloud/firestore';
import { AnalyticsHubSubscription } from '$lib/interfaces';
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Creates a client
const storage = new Storage();
// Create a new client
const firestore = new Firestore();

export const GET: RequestHandler = async ({ url }) => {

  const email = url.searchParams.get('email') ?? '';

  const document = firestore.doc('data-marketplace-hub/' + email);
  const doc = await document.get();

  if (doc.exists)
	  return json(doc.data()?.subscriptions);
  else
    return json([]);
};

export const POST: RequestHandler = async({ params, url, request}) => {
	const email = url.searchParams.get('email') ?? '';
  const project = url.searchParams.get('project') ?? '';
	const product = url.searchParams.get('product') ?? '';
  const dataset = url.searchParams.get('dataset') ?? '';
  const listingName = url.searchParams.get('listingName') ?? '';
  const listingDisplayName = url.searchParams.get('listingDisplayName') ?? '';
  const createdAt = url.searchParams.get('createdAt') ?? '';
  const status: string = "Active";

  const document = firestore.doc('data-marketplace-hub/' + email);
  const doc = await document.get();
  let myData: { subscriptions: AnalyticsHubSubscription[] } = {
    subscriptions: []
  };

  if (doc.exists) {
    myData = {
      subscriptions: doc.data()?.subscriptions
    }
  }

  var newSubscription: AnalyticsHubSubscription = {
    product: product,
    listingName: listingName,
    listingDisplayName: listingDisplayName,
    createdAt: createdAt,
    project: project,
    dataset: dataset,
    status: status
  };

  if (myData) {
    myData.subscriptions.push(newSubscription);

    await document.set(myData);
  }

  // Now create Apigee subscription for monetization
  await createApigeeSubscription(email, product);

	return json(newSubscription);
}

export const DELETE: RequestHandler = async({ params, url, request}) => {
	const email = url.searchParams.get('email') ?? '';
  const project = url.searchParams.get('project') ?? '';
  const dataset = url.searchParams.get('dataset') ?? '';

  const document = firestore.doc('data-marketplace-hub/' + email);
  const doc = await document.get();
  let myData: { subscriptions: AnalyticsHubSubscription[] } = {
    subscriptions: []
  };

  if (doc.exists) {
    myData = {
      subscriptions: doc.data()?.subscriptions
    }
  }

  let mySub: AnalyticsHubSubscription | undefined = myData.subscriptions.find(sub => sub.project === project && sub.dataset === dataset);
  if (mySub) {
    let index = myData.subscriptions.indexOf(mySub);
    myData.subscriptions.splice(index, 1);
  }

  if (myData) {
    await document.set(myData);
  }

	return json(mySub);
}

async function createApigeeSubscription(email: string, product: string): Promise<any> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      "apiproduct": product
    })
  });

  return response.json();
}