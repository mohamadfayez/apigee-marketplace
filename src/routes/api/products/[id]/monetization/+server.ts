import type { DataProduct, IdentityConfig, MonetizationRatePlan, MonetizationRatePlans } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type NumericRange, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID } from '$env/static/public';
import { logDebug } from "$lib/utils";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const firestore = new Firestore();

export const POST: RequestHandler = async({ params, url, request}) => {

  let newPlan: MonetizationRatePlan = await request.json();
  delete newPlan.name;

  logDebug("MONEATIZATION_PLAN_CREATE_REQUEST", JSON.stringify(newPlan));

  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts/${newPlan.apiproduct}/rateplans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newPlan)
  });

  let responsePayload = await response.json();
  if (responsePayload) logDebug("MONEATIZATION_PLAN_CREATE_RESPONSE", response.status + " - " + response.statusText + " - " + JSON.stringify(responsePayload));

  if (response.status == 201) {
    return json(responsePayload);
  }
  else {
    console.error("Error creating monetization plan");
    console.error(JSON.stringify(newPlan));
    console.error(`${response.status} - ${response.statusText}`);
    return error(response.status as NumericRange<400, 599>, response.statusText);
  }
}