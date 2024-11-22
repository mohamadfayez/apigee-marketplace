import type { DataProduct } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID } from '$env/static/public';

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
  let colName = "apigee-marketplace-sites/default/products";
  if (site) 
    colName = "apigee-marketplace-sites/" + site + "/products";

  let newProduct: DataProduct = await request.json();

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

  await document.delete();

  // Now delete API product
  deleteAPIProduct(id);

  if (resultProduct) {
	  return json(resultProduct);
  }
  else
    error(404, "Product not found.");
}

function deleteAPIProduct(id: string) {
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