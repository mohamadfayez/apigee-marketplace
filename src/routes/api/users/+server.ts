import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Firestore } from '@google-cloud/firestore';
import { GoogleAuth } from 'google-auth-library';
import { User } from '$lib/interfaces';
import { PUBLIC_PROJECT_ID, PUBLIC_INTERNAL_DOMAINS } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const firestore = new Firestore();

export const GET: RequestHandler = async ({ url, params }) => {

  let prodColRef = firestore.collection("apigee-marketplace-users");
  let products = await prodColRef.listDocuments();

  let results: User[] = [];
  for (let doc of products.entries()) {
    let docData = await doc[1].get()
    results.push(docData.data() as User);
  }

  return json(results);
};

export const POST: RequestHandler = async ({ request }) => {

  let userData: User = await request.json();
  
	if (!userData || !userData.email) {
		error(400, 'Developer data is required');
	}

	if (!userData.firstName && !userData.lastName && userData.userName.includes(' ')) {
		let names: string[] = userData.userName.split(' ');
		userData.firstName = names[0];
		userData.lastName = names[1];
	}

  // create user firebase
  let newUser = await createUserFirebase(userData);
  // create user apigee
  await createUserApigee(userData);

	return json(newUser);
};

async function createUserFirebase(user: User): Promise<User | undefined> {
  
  let internalDomains: string[] = PUBLIC_INTERNAL_DOMAINS.split(',');
  let userDomain: string = user.email.split('@')[1];
  if (!internalDomains.includes(userDomain)) {
    user.roles.push("external");
  } else {
    user.roles.push("admin");
    user.roles.push("internal");
  }
  user.status = "approved";
  
  // Persist defnition to Firestore...
  let newDoc = firestore.doc("apigee-marketplace-users/" + user.email);
  newDoc.set(user);

  return user;
}

async function createUserApigee(user: User): Promise<User | undefined> {
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/developers`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(user)
  });

  return user;
}