import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleAuth } from 'google-auth-library';
import { PUBLIC_PROJECT_ID, PUBLIC_APIGEE_ENV } from '$env/static/public';

let auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  setHeaders({
		'cache-control': 'max-age=300'
	});

  const email = url.searchParams.get('email') ?? '';

  let token: string | null | undefined = await auth.getAccessToken();
  let endDate = new Date();
  let startDate = new Date(new Date(endDate).setDate(endDate.getDate() - 90));
  let startDateString: string = (startDate.getMonth() + 1).toString() + "/" + startDate.getDate().toString() + "/" + startDate.getFullYear().toString();
  let endDateString: string = (endDate.getMonth() + 1).toString() + "/" + endDate.getDate().toString() + "/" + endDate.getFullYear().toString();

  //let timeRange = "02/01/2024+00:00~02/28/2024+23:59"
  let timeRange = startDateString + "+00:00~" + endDateString + "+23:59";
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/environments/${PUBLIC_APIGEE_ENV}/stats/developer_app?select=avg(total_response_time)&timeRange=${timeRange}&timeUnit=month&filter=(developer_email%20eq%20'${email}')`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  let data = await response.json();
  return json(data);
};