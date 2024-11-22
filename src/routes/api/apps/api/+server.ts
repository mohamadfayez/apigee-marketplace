import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ApiApp, ApiApps, type ApigeeApps } from '$lib/interfaces';
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email') ?? '';

	if (!email) {
		error(400, 'email is required.');
	}
	let apps = await getApiApps(email)

	return json(apps);
};

export const POST: RequestHandler = async ({ url, request }) => {
	const email = url.searchParams.get('email') ?? '';
  let newApp: ApiApp = await request.json();

	if (!email) {
		error(400, 'email is required.');
	}
	
  await createApiApp(email, newApp);

  createSubscriptions(email, newApp);

	return json(newApp);
};

/* Gets API apps from the Apigee API */
async function getApiApps(email: string): Promise<ApiApps> {
  let result: ApiApps = new ApiApps();
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps?expand=true`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    // Success, get data
    let apigeeApps: ApigeeApps = await response.json();

    if (apigeeApps.app && apigeeApps.app.length > 0) {
      apigeeApps.app.forEach(apigeeApp => {
        let app: ApiApp = apigeeApp as ApiApp;

        result.apps.push(app);
      });
    }
  } else {
    console.error(`Error getting api apps for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return result;
}

/* Creates an API app for a user. */
async function createApiApp(email: string, newApp: ApiApp) {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: newApp.name,
      apiProducts: newApp.apiProducts,
      attributes: [
        {
          name: "Notes",
          value: newApp.description
        }
      ]
    })
  });

  if (response.status != 201) {
    console.error(`Error creating api app ${newApp.name} for user ${email} and products ${newApp.apiProducts.join(", ")}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}

/* Creates an Apigee subscription to an API product */
async function createSubscriptions(email: string, newApp: ApiApp) {
  let token = await auth.getAccessToken();

  for (let product of newApp.apiProducts) {
    let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "apiproduct": product
      })
    });

    if (response.status != 201) {
      console.error(`Error creating product ${product} subscription for user ${email}.`);
      console.error(`Response ${response.status} - ${response.statusText}`);
    }
  }

  return;
}