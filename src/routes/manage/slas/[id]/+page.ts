import type { DataProduct } from "$lib/interfaces";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {

  return {
    slaId: params.id,
  };
};