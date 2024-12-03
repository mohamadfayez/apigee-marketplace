<script lang="ts">
	import { goto } from '$app/navigation';
  import { appService } from '$lib/app-service';
  import { DataProduct, DialogResult, DialogType } from '$lib/interfaces';
  import MenuLeftAdmin from '$lib/components-menus-left/menus-left.admin.svelte';
  import ProductEditor from '$lib/components.product-edit.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  export let data: PageData;
  let products: DataProduct[] | undefined = appService.products;
  let product: DataProduct | undefined;
  
  let processing = false;
  let originalRatePlanId: string = "";

  onMount(async () => {

    document.addEventListener("productsUpdated", () => {
      products = appService.products;
      loadProduct();
    });

    products = appService.products;
    loadProduct();
  });

  function loadProduct() {
    if (products && products.length > 0 && !product) {
      let tempProduct = products.find(prod => prod.id === data.productId);
      product = JSON.parse(JSON.stringify(tempProduct));
      originalRatePlanId = product?.monetizationId ?? "";
    }
  }

  function submit() {
    
    processing = true;

    if (appService.currentUser && product) product.ownerEmail = appService.currentUser.email;
    // set monetization rate plan data, if selected
    if (product?.monetizationId && appService.configData?.ratePlans) {
      let ratePlan = appService.configData.ratePlans.find((x) => x.name === product?.monetizationId);
      if (ratePlan) {
        product.monetizationData = JSON.parse(JSON.stringify(ratePlan));
        if (product.monetizationData) product.monetizationData.apiproduct = product.apigeeProductId;
      }
    } else if (product && originalRatePlanId && !product?.monetizationId) {
      product.monetizationData = undefined;
    }
    
    fetch(`/api/products/${product?.id}?site=${appService.currentSiteData.id}&originalRatePlanId=${originalRatePlanId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      headers: {
        'content-type': 'application/json',
      },
    }).then((response) => {
        if (response.status === 200)
          return response.json();
        else {
          console.error("Could not save product data for " + product?.id + " - " + response.status)
        }
    }).then((data: DataProduct) => {
      let index = appService.products?.findIndex(x => x.id == data.id) ?? -1;
      if (appService.products && index >= 0) appService.products[index] = data;
      // appService.GoTo("/manage/products");
      history.back();
    }).catch((error) => {
      console.error(error);
    });
  }

  function deleteProduct() {
    if (product)
      appService.ShowDialog("Do you really want to delete the product " + product.name + "?", "Delete", DialogType.OkCancel, []).then((result: DialogResult) => {
        if (result.result === DialogType.Ok) {
          fetch(`/api/products/${product?.id}?site=${appService.currentSiteData.id}`, {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
            },
          }).then((response) => {
            if (appService && appService.products) {
              let index = appService.products.findIndex((x) => x.id == product?.id);
              appService.products.splice(index, 1);
              products = appService.products;
              appService.GoTo("/manage/products");
            }
          });
        }
      });
  }

  function back() {
    // appService.GoTo("/manage/products");
    history.back();
  }

</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="products" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
          <button class="back_button" on:click={back}>
            <svg data-icon-name="arrowBackIcon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></path></svg>
          </button>            
          <span>Edit product</span>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span on:click|stopPropagation={deleteProduct} style="position: relative; left: 8px; top: 2px; cursor: pointer;">
            <img src="/trash.svg" alt="delete" width="18px" title="Delete product" />
          </span>
      </div>

      <div class="right_content">
        {#if product && !processing}
          <ProductEditor {product} />
          <div class="form_controls">
            <button on:click={back} type="button" class="rounded_button_outlined">Cancel</button>
            <button type="button" on:click={submit} class="rounded_button_filled">Save</button>
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