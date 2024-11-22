<script lang="ts">
  import { DialogType, DataProduct, DisplayOptions, SLA, type DataExchange, type DataExchnageListing } from '$lib/interfaces';
  import InputSelect from '$lib/components.input.select.svelte';
  import TagCloud from '$lib/components.tag.cloud.svelte';
  import { protocols, audiences, DataSourceTypes } from '$lib/utils';
  import { JSONEditor, Mode } from 'svelte-jsoneditor';
  import { text } from '@sveltejs/kit';
  import { onMount } from 'svelte';
  import { appService } from './app-service';
  import { list } from 'firebase/storage';

  export let product: DataProduct;
  let slas: SLA[] = appService.configData ? appService.configData.slas : [];
  let analyticsHubListings: {dataExchanges: DataExchange[], listings: DataExchnageListing[]} = {dataExchanges: [], listings: []};
  let specLoading: boolean = false;
  let payloadLoading: boolean = false;
  let categories: string[] = appService.currentSiteData.categories;
  setCategories();

  onMount(async () => {
    if (product.samplePayload && payloadEditor) {
      let payloadContent = {
        text: product.samplePayload
      }
      payloadEditor.set(payloadContent);
      payloadEditor.refresh();
    }

    if (product.specContents && specEditor) {
      let specContent = {
        text: product.specContents
      };
      specEditor.set(specContent);
      specEditor.refresh();
    }

    // set SLA
    if (slas.length > 0) {
      let sla = slas.find(o => o.id === product.sla.id);
      if (sla) product.sla = sla;
    }
    document.addEventListener("siteUpdated", () => {
      if (slas.length === 0 && appService.configData && appService.configData.slas) {
        slas = appService.configData?.slas;
        let sla = slas.find(o => o.id === product.sla.id);
        if (sla) product.sla = sla;
      }
      setCategories();
    });

    // Fetch analytics hub listing data
    fetch("/api/analytics-hub").then((response) => {
      if (response.status != 200) console.error(`Error fetching analytics hub data: ${response.status} - ${response.statusText}`);
      return response.json();
    }).then((data: any) => {
      analyticsHubListings = data;
    });

    if (!product.samplePayload && product.source === DataSourceTypes.BigQueryTable && product.query) {
      // load sample data
      refreshPayload();
    }
  });

  let samplePayloadData: any = {};
  if (product.samplePayload) samplePayloadData = JSON.parse(product.samplePayload);

  let payloadEditor: {set(content: any): void, refresh(): void};
  let specEditor: {set(content: any): void, refresh(): void};

  function setCategories() {
    appService.currentSiteData.categories.sort(function(a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    categories = appService.currentSiteData.categories;
  }

  function onSourceChange() {
    if (product.source === DataSourceTypes.BigQueryTable) {
      if (appService.currentSiteData.bqtables.length > 0) {
        product.query = appService.currentSiteData.bqtables[0].table;
        product.entity = appService.currentSiteData.bqtables[0].entity;
        refreshPayload();
      }
    } else {
      product.query = "";
      product.entity = "";
    }

    payloadEditor.set({});
    payloadEditor.refresh();
    specEditor.set({});
    specEditor.refresh();
  }

  function onProtocolChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];
    
    if (e.target.checked) {
      if (! product.protocols.includes(name))
        product.protocols.push(name);
    }
    else {
      let index = product.protocols.indexOf(name);
      if (index >= 0)
        product.protocols.splice(index, 1);
    }

    product = product;
  }

  function onAudienceChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];

    if (e.target.checked) {
      if (! product.audiences.includes(name))
        product.audiences.push(name);
    }
    else {
      let index = product.audiences.indexOf(name);
      if (index >= 0)
        product.audiences.splice(index, 1);
    }
  }

  function addCategory(category: string) {
    if (!product.categories.includes(category)) {
      let newProductCopy = product;
      newProductCopy.categories.push(category);
      product = newProductCopy;
    }

    if (!categories.includes(category)) {
      appService.currentSiteData.categories.push(category);
      setCategories();

      // Add to database
      fetch("/api/data/" + appService.currentSiteData.id + "?col=apigee-marketplace-sites", {
        method: "PUT",
        body: JSON.stringify(appService.currentSiteData)
      });
    }
  }

  function removeCategory(category: string) {
    if (product.categories.includes(category)) {
      let newProductCopy = product;
      let index = newProductCopy.categories.indexOf(category);
      newProductCopy.categories.splice(index, 1);
      product = newProductCopy;
    }
  }

  function refreshPayload(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      payloadLoading = true;
      fetch("/api/products/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      }).then((response) => {
        if (response.status === 200) {
          fetch(`/api/products/generate?entity=${product.entity}&type=${product.source}`).then((response) => {
            if (response.status === 200) {
              response.json().then((payload: any) => {
                payloadLoading = false;
                product.samplePayload = JSON.stringify(payload);
                samplePayloadData = payload;
                let payloadContent = {
                  json: payload
                }
                payloadEditor.set(payloadContent);
                payloadEditor.refresh();
                refreshSpec();
                resolve();
              });
            } else {
              payloadLoading = false;
              appService.ShowDialog("An error occurred during data generation, please try another dataset or prompt.", "Ok", DialogType.Ok, []);
            }
          });
        } else {
          payloadLoading = false;
          appService.ShowDialog("An error occurred during data generation, please try another dataset or prompt.", "Ok", DialogType.Ok, []);
        }
      });
    });
  }

  function refreshSpec() {
    if (product.samplePayload) {
      specLoading = true;
      fetch("/api/products/generate/spec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      }).then((response) => {
        return response.json();
      }).then((newProduct: DataProduct) => {
        // product.specPrompt = newProduct.specPrompt;
        product.specContents = newProduct.specContents;
        let specContent = {
          text: newProduct.specContents
        }
        specEditor.set(specContent);
        specEditor.refresh();
        specLoading = false;
      });
    } else {
      appService.ShowDialog("A sample payload is needed to generate an API spec. Please either load or enter a payload into the 'Payload' field.", "OK", DialogType.Ok, []);
    }
  }

  function onQueryChange(e: any) {
    let selectedTable = e.currentTarget.value;
    let dataObject = appService.currentSiteData.bqtables.find(table => table.table === selectedTable);
    if (dataObject) {
      product.entity = dataObject.entity;
      refreshPayload();
    }
  }

  function onGenAiTestChange(e: any) {
    product.entity = product.query.split(" ")[0] + "-data";
    refreshPayload();
  }

  function onPayloadChange(updatedContent: any) {
    if (updatedContent && updatedContent.json)
      product.samplePayload = JSON.stringify(updatedContent.json);
  }

  function onSpecChange(updatedContent: any) {
    if (updatedContent && updatedContent.text)
      product.specContents = updatedContent.text;
    else if (updatedContent && updatedContent.json)
      product.specContents = JSON.stringify(updatedContent.json);
  }
</script>

<div class="right_content_tip">
  Give your data product an appropriate name and description, and enter the query and data source to connect the product to.
  Finally, configure which protocols and audiences your product should be offered to.
  <a href={`/home?site=${appService.currentSiteData.id}`} target="_blank">Learn more <svg class="right_content_tip_learnmore" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M13.85 5H14V4h-4v1h2.15l-5.36 5.364.848.848L13 5.85V8h1V4h-1v.15l.15-.15.85.85-.15.15zM8 4H4.995A1 1 0 004 4.995v8.01a1 1 0 00.995.995h8.01a1 1 0 00.995-.995V10h-1v3H5V5h3V4z"></path></svg></a>
</div>

<div class="product_box">
  <div class="product_left_details">

    <!-- Name -->

    <div class="input_field_panel">
      <!-- svelte-ignore a11y-autofocus -->
      <input class="input_field" type="text" name="name" id="name" required bind:value={product.name} autocomplete="off" autofocus title="none" />
      <label for="name" class='input_field_placeholder'>
        Name
      </label>
    </div>

    <!-- Description -->

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="description" id="description" bind:value={product.description} autocomplete="off" title="none" />
      <label for="description" class='input_field_placeholder'>
        Description
      </label>
    </div>

    <!-- DATA SOURCE SELECTION -->

    <div class="form_list">
      <h4>Data source</h4>
      <div class="select_dropdown">
        <select name="source" id="source" bind:value={product.source} on:change={onSourceChange}>
          <option value={DataSourceTypes.BigQueryTable}>BigQuery table</option>
          <option value={DataSourceTypes.BigQuery}>BigQuery query</option>
          <option value={DataSourceTypes.GenAITest}>Gen AI test data</option>
          <option value={DataSourceTypes.AI}>AI Model</option>
          <option value={DataSourceTypes.API}>API</option>
        </select>
      </div>
    </div>

    <!-- DATA INPUT SELECTION -->

    <div class="input_field_panel">

      {#if product.source === DataSourceTypes.GenAITest}
        <textarea name="query" id="query" required class="input_field" bind:value={product.query} rows="5" on:change={onGenAiTestChange}></textarea>
        <label for="query" class='input_field_placeholder'>
          Describe the type of data that should be generated
        </label>
      {:else if product.source === DataSourceTypes.BigQueryTable}
        <div class="select_dropdown">
          <select name="bqtable" id="bqtable" bind:value={product.query} on:change={onQueryChange}>
            {#each appService.currentSiteData.bqtables as bqtable}
              <option value={bqtable.table}>{bqtable.name}</option>
            {/each}
          </select>
        </div>
      {:else if product.source === DataSourceTypes.BigQuery}
        <textarea name="query" id="query" required class="input_field" bind:value={product.query} rows="5"></textarea>
        <label for="query" class='input_field_placeholder'>
          BigQuery query
        </label>
      {:else}
        <textarea name="query" id="query" required class="input_field" bind:value={product.query} rows="5"></textarea>
        <label for="query" class='input_field_placeholder'>
          Query, table or backend URL
        </label>
      {/if}
    </div>

    <!-- ENTITY NAME -->

    <div class="info_box">
      Choose a technical entity name that makes it easy to recognize and reference the data objects in any protocol.
    </div>

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="entity" id="entity" bind:value={product.entity} autocomplete="off" title="none" />
      <label for="entity" class='input_field_placeholder'>
        Entity name
      </label>
    </div>
  </div>

 
  <!-- PAYLOAD & SPEC -->

  <div style="margin-top: 44px;">
    <div style="display: flex; flex-wrap: wrap;">
      <div class="product_payload">
        <div style="height: 36px;">
          <h4 style="margin-block-end: 0px;">Sample data</h4>
          {#if !payloadLoading}
            <button on:click={refreshPayload} style="position: relative; top: -19px; left: 116px;">Reload</button>
          {:else}
            <span style="position: relative; top: -20px; left: 116px; font-size: 14px;"><img width="20px" alt="generating animation" src="/gemini_sparkle.gif" /></span>
          {/if}
        </div>
        <div style="overflow-y: auto; height: 91%;">
          <JSONEditor bind:this={payloadEditor} onChange="{onPayloadChange}"/>
        </div>
      </div>
    
      <div class="product_payload">
        <div style="height: 36px;">
          <h4 style="margin-block-end: 0px;">Specification</h4>
          {#if !specLoading}
            <button on:click|stopPropagation={refreshSpec} style="position: relative; top: -19px; left: 114px;">Regenerate</button>
          {:else}
            <span style="position: relative; top: -20px; left: 114px; font-size: 14px;"><img width="20px" alt="generating animation" src="/gemini_sparkle.gif" /></span>
          {/if}
        </div>

        <div style="overflow-y: auto; height: 731px; top: 14px;">
          <JSONEditor bind:this={specEditor} mode={Mode.text} onChange="{onSpecChange}" />
        </div>
      </div>
    </div>
  </div>

  <div class="product_left_details">

    <!-- CATEGORY SELECTION -->

    <div class="form_list" style="margin-bottom: 44px;">
      <h4>Categories</h4>

      <InputSelect data={categories} label="Add category - subcategory" onSelect={addCategory} />

      <TagCloud data={product.categories} onRemove={removeCategory} />

    </div>

    <!-- PROTOCOLS SELECTION -->

    <div class="form_list">
      <h4>Protocols</h4>
      {#each protocols as protocol}
        <div class="form_list_line">
          <input id={protocol.name} name={protocol.name} disabled={!protocol.active} checked={product.protocols.includes(protocol.name)} on:change={onProtocolChange} type="checkbox" /><label for={protocol.name}>{protocol.displayName}</label>
        </div>
      {/each}
    </div>

    <!-- ANALYTICS HUB SELECTION -->

    {#if product.protocols.includes("Analytics Hub")}
      <div class="form_list">
        <h4>Analytics Hub listing</h4>
        <div class="select_dropdown">
          <select name="source" id="source" bind:value={product.analyticsHubName}>
            {#each analyticsHubListings.listings as listing}
            <option value={listing.name}>{listing.displayName}</option>
            {/each}
          </select>
        </div>
      </div>
    {/if}

    <!-- AUDIENCE SELECTION -->

    <div class="form_list">
      <h4>Audiences</h4>
      {#each audiences as aud}
        <div class="form_list_line">
          <input id={aud.name} name={aud.name} disabled={!aud.active} checked={product.audiences.includes(aud.name)} on:change={onAudienceChange} type="checkbox" /><label for={aud.name}>{aud.displayName}</label>
        </div>
      {/each}      
    </div>

    <!-- SLA selection -->

    <div class="form_list">
      <h4>SLA</h4>
      <div class="select_dropdown">
        <select name="sla" id="sla" bind:value={product.sla}>
          {#each slas as sla}
            <option value={sla}>{sla.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="form_list">
      <h4>Status</h4>
      <div class="select_dropdown">
        <select name="status" id="status" bind:value={product.status}>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>
    </div>
  </div>
  </div>


<style>

.product_box {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-content: flex-start;
  margin-top: 34px;
}

.product_left_details {
  width: 572px;
}

.product_payload {
  border: 1px solid lightgray;
  width: 600px;
  margin-right: 40px;
  height: 800px;
  padding-left: 10px;
  border-radius: 25px;
}

.info_box {
  color: darkslategray;
  margin: 34px 0px;
}

</style>