import { json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from '$env/static/public';
import { ApiHubApi } from "$lib/interfaces";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({url, params}) => {

  let result: ApiHubApi[] = await getApiHubApis();
  return json(result);
};

async function getApiHubApis(): Promise<ApiHubApi[]> {
  let result: ApiHubApi[] = [];
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    let tempApis = (await response.json()).apis;
    if (tempApis) result = tempApis;
  }

  return result;
}