import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiApp, ApigeeApp, ApigeeAppCredential } from '$lib/interfaces';
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({ params, url }) => {

	const email = url.searchParams.get('email') ?? '';
	if (!email || !params.id) {
		error(400, 'email and appid are required');
	}
	
  let appData = await getApiApp(email, params.id);

	return json(appData);
};

// POST on an app creates a new key
export const POST: RequestHandler = async({ params, url, request}) => {
	const email = url.searchParams.get('email') ?? '';

	const app: ApiApp = await request.json();

	if (!email || !params.id) {
		error(400, 'email and appid are required');
	}

  let appData = await createApiAppKey(email, app);

	return json(appData);
}

export const PUT: RequestHandler = async ({ params, url, request }) => {

	const email = url.searchParams.get('email') ?? '';

	const app: ApiApp = await request.json();

	if (!email || !params.id) {
		error(400, 'email and appid are required');
	}
	
  let appData = await updateApiApp(email, app);

	return json(appData);
};

export const DELETE: RequestHandler = async({ params, url}) => {
	const email = url.searchParams.get('email') ?? '';

	if (!email || !params.id) {
		error(400, 'email and appid are required');
	}

  let appData = await deleteApiApp(email, params.id);

	return json(appData);
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

/* Creates an API key for an app */
async function createApiAppKey(email: string, app: ApiApp): Promise<ApiApp | undefined> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${app.appId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(app)
  });

  if (response.status == 200) {
    let result: ApiApp = await response.json();
    return result;
  }
  else {
    console.error(`Error adding key to api app ${app.name} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}

/* Update an API app */
async function updateApiApp(email: string, app: ApiApp): Promise<ApiApp | undefined> {

    let updatedApp: ApigeeApp = app as ApigeeApp;

    let token = await auth.getAccessToken();
    let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${app.name}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedApp)
    });

    if (response.status == 200) {
      let result: ApiApp = await response.json();

      // Now update all credentials
      if (updatedApp.credentials) {
        for (let cred of updatedApp.credentials) {
          updateApiAppCredential(email, updatedApp.name, cred);
        }
      }

      return result;
    }
    else {
      console.error(`Error updating api app ${app.name} for user ${email}.`);
      console.error(`Response ${response.status} - ${response.statusText}`);
      let errorResponsePayload = await response.json();
      if (errorResponsePayload) console.error(errorResponsePayload);
    }

    return;
}

/* Update an API app credential */
async function updateApiAppCredential(email: string, appName: string, cred: ApigeeAppCredential) {
  let token = await auth.getAccessToken();

  // First find any products that have been removed
  var deletedProducts = [];
  let key: ApigeeAppCredential | undefined = await getApiAppCredentialKey(email, appName, cred.consumerKey);
  if (key && key.apiProducts && cred && cred.apiProducts) {
    for (var i = 0; i < key.apiProducts.length; i++) {
      var existingProduct = key.apiProducts[i];
      let tempProd = cred.apiProducts.find(prod => prod.apiproduct === existingProduct.apiproduct);
      if (!tempProd) {
        await updateApiAppCredentialRemoveProduct(email, appName, key.consumerKey, existingProduct.apiproduct);
      }
    }
  }

  // Now update app key
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appName}/keys/${cred.consumerKey}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cred)
  });
}

/* Update an API app remove product from credential */
async function updateApiAppCredentialRemoveProduct(email: string, appName: string, keyName: string, apiProduct: string) {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appName}/keys/${keyName}/apiproducts/${apiProduct}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status != 200)  {
    console.error(`Error adding key to api app ${appName} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}

/* Get an API app credential */
async function getApiAppCredentialKey(email: string, appName: string, keyName: string): Promise<ApigeeAppCredential | undefined> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appName}/keys/${keyName}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status == 200) {
    let result: ApigeeAppCredential = await response.json();
    return result;
  }
  else {
    console.error(`Error adding key to api app ${appName} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }
}

/* Delete an API app */
async function deleteApiApp(email: string, appName: string): Promise<ApiApp | undefined> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appName}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status == 200) {
    let result: ApiApp = await response.json();
    return result;
  }
  else {
    console.error(`Error deleting app ${appName} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}