<script lang="ts">
	import { goto, invalidate, invalidateAll } from "$app/navigation";
  import { fade, slide, fly, blur, scale } from 'svelte/transition';
  import { appService } from "./app-service";
  import type { DataProduct } from "./interfaces";
  import {capitalizeFirstLetter} from "./utils";

  export let data: DataProduct | undefined = undefined;

  function OpenProduct() {
    // if (window.location.pathname.startsWith("/products/")) {
    //   window.location.href = "/products/" + data?.id;
    // } else {
      appService.GoTo("/products/" + data?.id);
    //}
  }

  function getTypeClass(type: string) {
    let result = "tag tag_blue";
    if (type === "API")
      result = "tag tag_green";
    else if (type === "Analytics Hub")
      result = "tag tag_red";
    else if (type === "Event")
      result = "tag tag_orange";

    return result;
  }
</script>

{#if data}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="product-box" in:fade on:click={OpenProduct}>
    <div>
      {#if data.imageUrl}
        <img height="32px" alt="Product" src={data.imageUrl} />
      {:else}
        <img height="32px" alt="Product" src="https://static-00.iconduck.com/assets.00/bigquery-icon-512x512-fxxj0xd6.png" />
      {/if}
    </div>
    {data.name}
    <div class="product-owner-box">
      { data.audiences?.map((x) => capitalizeFirstLetter(x)).join(", ")}
    </div>
    <div class="product-description-box">
      {data.description}
    </div>
    <div class="tags_box">
      {#each data.protocols as type}
        <span class={getTypeClass(type)}>{type}</span>
      {/each}
    </div>
  </div>
{/if}

<style>
  .product-box {
    color: black;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 5px 0px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 3px 1px -2px;
    padding: 16px 20px;
    transition: box-shadow 0.2s ease 0s;
    width: 246px;
    height: 246px;
    margin: 14px;
    position: relative;
    font-size: large;
  }

  .product-box:hover {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px;
    cursor: pointer;
  }

  .product-owner-box {
    font-size:small;
    font-weight: 300;
    color: rgb(0,0,0,.66);
  }

  .product-description-box {
    font-size: medium;
    color: rgb(0,0,0,.66);
    line-height: 20px;
    margin-top: 8px;
    max-height: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .tags_box {
    position: absolute;
    bottom: 10px;
  }

  .tag {
    padding: 2px 8px 2px 8px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    margin-right: 6px;
  }

  .tag_green {
    background-color: rgb(85, 153, 85);
  }

  .tag_red {
    background-color: rgb(240, 74, 74);
  }

  .tag_orange {
    background-color: orange;
  }

  .tag_blue {
    background-color: #3367d6;
  }
</style>