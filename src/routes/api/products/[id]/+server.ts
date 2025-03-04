import type { DataProduct, MonetizationRatePlan } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type NumericRange, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_APIGEE_ENV, PUBLIC_APIHUB_REGION } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Create a new client
const firestore = new Firestore();

export const GET: RequestHandler = async ({ url, params }) => {
  const site = url.searchParams.get('site') ?? '';
  let colName = "apigee-marketplace-sites/default/products";
  if (site) 
    colName = "apigee-marketplace-sites/" + site + "/products";

  let id: string = "";
  if (params.id) id = params.id;

  let resultProduct: DataProduct | undefined = undefined;

  const document = firestore.doc(colName +'/' + id);
  const doc = await document.get();

  if (doc.exists) {
    let docData = doc.data();
    if (docData)
      resultProduct = docData as DataProduct;
  }

  if (resultProduct) {
	  return json(resultProduct);
  }
  else
    error(404, "Product not found.");
};

export const PUT: RequestHandler = async({ params, url, request}) => {
  const site = url.searchParams.get('site') ?? '';
  const originalRatePlanId = url.searchParams.get('originalRatePlanId') ?? '';
  let colName = "apigee-marketplace-sites/default/products";
  if (site) 
    colName = "apigee-marketplace-sites/" + site + "/products";

  let newProduct: DataProduct = await request.json();

  // set monetization data, if needed
  if (originalRatePlanId != newProduct.monetizationId) {
    // delete original rate if it was removed or replaced...
    if (originalRatePlanId && newProduct.apigeeMonetizationId) {
      await deleteMonetizationPlanForProduct(newProduct.apigeeMonetizationId, newProduct.apigeeProductId);
    }
    // create new rate plan
    if (newProduct.monetizationData)
      await createMonetizationPlanForProduct(newProduct);
  }

  // update mock data
  setKVMEntry("marketplace-kvm", newProduct.entity + "-mock", newProduct.samplePayload);

  let newDoc = firestore.doc(colName + "/" + newProduct.id);
  newDoc.set(newProduct);
	return json(newProduct);
}

export const DELETE: RequestHandler = async({ params, url, request}) => {
  const site = url.searchParams.get('site') ?? '';
  let colName = "apigee-marketplace-sites/default/products";
  if (site) 
    colName = "apigee-marketplace-sites/" + site + "/products";

  let id: string = "";
  if (params.id) id = params.id;

  let resultProduct: DataProduct | undefined = undefined;

  const document = firestore.doc(colName + '/' + id);
  const doc = await document.get();

  if (doc.exists) {
    let docData = doc.data();
    if (docData)
      resultProduct = docData as DataProduct;
  }

  if (resultProduct && resultProduct.apigeeMonetizationId)
    deleteMonetizationPlanForProduct(resultProduct.apigeeMonetizationId, resultProduct.apigeeProductId);

  await document.delete();

  // Now delete Api & Api Hub products
  deleteApiProduct(id);
  deleteApiHubProduct(id);

  if (resultProduct) {
	  return json(resultProduct);
  }
  else
    error(404, "Product not found.");
}

function deleteApiProduct(id: string) {
  auth.getAccessToken().then((token) => {
    fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      console.error(error);
    });
  });
}

function deleteApiHubProduct(id: string) {
  auth.getAccessToken().then((token) => {
    fetch(`https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis/${id}?force=true`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      console.error(error);
    });
  });
}

async function createMonetizationPlanForProduct(product: DataProduct) {
  let newPlan: MonetizationRatePlan = JSON.parse(JSON.stringify(product.monetizationData))
  delete newPlan.name;

  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts/${product.apigeeProductId}/rateplans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newPlan)
  });

  let responsePayload = await response.json();

  if (response.status != 201) {
    console.error("Error creating monetization plan");
    console.error(JSON.stringify(newPlan));
    console.error(`${response.status} - ${response.statusText}`);
  } else {
    product.apigeeMonetizationId = responsePayload.name;
  }
}

async function deleteMonetizationPlanForProduct(name: string, productId: string) {
  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts/${productId}/rateplans/${name}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status != 200) {
    console.error("Error deleting monetization plan " + name + " " + productId);
    console.error(`${response.status} - ${response.statusText}`);
  }
}

function setKVMEntry(KVMName: string, keyName: string, keyValue: string) {
  auth.getAccessToken().then((token) => {
    fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/environments/${PUBLIC_APIGEE_ENV}/keyvaluemaps/${KVMName}/entries`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: keyName,
        value: keyValue
      })
    }).then((response) => {
    }).catch((error) => {
      console.error(error);
    });
  });
}