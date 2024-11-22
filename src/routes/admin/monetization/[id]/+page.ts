import type { DataProduct } from "$lib/interfaces";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  // let response = await fetch("/api/products/" + params.id, {
  //   method: "GET",
  //   headers: {
  //     "content-type": "application/json",
  //   },
  // });

	// let productData = await response.json();

  return {
    productId: params.id,
  };
};
