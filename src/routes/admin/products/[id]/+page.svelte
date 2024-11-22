<script lang="ts">
	import { goto } from '$app/navigation';
  import { appService } from '$lib/app-service';
  import { DataProduct } from '$lib/interfaces';
  import MenuLeftAdmin from '$lib/components-menus-left/menus-left.admin.svelte';
  import ProductEditor from '$lib/components.product-edit.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  export let data: PageData;
  let products: DataProduct[] | undefined = appService.products;
  let product: DataProduct | undefined;
  
  let processing = false;

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
      product = products.find(prod => prod.id === data.productId);
    }
  }

  function submit() {
    
    processing = true;

    if (appService.currentUser && product) product.ownerEmail = appService.currentUser.email;
    
    fetch(`/api/products/${product?.id}?site=${appService.currentSiteData.id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      headers: {
        'content-type': 'application/json',
      },
    }).then((response) => {
        return response.json();
    }).then((data: DataProduct) => {
      let index = appService.products?.findIndex(x => x.id == data.id);
      if (appService.products && index) appService.products[index] = data;
      appService.GoTo("/admin/products");
    }).catch((error) => {
      console.error(error);
    });
  }

  function back() {
    appService.GoTo("/admin/products");
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