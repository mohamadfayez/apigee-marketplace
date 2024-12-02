import { json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from '$env/static/public';
import { ApigeeApiProduct } from "$lib/interfaces";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({url, params}) => {

  let result: ApigeeApiProduct[] = await getApigeeProducts();
  return json(result);
};

async function getApigeeProducts(): Promise<ApigeeApiProduct[]> {
  let result: ApigeeApiProduct[] = [];
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts?expand=true`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    result = (await response.json()).apiProduct;
  }

  return result;
}