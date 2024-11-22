import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { Firestore } from '@google-cloud/firestore';
import type { User } from "$lib/interfaces";
import { PUBLIC_PROJECT_ID } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const firestore = new Firestore();

export const GET: RequestHandler = async ({ params }) => {

  let email: string = params.id ? params.id : "";

	if (!email) {
		error(400, 'Developer email is required');
	}
  const document = firestore.doc('apigee-marketplace-users/' + email);
  const doc = await document.get();

  if (doc.exists) {
    let userData = doc.data() as User;
    // test if user also exists in apigee
    let apigeeUser = await getApigeeUser(email);
    if (!apigeeUser) await createUserApigee(userData)

    return json(userData);
  }
  else
    error(404, "User could not be found.");
};

export const PUT: RequestHandler = async({ params, url, request}) => {

  let userData: User = await request.json();

  // Persist defnition to Firestore...
  let newDoc = firestore.doc("apigee-marketplace-users/" + userData.email);
  newDoc.set(userData);

	return json(userData);
}

export const DELETE: RequestHandler = async({ params }) => {
  let email: string = params.id ? params.id : "";
  if (email) {
    let apigeeResponse: Response = await deleteApigeeUser(email);
    if (apigeeResponse.status != 200) {
      console.error(`Error deleting Apigee developer ${email}.`);
      console.error(`Response ${apigeeResponse.status} - ${apigeeResponse.statusText}`);
    }

    await deleteDatabaseUser(email);
  }

  return json({result: "OK"});
};

async function getApigeeUser(email: string): Promise<User | undefined> {
  let token = await auth.getAccessToken();
  let result: User | undefined = undefined;

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (response.status == 200) {
    result = await response.json();
  }

  return result;
}

async function createUserApigee(user: User): Promise<User | undefined> {
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName
    })
  });

  console.log("Apigee create response: " + response.status);

  return user;
}

async function deleteApigeeUser(email: string): Promise<any> {
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers/${email}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  return response;
}

async function deleteDatabaseUser(email: string) {
  const document = firestore.doc('apigee-marketplace-users/' + email);
  await document.delete();

  return;
}
