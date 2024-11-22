import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleAuth } from 'google-auth-library';
import type { ApiAppCredential } from '$lib/interfaces';
import { PUBLIC_PROJECT_ID } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const DELETE: RequestHandler = async({ params, url}) => {
	const email = url.searchParams.get('email') ?? '';

	if (!email || !params.id || !params.keyId) {
		error(400, 'email and appid are required');
	}

  let appKeyData = await deleteApiAppKey(email, params.id, params.keyId);
	return json(appKeyData);
}

async function deleteApiAppKey(email: string, appId: string, keyId: string): Promise<ApiAppCredential | undefined> {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}/apps/${appId}/keys/${keyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status == 200) {
    let result: ApiAppCredential = await response.json();
    return result;
  }
  else {
    console.error(`Error deleting app ${appId} credential ${keyId} for user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}