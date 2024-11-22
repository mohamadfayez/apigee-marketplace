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

// Generates a random string of a given length. Defaults to 6 characters.
export const generateRandomString = (length=6)=>Math.random().toString(20).substring(2, length + 2);

export enum DataSourceTypes {
  BigQuery = "BigQuery",
  BigQueryTable = "BigQueryTable",
  GenAITest = "GenAITest",
  AI = "AI",
  API = "API"
}

export let bqtables: {name: string, table: string, entity: string}[] = [
  {
    name: "Austin bike share trips",
    table: "bigquery-public-data.austin_bikeshare.bikeshare_trips",
    entity: "bike-trips"
  },
  {
    name: "BBC News full text articles",
    table: "bigquery-public-data.bbc_news.fulltext",
    entity: "news-text"
  }
]

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
    name: "Event",
    displayName: "Event stream",
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