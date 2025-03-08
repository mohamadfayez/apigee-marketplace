import type { DisplayOptions } from "$lib/interfaces";
import { env } from '$env/dynamic/public';

// Capitalize first letter
export function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function logDebug(name: string, payload: string): void {
  if (env.PUBLIC_LOG_DEBUG) {
    console.log(name);
    console.log(payload);
  }
}

export function tryParseJson (jsonString: string){
  try {
      var o = JSON.parse(jsonString);

      if (o && typeof o === "object") {
        return o;
      }
  }
  catch (e) {
    console.log(`Could not parse json.`);
  }

  return false;
};

// Generates a random string of a given length. Defaults to 6 characters.
export const generateRandomString = (length = 6) => Math.random().toString(20).substring(2, length + 2);

export function generateRandomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;;
}

// Capitalize first letter
export function capFirst(input: string): string { 
	return input.charAt(0).toUpperCase() + input.slice(1); 
}

export let bqtables: { name: string, table: string, entity: string }[] = [{ "name": "DeepMind Alphafold", "table": "bigquery-public-data.deepmind_alphafold.metadata", "entity": "alphafold-metadata" }, { "name": "Austin Bike Trips", "table": "bigquery-public-data.austin_bikeshare.bikeshare_trips", "entity": "bike-trips" }, { "name": "London Bike Trips", "table": "bigquery-public-data.london_bicycles.cycle_hire", "entity": "london-bike-trips" }, { "name": "New York City Bike Trips", "table": "bigquery-public-data.new_york_citibike.citibike_trips", "entity": "new-york-bike-trips" }, { "name": "New York City Subway Trips", "table": "bigquery-public-data.new_york_subway.trips", "entity": "new-york-subway-trips" }, { "name": "Chicago Taxi Trips", "table": "bigquery-public-data.chicago_taxi_trips.taxi_trips", "entity": "chicago-taxi-trips" }, { "name": "BBC News Full Text", "table": "bigquery-public-data.bbc_news.fulltext", "entity": "news-text" }, { "name": "Bitcoin Transactions", "table": "bigquery-public-data.crypto_bitcoin.transactions", "entity": "bitcoin-transactions" }, { "name": "Ethereum Transactions", "table": "bigquery-public-data.crypto_ethereum.transactions", "entity": "ethereum-transactions" }, { "name": "Github Commits", "table": "bigquery-public-data.github_repos.commits", "entity": "github-commits" }, { "name": "NOAA Hurricane Data", "table": "bigquery-public-data.noaa_hurricanes.hurricanes", "entity": "noaa-hurricanes" }, { "name": "NOAA Lightning Data", "table": "bigquery-public-data.noaa_lightning.lightning_strikes", "entity": "noaa-lightning-strikes" }, { "name": "Google Maps Project Sunroof", "table": "bigquery-public-data.sunroof_solar.solar_potential_by_postal_code", "entity": "maps-sunroof" }];

export let protocols: DisplayOptions[] = [
  {
    name: "API",
    displayName: "API",
    active: true
  },
  {
    name: "Analytics Hub",
    displayName: "Analytics Hub",
    active: true
  },
  {
    name: "Data sync",
    displayName: "Data sync",
    active: true
  }
];

export let audiences: DisplayOptions[] = [
  {
    name: "internal",
    displayName: "Internal",
    active: true
  },
  {
    name: "partner",
    displayName: "Partner",
    active: true
  },
  {
    name: "external",
    displayName: "External",
    active: true
  }
];

export let defaultCategories: string[] = ["CRM - Customer Orders", "CRM - Sales Automation", "CRM - Marketing Automation", "ERP - Financials", "ERP - Inventory Management", "ERP - Supply Chain", "HR - Employee Functions", "HR - Recruitment", "HR - Performance Management", "E-commerce - Product Catalog", "E-commerce - Order Management", "E-commerce - Payment Processing", "CMS - Content Delivery", "CMS - Digital Asset Management", "CMS - Headless CMS", "Data Analytics - Business Intelligence", "Data Analytics - Data Warehousing", "Data Analytics - Predictive Analytics", "Communication & Collaboration - Messaging", "Communication & Collaboration - Video Conferencing", "Communication & Collaboration - Document Sharing", "Security & Identity - Authentication", "Security & Identity - Access Control", "Security & Identity - Fraud Detection", "Logistics & Shipping - Shipping Tracking", "Logistics & Shipping - Route Optimization", "Logistics & Shipping - Warehouse Management", "Marketing & Advertising - Social Media", "Marketing & Advertising - Advertising Platforms", "Marketing & Advertising - Customer Engagement", "Legal & Compliance - Document Management", "Legal & Compliance - Compliance Tracking", "Legal & Compliance - E-Signature", "Mapping & Location Services - Geocoding", "Mapping & Location Services - Route Planning", "Mapping & Location Services - Location Tracking"];