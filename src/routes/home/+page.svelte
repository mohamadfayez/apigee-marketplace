<script lang="ts">
  import type { PageServerData } from './$types';
  import { fade, slide, fly, blur, scale } from 'svelte/transition';

  import ProductCard from '$lib/components.product-card.svelte';
  import type { User, Product, Products, DataProduct } from '$lib/interfaces';
  import { onMount } from 'svelte';
  import { appService } from '$lib/app-service';
  import { goto } from '$app/navigation';

  let currentUser: User | undefined = appService.currentUser;
  let products: DataProduct[] | undefined = appService.products;
  let productsByName: {[key: string]: DataProduct} = {};

  let productCategories: {[key: string]: string[]} = {};
  let catProducts: {[key: string]: string[]} = {};
  let catProductsArray: string[] = [];
  let catSubProducts: {[key: string]: string[]} = {};

  let categories: { [key: string]: string[] } = {};
  let categoryArray: string[] = [];

  let category_filter: string = "";
  let types: string[] = [];
  let catChecked: string[] = [];
  let typesChecked: string[] = [];
  let searchText: string = "";
  let visibleProductsCount: number = 0;

  let loading: boolean = true;

	onMount(() => {
    document.addEventListener("userUpdated", () => {
      if (appService.currentUser) {
        currentUser = appService.currentUser;
        reloadProducts();
      }
    });

    document.addEventListener("productsUpdated", () => {
      products = appService.products;
      reloadProducts();
    });

    if (appService.reloadFlag) {
      appService.reloadFlag = false;
      location.reload();
    }

    if (!appService.currentUser && appService.currentUserLoaded) {
      // This means no user is signed in, go to landing page
      appService.GoTo("/");
    }

    products = appService.products;
    reloadProducts();
  });

  function reloadProducts() {
    let tempTypes = types;
    if (products && currentUser?.status == "approved") {
      for (let prod of products) {
        if (prod.status == "Published") {
          productsByName[prod.name] = prod;
          for (let type of prod.protocols) {
            if (!tempTypes.includes(type)) tempTypes.push(type);
          }
            
          for (let category of prod.categories) {
            if (category && category.includes(" - ")) {
              let pieces = category.split(" - ");
              if (!productCategories[prod.name]) {
                productCategories[prod.name] = [];
              }
              productCategories[prod.name].push(category);
              if (! productCategories[prod.name].includes(pieces[0])) productCategories[prod.name].push(pieces[0]);

              if (! catProducts[pieces[0]]) catProducts[pieces[0]] = [];
              if (! catProducts[pieces[0]].includes(prod.name)) catProducts[pieces[0]].push(prod.name);
              if (! catSubProducts[category]) catSubProducts[category] = [];
              catSubProducts[category].push(prod.name);

              if (! categories[pieces[0]])
                categories[pieces[0]] = [];

              if (!categories[pieces[0]].includes(category)) {
                categories[pieces[0]].push(category)
              }
            }
          }
        }
      }

      // set categoryArray and sort alphabetically
      categoryArray = Object.keys(categories);
      categoryArray.sort(function(a, b) {
        var textA = a.toUpperCase();
        var textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });

      types = tempTypes;
      refreshProductList();
      loading = false;
    }
  }

  function onTypeChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];
    let tempTypesChecked = typesChecked;

    if (e.target.checked) {
      
      if (!tempTypesChecked.includes(name)){
        tempTypesChecked.push(name);
      }
    }
    else {

      if (tempTypesChecked.includes(name)) {
        let index = catChecked.indexOf(name);
        tempTypesChecked.splice(index, 1);
      }
    }

    typesChecked = tempTypesChecked;
    refreshProductList();
  }

  function onCatChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];
    let category: string = name.split(" - ")[0];

    let tempChecked = catChecked;
    if (e.target.checked) {
      
      if (!tempChecked.includes(name)){
        tempChecked.push(name);
      }
    }
    else {

      if (tempChecked.includes(name)) {
        let index = catChecked.indexOf(name);
        tempChecked.splice(index, 1);
      }
    }

    catChecked = tempChecked;
    refreshProductList();
  }

  function refreshProductList() {
    let tempCatProducts: {[key: string]: string[]} = {};
    let tempVisibleProductCount: number = 0;

    for (let subCatSel of catChecked) {
      let cat = subCatSel.split(" - ")[0];
      if (! tempCatProducts[cat]) tempCatProducts[cat] = [];

      for (let prodName of catSubProducts[subCatSel]) {
        let prod = productsByName[prodName];
        if (!tempCatProducts[cat].includes(prodName) &&
            (typesChecked.length === 0 || prod.protocols?.some(item => typesChecked.includes(item))) &&
            (prod.audiences?.length === 0 || prod.audiences.includes("external") || currentUser?.roles.some(item => prod.audiences?.includes(item)))) {
          tempCatProducts[cat].push(prodName);
          tempVisibleProductCount++;
        }
      }
    }

    if (catChecked.length === 0) {
      for (let subCat of Object.keys(catSubProducts)) {
        let cat: string = subCat.split(" - ")[0];
        for (let prodName of catSubProducts[subCat]) {
          let prod = productsByName[prodName];
          if (!tempCatProducts[cat]) tempCatProducts[cat] = [];
          if (!tempCatProducts[cat].includes(prodName) &&
            (typesChecked.length === 0 || prod.protocols?.some(item => typesChecked.includes(item))) &&
            (prod.audiences?.length === 0 || prod.audiences.includes("external") || currentUser?.roles.some(item => prod.audiences?.includes(item)))) {
            tempCatProducts[cat].push(prodName);
            tempVisibleProductCount++;
          }
        }
      }
    }

    // set catProductsArray and sort alphabetically
    catProductsArray = Object.keys(tempCatProducts);
    catProductsArray.sort(function(a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    visibleProductsCount = tempVisibleProductCount;
    catProducts = tempCatProducts;
  }
</script>

<div class="header_tabs">
</div>

<div class="header_tabs_box">
  <div class="header_tab_button header_tab_button_selected">
    Catalog
  </div>
  <a href={`/mission?site=${appService.currentSiteData.id}`} class="header_tab_button">
    Our mission
  </a>
  <a href={`/pricing?site=${appService.currentSiteData.id}`} class="header_tab_button">
    Pricing
  </a>
  <a href={`/partners?site=${appService.currentSiteData.id}`} class="header_tab_button">
    Partners
  </a>
  <a href={`/privacy?site=${appService.currentSiteData.id}`} class="header_tab_button">
    Privacy
  </a>
</div>

{#if !loading}
  <div class="home_content">
    <div class="banner" in:fade style={"background-image: url(" + appService.currentSiteData.heroImageUrl + "); background-position: " + appService.currentSiteData.heroBackgroundPosition + ";"}>
      <div class="banner_gradient" style={appService.currentSiteData.heroGradientStyle}>
      </div>
      <div class="banner_title">{"Welcome to " + appService.siteName}
        <div class="banner_subtitle">
          {"The " + appService.siteName + " has all data products, APIs and service ecosystem access."}
        </div>

        <div class="banner_search">
          <svg class="banner_search_icon" width="4%" height="100%" viewBox="0 0 18 18" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M11.18 9.747l4.502 4.503-1.414 1.414-4.5-4.5a5 5 0 1 1 1.41-1.418zM7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill-rule="evenodd"></path></svg>
          <input class="banner_search_input" bind:value={searchText} placeholder="Search for data & API products" />
        </div>
      </div>

    </div>

    <div class="product_showcase">
      
      <div class="product_filter">
        <div class="product_filter_box">
          <div class="product_filter_search">
            <svg class="product_filter_search_icon" data-icon-name="filterIcon" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M2 4h14v2H2V4zm2 4h10v2H4V8zm2 4h6v2H6v-2z"></path></svg>
            <input class="product_filter_search_input" bind:value={category_filter} placeholder="Filter categories" />
          </div>
          <div class="product_filter_header">
            <h3>Type</h3>
          </div>
          {#each types as type}
            <div class="product_filter_checkbox">
              <input type="checkbox" id={type} name={type} on:change={onTypeChange} /><label for={type}>{type}</label>
            </div>
          {/each}
          {#each categoryArray as cat}
            <div class="product_filter_header">
              <h3>{cat}</h3>
            </div>
            {#each categories[cat] as subcat}
              {#if category_filter == "" || subcat.toLowerCase().includes(category_filter.toLowerCase())}
                <div class="product_filter_checkbox">
                  <input type="checkbox" id={subcat} name={subcat} on:change={onCatChange} /><label for={subcat}>{subcat.replace(cat + " - ", "")}</label>
                </div>
              {/if}
            {/each}
          {/each}
        </div>
      </div>
      <div class="product_list">
        {#each catProductsArray as catName}
          {#if catProducts[catName].length > 0}
            <div class="product_list_header">
              {#if searchText === "" || catName.toLowerCase().includes(searchText.toLowerCase())}
                <h2>{catName} products</h2>
              {/if}
            </div>
            {#each catProducts[catName] as prodName, i}
              {#if searchText === "" || catName.toLowerCase().includes(searchText.toLowerCase()) || prodName.toLowerCase().includes(searchText.toLowerCase())}
                <ProductCard data={productsByName[prodName]} />
              {/if}
            {/each}
          {/if}
        {/each}
      </div>

    </div>
  </div>
{:else}
  <div class="ring_lower lds-ring"><div></div><div></div><div></div><div></div></div>
{/if}

<style>

  .home_content {
    /* position: absolute; */
    top: 112px;
  }

  .banner {
    /* background-image: url('/products_banner.png'); */
    /* background-image: url(https://static.it-jobs.aldi-sued.de/img/technology_exc/ALDI_app_scene.jpg); */
    background-size: cover;
    width: 100%;
    height: 300px;
    margin: 0px;
    padding: 0px;
    padding-top: 145px;
  }

  .banner_gradient {
    /* background: linear-gradient(0deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,1) 62%, rgba(255,255,255,.6) 100%); */
    /* background: linear-gradient(0deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,1) 100%); */
    position: relative;
    height: 445px;    
    top: -145px;
    opacity: .8;
  }

  .banner_title {
    text-align: left;
    width: 580px;
    margin-left: auto;
    margin-right: auto;
    font-size: xx-large;
    position: relative;
    top: -445px;
    border-radius: 12px;
    background: rgb(255, 255, 255, .8);
    backdrop-filter: blur(10px);
    padding: 22px;
  }

  .banner_subtitle {
    margin-top: 16px;
    font-size: medium;
  }

  .banner_search {
    width: 100%;
    height: 44px;
    margin-top: 28px;
    border-radius: 5px;
    background-color: #fafafa;
  }

  .banner_search_icon {
    margin-left: 9px;
  }

  .banner_search_input {
    width: 90%;
    margin-top: 4px;
    border-width: 0px;
    font-size: medium;
    border: none;
    background-color: #fafafa;
    position: relative;
    top: -18px;
  }

  .banner_search_input:focus {
    outline: none;
  }

  .product_showcase {
    width: 100%;
    display: flex;
  }

  .product_filter {
    width: 240px;
    height: 700px;
  }

  .product_filter_box {
    padding-bottom: 100px;
  }

  .product_filter_header {
    margin-left: 18px;
  }

  .product_filter_checkbox {
    margin-left: 18px;
    margin-top: 8px;
    color: #333;
    font-size: medium;
    user-select: none;
  }

  .product_filter_checkbox label {
    margin-left: 6px;
  }

  .product_list {
    margin-top: 10px;
    width: calc(100% - 240px);
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    margin-bottom: 100px;
  }

  .product_list_header {
    width: 100%;
    margin-left: 14px;
  }

  .product_filter_search {
    width: 240px;
    height: 44px;
    margin-top: 28px;
    border-radius: 5px;
    background-color: #fafafa;
  }

  .product_filter_search_input {
    border-width: 0px;
    font-size: medium;
    border: none;
    background-color: #fafafa;
    position: relative;
    top: -3px;
    width: 80%;
  }

  .product_filter_search_input:focus {
    outline: none;
  }

  .product_filter_search_icon {
    margin-left: 9px;
    margin-top: 9px;
  }

  /* .ring_lower div {
    position: absolute;
    top: 11vh;
    margin-left: 45vw;
  } */

</style>
