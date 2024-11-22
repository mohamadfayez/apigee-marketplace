import type { MarketplaceConfig } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const firestore = new Firestore();

export const GET: RequestHandler = async ({ url, params }) => {

  let config: MarketplaceConfig | undefined = undefined;
  const site = url.searchParams.get('site') ?? '';
  let colName = "data-marketplace-config/default";
  if (site) 
    colName = "data-marketplace-config/" + site;

  const document = firestore.doc(colName);
  const doc = await document.get();

  if (doc.exists) {
    config = doc.data() as MarketplaceConfig;
  }

  if (config) {
   
    config.categories.sort(function(a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    return json(config);
  }
  else
    error(404, "Categories not found.");
};

export const POST: RequestHandler = async({ params, url, request}) => {

  const newCategory = url.searchParams.get('name') ?? '';
  let categories: MarketplaceConfig | undefined = undefined;
  const site = url.searchParams.get('site') ?? '';
  let colName = "data-marketplace-config/default";
  if (site) 
    colName = "data-marketplace-config/" + site;

  const document = firestore.doc(colName);
  const doc = await document.get();

  if (doc.exists) {
    categories = doc.data() as MarketplaceConfig;
  }

  if (categories && newCategory) {
    categories.categories.push(newCategory);
    // Persist defnition to Firestore...
    document.set(categories);
  }

	return json(categories);
}