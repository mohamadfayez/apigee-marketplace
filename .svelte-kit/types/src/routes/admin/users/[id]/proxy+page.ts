// @ts-nocheck
import type { DataProduct } from "$lib/interfaces";
import type { PageLoad } from "./$types";

export const load = async ({ fetch, params }: Parameters<PageLoad>[0]) => {
  return {
    userId: params.id,
  };
};
