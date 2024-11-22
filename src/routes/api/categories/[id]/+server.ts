import type { MarketplaceConfig, SLA } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Create a new client
const firestore = new Firestore();

export const DELETE: RequestHandler = async({ params, url, request}) => {
  let id: string = "";
  if (params.id) id = params.id;
  const site = url.searchParams.get('site') ?? '';
  let colName = "data-marketplace-config/default";
  if (site) 
    colName = "data-marketplace-config/" + site;

  let categories: MarketplaceConfig | undefined = undefined;

  const document = firestore.doc(colName);
  const doc = await document.get();

  if (doc.exists) {
    categories = doc.data() as MarketplaceConfig;
  }

  if (categories && id) {

    let index = categories.categories.indexOf(id);

    if (index >= 0) {
      categories.categories.splice(index, 1);

      // Persist defnition to Firestore...
      document.set(categories);
    }
  }

  return json({});
}