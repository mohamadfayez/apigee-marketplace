<script lang="ts">
  import { onMount } from 'svelte';
  import { appService } from "$lib/app-service";
  import { DialogType, ApiApp, ApiAppCredential } from "$lib/interfaces";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";
  import type { PageData } from "./$types";
  import { goto } from '$app/navigation';

  export let data: PageData;

  let products = appService.products;
  let appData: ApiApp | undefined = undefined;
  //if (appService.apiApps) appService.apiApps?.apps.find((item) => APIAppame === data.appName);
  let apiProductChecks: {[key: string]: boolean} = {};

	onMount(() => {
    document.addEventListener("appsUpdated", () => {
      if (appService.apiApps?.apps)
        appData = appService.apiApps?.apps.find((item) => item.name === data.appName);

      setProductChecks();
    });

    document.addEventListener("productsUpdated", () => {
      products = appService.products;
    });

    if (!appData) appData = appService.apiApps?.apps.find((item) => item.name === data.appName);
    setProductChecks();
	});

  function setProductChecks() {
    if (products) {
      for (let product of products) {
        apiProductChecks[product.apigeeProductId] = false;
      }
    }

    if (appData && appData.credentials && appData.credentials.length > 0 && appData.credentials[0].apiProducts) {
      for (let product of appData.credentials[0].apiProducts) {
        apiProductChecks[product.apiproduct] = true;
      }

      appData.credentials.sort((a, b) => parseInt(a.issuedAt) - parseInt(b.issuedAt));
    }
    
    if (appData && appData.attributes) {
      for (let attr of appData.attributes) {
        if (attr.name === "Notes") {
          appData.description = attr.value;
        }
      }
    }
  }

  function setDescription() {
    if (appData && appData.description) {
      let foundNotes: boolean = false;
      if (appData.attributes) {
        for (let attr of appData.attributes) {
          if (attr.name === "Notes") {
            foundNotes = true;
            attr.value = appData.description;
          }
        }
      }

      if (!foundNotes) {
        if (!appData.attributes)
          appData.attributes = [];

        appData.attributes.push({
            name: 'Notes',
            value: appData.description
        });
      }
    }   
  }

  function addKey() {
    if (appService.currentUser && appData) {

      appData.apiProducts = [];
      for (let product of Object.keys(apiProductChecks)) {
        if (apiProductChecks[product]) {
          appData.apiProducts.push(product);
        }
      }

      setDescription();

      fetch("/api/apps/api/" + appData.name + "?email=" + appService.currentUser.email, {
        method: 'POST',
        body: JSON.stringify(appData),
        headers: {
            'content-type': 'application/json',
        },
      }).then((response) => {
          return response.json();
      }).then((data: ApiApp) => {
        if (appService.apiApps && appData) {
          let index = appService.apiApps.apps.indexOf(data);
          appService.apiApps.apps[index] = data;
        }

        appData = data;
        setProductChecks();

        appService.ShowSnackbar("Key has been created.");
      });
    }
  }

  function deleteKey(key: ApiAppCredential) {
    appService.ShowDialog("Do you really want to delete this key?", "Delete", DialogType.OkCancel, []).then((result) => {
      if (result.result === DialogType.Ok) {
        if (appService.currentUser && appData) {
          // appService.DeleteAppKey(appService.currentUser?.email, appData?.name, key.consumerKey);
          
          fetch("/api/apps/api/" + appData.name + "/keys/" + key.consumerKey + "?email=" + appService.currentUser.email, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
          });   
          // remove credential from local data
          let tempAppData = appData;
          let index = tempAppData.credentials?.indexOf(key);
          if (index)
            tempAppData.credentials?.splice(index, 1);

          appData = tempAppData;

          appService.ShowSnackbar("Key has been deleted.");
        }
      }
    });
  }

  function submit() {
    if (appData) {

      appData.apiProducts = [];

      // First reset all the api product subscriptions
      if (appData.credentials && appData.credentials.length > 0) {
        for (let cred of appData.credentials) {
          cred.apiProducts = [];
        }
      }

      // Now set the products
      for (let product of Object.keys(apiProductChecks)) {
        if (apiProductChecks[product]) {
          if (appData.credentials && appData.credentials.length > 0) {
            for (let cred of appData.credentials) {
              cred.apiProducts?.push({
                  apiproduct: product,
                  status: "approved"
              })
            }
          }

          appData.apiProducts.push(product);
        }
      }

      setDescription();

      appService.ShowSnackbar("App updated.");

      if (appService.currentUser?.email) {
        fetch("/api/apps/api/" + appData.name + "?email=" + appService.currentUser.email, {
          method: 'PUT',
          body: JSON.stringify(appData),
          headers: {
              'content-type': 'application/json',
          },
        });
      }
        // appService.UpdateApp(appService.currentUser?.email, appData);
    }

    history.back();
    //goto("/user/apps/api");
  }

  function back() {
    history.back();
    //goto("/user/apps/api");
  }
</script>

<div class="left_menu_page">

  <MenuLeftAccount selectedName="apiapps" />

  <div class="left_menu_page_right">

      <div>
          <div class="left_menu_page_right_header">
              <button class="back_button" on:click={back}>
                <svg data-icon-name="arrowBackIcon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></path></svg>
              </button>            
              <span>Subscription</span>
          </div>

          <div class="left_menu_page_right_content">
            
            <div class="right_content_tip">
              Your credentials will be used for a specific platform and integration. After 
              creating the Client Id and Secret will be displayed here, and always be visible
              in the credentials overview page. 
              <a href={`/home?site=${appService.currentSiteData.id}`} target="_blank">Learn more <svg class="right_content_tip_learnmore" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M13.85 5H14V4h-4v1h2.15l-5.36 5.364.848.848L13 5.85V8h1V4h-1v.15l.15-.15.85.85-.15.15zM8 4H4.995A1 1 0 004 4.995v8.01a1 1 0 00.995.995h8.01a1 1 0 00.995-.995V10h-1v3H5V5h3V4z"></path></svg></a>
            </div>
            
            {#if appData}
              <form method="POST">

                <input type="hidden" id="email" name="email" value={appService.currentUser?.email} />

                <div class="input_field_panel">
                  <!-- svelte-ignore a11y-autofocus -->
                  <input class="input_field" disabled type="text" name="name" id="name" required bind:value={appData.name} autocomplete="off" title="none" />
                  <label for="name" class='input_field_placeholder'>
                    Name
                  </label>
                </div>

                <div class="input_field_panel">
                  <!-- svelte-ignore a11y-autofocus -->
                  <input class="input_field" type="text" name="description" id="description" bind:value={appData.description} autocomplete="off" autofocus title="none" />
                  <label for="description" class='input_field_placeholder'>
                    Description
                  </label>
                </div>

                <div style="margin-top: 12px">
                  <div class="keys_panel">
                    <h4>Keys</h4><button class="text_button add_key_button" type="button" on:click={addKey}>+ Add key</button>
                  </div>

                  <div class="panel_table_content">
                    <table class="flat_table key_table">
                          <thead>
                              <tr>
                                  <th>Key</th>
                                  <th>Secret</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                            {#if appData.credentials}
                              {#each appData.credentials as cred, i}
                                      <tr>
                                          <td>{cred.consumerKey}</td>
                                          <td>*************************</td>
                                          <td>
                                            {#if cred.status === "approved"}
                                              <span style="color: green; font-weight: bold;">Active</span>
                                            {:else}
                                                <span style="color: red; font-weight: bold;">Revoked</span>
                                            {/if}
                                          </td>
                                          <td>
                                            <button type="button" on:click|stopPropagation={() => deleteKey(cred)}>
                                              <svg width="18px" viewBox="0 0 18 18" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M6.5 3c0-.552.444-1 1-1h3c.552 0 1 .444 1 1H15v2H3V3h3.5zM4 6h10v8c0 1.105-.887 2-2 2H6c-1.105 0-2-.887-2-2V6z" fill-rule="evenodd"></path></svg>
                                            </button>
                                          </td>
                                      </tr>
                              {/each}
                            {/if}
                          </tbody>
                      </table>
                  </div>

                </div>

                <div class="product_list">
                  <h4>Product subscriptions</h4>
                  {#if products}
                    {#each products as product}
                      {#if product.apigeeProductId}
                        <div class="product_list_line">
                          <input type="checkbox" id={product.apigeeProductId} name={product.apigeeProductId} bind:checked={apiProductChecks[product.apigeeProductId]}/><label for={product.apigeeProductId}>{product.name}</label>
                        </div>
                      {/if}
                    {/each}
                  {/if}
                </div>

                <div class="controls">
                  <button on:click={back} type="button" class="rounded_button_outlined">Cancel</button>
                  <button type="button" class="rounded_button_filled" on:click={submit}>Save</button>
                </div>

              </form>
            {/if}
          </div>

      </div>
      {#if !appData}
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      {/if}
  </div>

</div>

<style>
    .right_content_tip {
      font-size: 14px;
      max-width: 550px;
      line-height: 18px;
      padding-bottom: 14px;
    }

    .right_content_tip a:hover {
      text-decoration: underline;
    }

    .right_content_tip_learnmore {
      position: relative;
      top: 5px;
      left: -3px;
    }

    .keys_panel {
      display: flex;
      align-items: center;
    }

    .add_key_button {
      font-size: 15px;
    }

    .key_table {
      margin-top: 0px;
    }

    .product_list {
      margin-top: 24px;
    }

    .product_list_line {
      margin-bottom: 8px;
      user-select: none;
    }

    .product_list_line label {
      margin-left: 4px;
    }

    .controls {
      margin-top: 34px;      
    }
</style>
