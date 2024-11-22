import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleAuth } from 'google-auth-library';
import { User } from '$lib/interfaces';
import { PUBLIC_API_HOST } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const POST: RequestHandler = async ({ url }) => {

	const email = url.searchParams.get('email') ?? '';
	const userName = url.searchParams.get('username') ?? 'newUser';
	let firstName = url.searchParams.get('firstname') ?? 'New';
  let lastName = url.searchParams.get('lastname') ?? 'User';
  
	if (!email) {
		error(400, 'Developer email is required');
	}

	if (lastName === '' && firstName === '' && userName.includes(' ')) {
		let names: string[] = userName.split(' ');
		firstName = names[0];
		lastName = names[1];
	}

  let userData = await getOrCreateUser(email, firstName, lastName, userName);

	return json(userData);
};

async function getOrCreateUser(email: string, firstName: string, lastName: string, userName: string): Promise<User | undefined> {
  let response = await fetch("https://" + PUBLIC_API_HOST + "/v1/users", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      userName: userName,
      firstName: firstName,
      lastName: lastName
    }),
  });
    
  if (response.status == 200) {
    let data: any = await response.json();
    let appUser: User = new User(data.userData.email, data.userData.firstName, data.userData.lastName, data.userData.userName);
    appUser.developerData = data.developerData;
    if (data.userData) {
      appUser.roles = data.userData.roles;
      appUser.status = data.userData.status;
    }

    return appUser;
  }
  else {
    console.error(`Error getting user ${email}.`);
    console.error(`Response ${response.status} - ${response.statusText}`);
  }

  return;
}