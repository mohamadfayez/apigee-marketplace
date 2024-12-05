<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import { page } from "$app/stores";
  import type { User, BucketSubscription, DataProduct } from "$lib/interfaces";
  import { onMount } from "svelte";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";

  let currentUser: User | undefined = appService.currentUser;
  let productId: string = "";
  let productName: string = "";
  let productData: DataProduct | undefined;

  var urlProduct = $page.url.searchParams.get("product");
  if (urlProduct) {
    productId = urlProduct;
    productData = appService.products?.find((x) => x.apigeeProductId === productId);
    if (productData) productName = productData.name;
  }

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      currentUser = appService?.currentUser;
    });

    currentUser = appService?.currentUser;
  });

  function submit() {
    productData = appService.products?.find((x) => x.apigeeProductId === productId);

    fetch(
      "/api/apps/storage?email=" +
        currentUser?.email +
        "&product=" +
        productId +
        "&createdAt=" +
        new Date().toLocaleString() + "&entityName=" + productData?.entity,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data: BucketSubscription) => {
        appService.GoTo("/user/apps/storage");
      });
  }

  function back() {
    history.back();
  }
</script>

<div class="left_menu_page">
  <MenuLeftAccount selectedName="bucketapps" />

  <div class="left_menu_page_right">
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
        {#if productName}
          <span>Add Data Sync for {productName}</span>
        {:else}
          <span>Add Data Sync</span>
        {/if}
      </div>

      <div class="left_menu_page_right_content">
        <div class="right_content_tip">
          After creating a data sync, you will get a signed URL that you can use
          to download the refreshed dataset refreshed every 24 hours.
        </div>
        <br />
        <form>
          <div class="product_list">
            <h4>Data products</h4>
            <div class="select_dropdown" style="width: 280px;">
              <select name="product" id="product" bind:value={productId}>
                {#if appService && appService.products}
                  {#each appService.products as product}
                    {#if product.protocols?.includes("Data sync")}
                      <option value={product.apigeeProductId}>{product.name}</option>
                    {/if}
                  {/each}
                {/if}
              </select>
            </div>
          </div>

          <div class="controls">
            <button
              on:click={back}
              type="button"
              class="rounded_button_outlined">Cancel</button
            >
            <button
              on:click={submit}
              type="button"
              class="rounded_button_filled">Create</button
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  .right_content_tip {
    font-size: 14px;
    max-width: 550px;
    line-height: 18px;
  }

  .product_list {
    margin-top: 24px;
  }

  .controls {
    margin-top: 34px;
  }
</style>
