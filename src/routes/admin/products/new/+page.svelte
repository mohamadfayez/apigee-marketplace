<script lang="ts">
  import { fade, slide, fly, blur, scale } from 'svelte/transition';
  import { appService } from "$lib/app-service";
  import {
    MarketplaceConfig,
    DataProduct,
    DisplayOptions,
    DataSourceTypes,
    ProductProtocols,

    DialogType

  } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import ProductEditor from "$lib/components.product-edit.svelte";
  import { bqtables, generateRandomString } from "$lib/utils";
  import { onMount } from "svelte";

  let product: DataProduct = new DataProduct(
    generateRandomString(4),
    "",
    "",
    "",
    "",
    "Published",
    "BigQueryTable",
    "",
    "",
    "",
    ["API"],
    ["internal", "partner", "external"],
    [],
  );

  if (
    appService.currentSiteData &&
    appService.currentSiteData.bqtables.length > 0
  ) {
    product.entity = appService.currentSiteData.bqtables[0].entity;
    product.query = appService.currentSiteData.bqtables[0].table;
  }

  let processing: boolean = false;

  onMount(() => {
    document.addEventListener("siteUpdated", () => {
      if (appService.currentSiteData) {
        product.entity = appService.currentSiteData.bqtables[0].entity;
        product.query = appService.currentSiteData.bqtables[0].table;
        product = product;
      }
    });
  });

  function submit() {
    if (!product.name) {
      appService.ShowDialog("Please enter a name for the product, and make sure the other details are filled in.", "Ok", DialogType.Ok, []);
    } else {
      processing = true;
      product.createdAt = new Date().toString();
      product.id =
        product.name.toLowerCase().replaceAll(" ", "_") + "_" + product.id;
      if (appService.currentUser) {
        product.ownerEmail = appService.currentUser.email;
        product.ownerName =
          appService.currentUser.firstName +
          " " +
          appService.currentUser.lastName;
      }

      if (product.source === DataSourceTypes.ApigeeProduct || product.source === DataSourceTypes.API) {
        product.apigeeProductId = product.query;
        product.imageUrl = "/loop.svg";
      } else if (product.source.startsWith("BigQuery")) {
        product.imageUrl = "/data.svg";
      } else if (product.source === DataSourceTypes.GenAITest) {
        product.imageUrl = "/genai.svg";
      } else if (product.source === DataSourceTypes.ApiHub) {
        product.imageUrl = "/hub.svg";
      }

      let newProduct: DataProduct = product;
      if (newProduct.categories.length == 0)
        newProduct.categories.push("Uncategorized");

      fetch("/api/products?site=" + appService.currentSiteData.id, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(newProduct),
      })
      .then((response) => {
        return response.json();
      })
      .then((data: DataProduct) => {
        appService.products?.push(data);
        appService.GoTo("/admin/products");
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }


  function back() {
    // appService.GoTo("/admin/products");
    history.back();
  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="products" />

  <div class="left_menu_page_right" in:fade>
    <div>
      <div class="left_menu_page_right_header">
        <button class="back_button" on:click={back}>
          <svg
            data-icon-name="arrowBackIcon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
            ><path
              fill-rule="evenodd"
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"
            ></path></svg
          >
        </button>
        <span>Create product</span>
      </div>

      <div class="right_content">
        {#if !processing}
          <ProductEditor {product} />

          <div class="form_controls">
            <button
              on:click={back}
              type="button"
              class="rounded_button_outlined">Cancel</button
            >
            <button
              type="button"
              on:click|stopPropagation={submit}
              class="rounded_button_filled">Save</button
            >
          </div>
        {:else}
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
</style>
