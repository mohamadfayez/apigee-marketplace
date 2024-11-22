<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { DialogType, type AnalyticsHubSubscription, type DataProduct } from "$lib/interfaces";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";
  import { PUBLIC_OAUTH_CLIENT_ID } from '$env/static/public';

  
  console.log(PUBLIC_OAUTH_CLIENT_ID);

  let project: string = "";
  let datasetName: string = "";
  $: productId = "";
  $: loadProduct(productId);
  let productData: DataProduct | undefined = undefined;
  let products: DataProduct[] | undefined = appService.products;
  var urlProduct = $page.url.searchParams.get("product");
  if (urlProduct) productId = urlProduct;

  onMount(() => {
    if ($page.url.hash) {
      let urlHash: string = $page.url.hash;
      var values = getParameters(urlHash);
      if (values["product"]) productId = values["product"];
      if (values["access_token"])
        appService.googleAccessToken = values["access_token"];

      loadProduct(productId);
    }

    document.addEventListener("productsUpdated", () => {
      products = appService.products;
      loadProduct(productId);
    });
  });

  function loadProduct(newProductId: string) {
    if (newProductId)
      productData = products?.find(
        (productItem) => productItem.id === productId
      );
  }

  function subscribeGoogle() {
    console.log(PUBLIC_OAUTH_CLIENT_ID);
    let newUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + PUBLIC_OAUTH_CLIENT_ID + "&redirect_uri=" +
      $page.url.origin +
      $page.url.pathname +
      "&response_type=token&scope=https://www.googleapis.com/auth/bigquery&state=product=" + productId;
    // console.log(newUrl);
    window.location.href = newUrl;
  }

  function submit() {
    fetch(
      "https://analyticshub.googleapis.com/v1/" + productData?.analyticsHubName + ":subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + appService.googleAccessToken,
        },
        body: JSON.stringify({
          destinationDataset: {
            datasetReference: {
              projectId: project,
              datasetId: datasetName,
            },
            location: "eu",
          },
        }),
      }
    )
      .then((response) => {
        if (response.ok && response.status === 200) {
          // Subscription was successfully created.
          const productData = appService.products?.find(
            (productItem) => productItem.id === productId
          );
          fetch(
            "/api/apps/bigquery?email=" +
              appService.currentUser?.email +
              "&project=" +
              project +
              "&dataset=" +
              datasetName +
              "&product=" +
              productId +
              "&listingName=" +
              productData?.analyticsHubName +
              "&listingDisplayName=" +
              productData?.anaylticsHubDisplayName +
              "&createdAt=" +
              new Date().toLocaleString(),
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
            .then((data: AnalyticsHubSubscription) => {
              appService.GoTo("/user/apps/bigquery");
            });
        } else if (response.status === 409) {
          appService.ShowDialog(
            "The dataset already exists, so no new subscription could be created.",
            "OK",
            DialogType.Ok, []
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function back() {
    appService.GoTo("/user/apps/bigquery");
  }

  function getParameters(hash: string): { [key: string]: string } {
    let resultValues: { [key: string]: string } = {};

    hash = hash.substring(1);
    let hashValues = hash.split("&");
    for (let hashValue of hashValues) {
      let innerValues = hashValue.split("=");
      if (innerValues.length == 2) {
        if (innerValues[0] === "state") {
          let newInnerValues = innerValues[1].split("%3D");
          if (newInnerValues.length == 2)
            resultValues[newInnerValues[0]] = newInnerValues[1].replace(
              "%20",
              " "
            );
        } else resultValues[innerValues[0]] = innerValues[1];
      }
    }

    return resultValues;
  }
</script>

<div class="left_menu_page">
  <MenuLeftAccount selectedName="bigqueryapps" />

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
        {#if productId}
          <span>Add Analytics Hub subscription for {productId}</span>
        {:else}
          <span>Add Analytics Hub subscription</span>
        {/if}
      </div>

      <div class="left_menu_page_right_content">
        <div class="right_content_tip">
          You can enter let Data Marketplace create your subscription here.
          Alternatively, you can you can subscribe at the <a
            href="https://console.cloud.google.com/bigquery/analytics-hub/exchanges;cameo=analyticshub;pageName=listing-detail;pageResource=apigee-test38.eu.marketplace_18dccea19ab.trading_data_18dccebea66"
            style="color: var(--primary-color)"
            target="_blank"
            >Analytics Hub product page<svg
              class="right_content_tip_learnmore"
              width="18"
              height="18"
              aria-hidden="true"
              ><path
                fill-rule="evenodd"
                d="M13.85 5H14V4h-4v1h2.15l-5.36 5.364.848.848L13 5.85V8h1V4h-1v.15l.15-.15.85.85-.15.15zM8 4H4.995A1 1 0 004 4.995v8.01a1 1 0 00.995.995h8.01a1 1 0 00.995-.995V10h-1v3H5V5h3V4z"
              ></path></svg
            ></a
          >
        </div>
        <br />
        <div>
          <div class="right_content_tip">
            To start click here to authorize Data Marketplace to create your
            subscription with Google Cloud.
            <br /><br />
            <button
              on:click={subscribeGoogle}
              class="rounded_button_outlined"
              disabled={appService.googleAccessToken != ""}
            >
              <svg width="25" height="25" class="sobti"
                ><g fill="none" fill-rule="evenodd"
                  ><path
                    d="M20.66 12.7c0-.61-.05-1.19-.15-1.74H12.5v3.28h4.58a3.91 3.91 0 0 1-1.7 2.57v2.13h2.74a8.27 8.27 0 0 0 2.54-6.24z"
                    fill="#4285F4"
                  /><path
                    d="M12.5 21a8.1 8.1 0 0 0 5.63-2.06l-2.75-2.13a5.1 5.1 0 0 1-2.88.8 5.06 5.06 0 0 1-4.76-3.5H4.9v2.2A8.5 8.5 0 0 0 12.5 21z"
                    fill="#34A853"
                  /><path
                    d="M7.74 14.12a5.11 5.11 0 0 1 0-3.23v-2.2H4.9A8.49 8.49 0 0 0 4 12.5c0 1.37.33 2.67.9 3.82l2.84-2.2z"
                    fill="#FBBC05"
                  /><path
                    d="M12.5 7.38a4.6 4.6 0 0 1 3.25 1.27l2.44-2.44A8.17 8.17 0 0 0 12.5 4a8.5 8.5 0 0 0-7.6 4.68l2.84 2.2a5.06 5.06 0 0 1 4.76-3.5z"
                    fill="#EA4335"
                  /></g
                ></svg
              >
              <span style="position: relative; top: -7px"
                >Authorize through Google</span
              >
            </button>
            {#if appService.googleAccessToken}
              <span title="Authorization set."
                ><svg
                  style="height: 34px; width: 34px; position: relative; top: 12px;"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  ><circle cx="32" cy="32" r="30" fill="#fff" /><path
                    d="M32,2C15.431,2,2,15.432,2,32c0,16.568,13.432,30,30,30c16.568,0,30-13.432,30-30C62,15.432,48.568,2,32,2z M25.025,50  l-0.02-0.02L24.988,50L11,35.6l7.029-7.164l6.977,7.184l21-21.619L53,21.199L25.025,50z"
                    fill="#43a047"
                  /></svg
                ></span
              >
            {/if}
          </div>
        </div>
        <br />
        <br />
        <div class="right_content_tip">
          Now you can enter your Google Cloud project Id and a dataset name that
          will be created for the Analytics Hub subscription.
        </div>
        <form>
          <div class="input_field_panel">
            <!-- svelte-ignore a11y-autofocus -->
            <input
              class="input_field"
              type="text"
              name="name"
              id="name"
              required
              bind:value={project}
              autocomplete="off"
              title="none"
            />
            <label for="name" class="input_field_placeholder">
              Google Cloud project
            </label>
          </div>

          <div class="input_field_panel">
            <input
              class="input_field"
              type="text"
              name="dataset"
              id="dataset"
              required
              bind:value={datasetName}
              autocomplete="off"
              title="none"
            />
            <label for="dataset" class="input_field_placeholder">
              Dataset name
            </label>
          </div>
          <br />
          <br />
          <div class="right_content_tip">
            This is the Data Product that you are subscribing to. You can
            subscribe to a product in multiple projects and in multiple
            datasets.
          </div>

          <div class="form_list">
            <h4>Product subscription</h4>
            <div class="select_dropdown" style="width: 300px;">
              <select name="hubListing" id="hubListing" bind:value={productId} style="">
                {#if products}
                  {#each products as product}
                    {#if product.protocols.includes("Analytics Hub")}
                      <option value={product.id}>{product.name}</option>
                    {/if}
                  {/each}
                {/if}
              </select>
            </div>
          </div>

          <div class="form_controls">
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

  .right_content_tip a:hover {
    text-decoration: underline;
  }

  .right_content_tip_learnmore {
    position: relative;
    top: 5px;
    left: -3px;
  }
</style>
