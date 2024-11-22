import type { DataProduct } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, text, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

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

  const document = firestore.doc(colName + "/" + id);
  const doc = await document.get();

  if (doc.exists) {
    let docData = doc.data();
    if (docData)
      resultProduct = docData as DataProduct;
  }

  let specText2 = resultProduct?.specContents;

  let response: Response = new Response(specText2);
  response.headers.set("Content-Type", "application/yaml");
  response.headers.set("Access-Control-Allow-Origin", "*");

  if (resultProduct) {
	  return response;
  }
  else
    error(404, "Product not found.");
};

let specText: string = `
openapi: 3.0.0
info:
  title: Bike Trips API
  version: v1
servers:
  - url: https://dev.34-36-221-53.nip.io
    description: Dev server
paths:
  /v1/data/trips2:
    get:
      security:
        - api_key: []
      responses:
        '200':
          description: A list of bike trips
          content:
            application/json:
              schema:
                type: object
                properties:
                  trips2:
                    type: array
                    items:
                      type: object
                      properties:
                        trip_id:
                          type: string
                        subscriber_type:
                          type: string
                        bike_id:
                          type: string
                        bike_type:
                          type: string
                        start_time:
                          type: string
                        start_station_id:
                          type: string
                        start_station_name:
                          type: string
                        end_station_id:
                          type: string
                        end_station_name:
                          type: string
                        duration_minutes:
                          type: integer
                  next_page_token:
                    type: integer
components:
  securitySchemes:
    api_key:
      type: apiKey
      name: x-api-key
      in: header`;