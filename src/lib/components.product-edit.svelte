<script lang="ts">
  import {
    DialogType,
    DataProduct,
    DisplayOptions,
    SLA,
    type DataExchange,
    type DataExchnageListing,
    specPrompt,
    specApiProductPrompt,
    ApiHubApi,
    ApigeeApiProduct,
    DataSourceTypes,
    Site,
    MonetizationRatePlan,
  } from "$lib/interfaces";
  import InputSelect from "$lib/components.input.select.svelte";
  import TagCloud from "$lib/components.tag.cloud.svelte";
  import CatTableSelect from "$lib/components.flat-table-grouped.svelte";
  import { protocols, audiences, capFirst } from "$lib/utils";
  import { JSONEditor, Mode } from "svelte-jsoneditor";
  import { text } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import { appService } from "./app-service";
  import { PUBLIC_API_HOST } from '$env/static/public';

  export let product: DataProduct;
  let slas: SLA[] = appService.configData ? appService.configData.slas : [];
  let site: Site = appService.currentSiteData;
  let bqTables: { name: string; table: string; entity: string }[] =
    appService.currentSiteData?.bqtables ?? [];
  let analyticsHubListings: {
    dataExchanges: DataExchange[];
    listings: DataExchnageListing[];
  } = { dataExchanges: [], listings: [] };
  let apiHubApis: ApiHubApi[] = [];
  let apigeeApiProducts: ApigeeApiProduct[] = [];
  let specLoading: boolean = false;
  let payloadLoading: boolean = false;
  let categories: string[] = appService.currentSiteData.categories;
  let ratePlans: MonetizationRatePlan[] = [];

  let samplePayloadData: any = {};
  if (product.samplePayload)
    samplePayloadData = JSON.parse(product.samplePayload);

  let payloadEditor: { set(content: any): void; refresh(): void, get(): any };
  let specEditor: { set(content: any): void; refresh(): void };
  setCategories();

  onMount(async () => {
    if (product.samplePayload && payloadEditor) {
      let payloadContent = {
        text: product.samplePayload,
      };
      payloadEditor.set(payloadContent);
      payloadEditor.refresh();
    }

    if (product.specContents && specEditor) {
      let specContent = {
        text: product.specContents,
      };
      specEditor.set(specContent);
      specEditor.refresh();
    }

    document.addEventListener("siteUpdated", () => {
      site = appService.currentSiteData;
      if (appService.configData && appService.configData.ratePlans)
        ratePlans = appService.configData.ratePlans;
      bqTables = site.bqtables;
      if (
        slas.length === 0 &&
        appService.configData &&
        appService.configData.slas
      ) {
        slas = appService.configData?.slas;
        let sla = slas.find((o) => o.id === product.sla.id);
        if (sla) product.sla = sla;
      }
      setCategories();
      initialLoad();
    });

    // Fetch analytics hub listing data
    fetch("/api/analyticshub")
      .then((response) => {
        if (response.status != 200)
          console.error(
            `Error fetching analytics hub data: ${response.status} - ${response.statusText}`,
          );
        return response.json();
      })
      .then((data: any) => {
        analyticsHubListings = data;
      });

    // get API Hub APIs
    // fetch("/api/apihub")
    //   .then((response) => {
    //     if (response.status === 200)
    //       return response.json();
    //     else
    //       console.error("Could not fetch API Hub APIs - " + response.status);
    //   })
    //   .then((result: any[]) => {
    //     console.log(result);
    //     let tempApiHubApis = {};
    //     for(let hubApi of result) {
    //       if (hubApi.versions && hubApi.versions.length > 0) {
    //         for (let version of hubApi.versions) {
    //           if (version.deployments && version.deployments.length > 0) {

    //           }
    //         }
    //       }

    //       for (const [key, value] of Object.entries(hubApi.attributes)) {
    //         if (key.endsWith("/source")) {
    //           for (let enumValue of value.enumValues.values) {
    //             if (enumValue.id === "marketplace") fromMarketplace = true;
    //           }
    //         }
    //       }

    //       if(!fromMarketplace) tempApiHubApis.push(hubApi);
    //     }
    //     apiHubApis = result;
    //   });

    // get Apigee products
    // fetch("/api/apigee")
    //   .then((response) => {
    //     return response.json();
    //   })
    //   .then((result: ApigeeApiProduct[]) => {
    //     apigeeApiProducts = result;
    //   });

    // set SLA
    if (slas.length > 0) {
      let sla = slas.find((o) => o.id === product.sla.id);
      if (sla) product.sla = sla;
    }

    // set monetization rate plans
    if (appService.configData && appService.configData.ratePlans)
      ratePlans = appService.configData.ratePlans;

    initialLoad();
  });

  function initialLoad() {
    if (
      !product.query &&
      product.source === DataSourceTypes.BigQueryTable &&
      bqTables.length > 0
    ) {
      product.query = bqTables[0].table;
      product.entity = bqTables[0].entity;
      product.name = bqTables[0].name;
      product.description = "";
      // load sample data
      refreshPayload();
    } else if (!product.query && product.source === DataSourceTypes.AIModel) {
      onSourceChange();
    }
  }

  function setCategories() {
    appService.currentSiteData.categories.sort(function (a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    categories = appService.currentSiteData.categories;
  }

  function onSourceChange() {
    
    specLoading = false;
    payloadLoading = false;

    if (product.source === DataSourceTypes.BigQueryTable) {
      product.query = "";
      initialLoad();
    } else if (product.source === DataSourceTypes.ApigeeProduct) {
      if (apigeeApiProducts.length > 0) {
        // find first non-marketplace product
        for(let p of apigeeApiProducts) {
          if (!p.name.startsWith("marketplace_")) {
            product.query = p.name;
            product.name = p.displayName;
            product.description = p.description;
            onQueryChange(undefined);
            break;
          }
        }
      }
    } else if (product.source === DataSourceTypes.AIModel) {
      product.name = "Gemini API";
      product.description = "Gemini API for the organization.";
      product.query = "publishers/google/models/gemini-2.0-flash-001";
      product.entity = "gemini";
      product.samplePayload = `
{
   "model" : "publishers/google/models/gemini-2.0-flash-001",
   "prompt" : "why is the sky blue?",
   "response" : "The sky appears blue primarily due to a phenomenon called **Rayleigh scattering**.",
   "usage" : {
      "completion_tokens" : 412,
      "prompt_tokens" : 6,
      "total_tokens" : 418
   }
}`;
    } else {
      product.name = "";
      product.description = "";
      product.query = "";
      product.entity = "";
      product.samplePayload = "";
      product.specContents = "";
    }

    payloadEditor.set({text: product.samplePayload});
    payloadEditor.refresh();
    if (product.source === DataSourceTypes.AIModel) {
      setAiSpec();
    } else {
      specEditor.set({text: ""});
      specEditor.refresh();
    }
  }

  function onQueryChange(e: any) {
    if (product.source === DataSourceTypes.BigQueryTable) {
      
      product.samplePayload = "";
      product.specContents = "";
      payloadEditor.set({text: ""});
      payloadEditor.refresh();
      specEditor.set({text: ""});
      specEditor.refresh();
      
      let selectedTable = e.currentTarget.value;
      let dataObject = appService.currentSiteData.bqtables.find(
        (table) => table.table === selectedTable,
      );
      if (dataObject) {
        product.name = dataObject.name;
        product.entity = dataObject.entity;
        refreshPayload();
      }
    } else if (product.source === DataSourceTypes.ApigeeProduct) {
      let apiProduct = apigeeApiProducts.find((x) => x.name === product.query);
      if (apiProduct) {
        product.name = apiProduct.displayName;
        product.description = apiProduct.description;
        if (apiProduct.operationGroup && apiProduct.operationGroup.operationConfigs.length > 0) {
          let proxyName = apiProduct.operationGroup && apiProduct.operationGroup.operationConfigs[0].apiSource;
          fetch("/api/apigee/basepath?proxyName=" + proxyName).then((response) => {
            console.log(response);
            if (response.status === 200) return response.json();
          }).then((result: {basePath: string}) => {
            product.path = result.basePath;
            if (apiProduct.operationGroup && apiProduct.operationGroup.operationConfigs.length > 0 && apiProduct.operationGroup.operationConfigs[0].operations.length > 0) {
              product.path += apiProduct.operationGroup.operationConfigs[0].operations[0].resource;
              if (apiProduct.operationGroup.operationConfigs[0].operations[0].methods.length > 0) {
                product.pathVerbs = apiProduct.operationGroup.operationConfigs[0].operations[0].methods;
              } else {
                product.pathVerbs = ["GET"];
              }
            }
          });
        }
      }

      product.samplePayload = "";
      product.specContents = "";
      payloadEditor.set({text: ""});
      payloadEditor.refresh();
      specEditor.set({text: ""});
      specEditor.refresh();
    }
  }

  function onAiModelChange(e: any) {
    if (product.query.includes("flash-thinking")) {
      product.name = "Gemini Thinking API";
      product.entity = "gemini-thinking";
    }
    else if (product.query.includes("gemini")) {
      product.name = "Gemini API";
      product.entity = "gemini";
    }
    else if (product.query.includes("llama")) {
      product.name = "Llama API";
      product.entity = "llama";
    }
    else if (product.query.includes("mistral")) {
      product.name = "Mistral API";
      product.entity = "mistral";
    }

    product.description = product.name + " for the organization.";

    setAiPayload();
    setAiSpec();
  }

  function onSystemPromptChange(e: any) {
    let pieces = product.queryAdditionalInfo.split(" ");
    if (pieces.length > 1) {
      product.entity = pieces[pieces.length - 2] + "-" + pieces[pieces.length - 1].replace(".", "");
      setAiSpec();
    }
  }

  function onGenAiTestChange(e: any) {
    let pieces = product.query.split(" ");
    if (pieces.length > 1 && pieces[1].toLowerCase() != "data") {
      product.entity = pieces[0].toLowerCase() + "-" + pieces[1].toLowerCase() +  "-data";
      if (!product.name) product.name = capFirst(pieces[0]) + " " + capFirst(pieces[1]) + " API";
      if (!product.description) product.description = capFirst(pieces[0]) + " " + capFirst(pieces[1]) + " API for the organization.";
    }
    else if (pieces.length > 1) {
      product.entity = pieces[0].toLowerCase() + "-" + pieces[1].toLowerCase();
      if (!product.name) product.name = capFirst(pieces[0]) + " " + capFirst(pieces[1]) + " API";
      if (!product.description) product.description = capFirst(pieces[0]) + " " + capFirst(pieces[1]) + " API for the organization.";
    }
    else if (pieces.length > 0) {
      product.entity = pieces[0].toLowerCase() + "-data";
      if (!product.name) product.name = capFirst(pieces[0]) + " API";
      if (!product.description) product.description = capFirst(pieces[0]) + " API for the organization.";
    }
    
    refreshPayload();
  }

  function onProtocolChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];

    if (e.target.checked) {
      if (!product.protocols.includes(name)) product.protocols.push(name);
    } else {
      let index = product.protocols.indexOf(name);
      if (index >= 0) product.protocols.splice(index, 1);
    }

    product = product;
  }

  function onAudienceChange(e: any) {
    let name: string = e.target.attributes[1]["nodeValue"];

    if (e.target.checked) {
      if (!product.audiences.includes(name)) product.audiences.push(name);
    } else {
      let index = product.audiences.indexOf(name);
      if (index >= 0) product.audiences.splice(index, 1);
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
      fetch(
        "/api/data/" +
          appService.currentSiteData.id +
          "?col=apigee-marketplace-sites",
        {
          method: "PUT",
          body: JSON.stringify(appService.currentSiteData),
        },
      );
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
      if (product.source.startsWith("BigQuery") || product.source === DataSourceTypes.GenAITest || product.source === DataSourceTypes.API) {
        payloadLoading = true;
        fetch("/api/products/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }).then((response) => {
          if (response.status === 200) {
            // If this is a mock payload, we can simply continue with it.
            if (product.source === DataSourceTypes.GenAITest) {
              response.json().then((payload: any) => {
                if (payloadLoading) {
                  payloadLoading = false;
                  product.samplePayload = JSON.stringify(payload);
                  samplePayloadData = payload;
                  let payloadContent = {
                    json: payload,
                  };
                  payloadEditor.set(payloadContent);
                  payloadEditor.refresh();
                  refreshSpec();
                }
                resolve();
              });
            } else {
              // For the other types (BQ..), we need to make a test call to get the data.
              fetch(
                `/api/products/generate?entity=${product.entity}&type=${product.source}`,
              ).then((response) => {
                if (response.status === 200) {
                  response.json().then((payload: any) => {
                    if (payloadLoading) {
                      payloadLoading = false;
                      product.samplePayload = JSON.stringify(payload);
                      samplePayloadData = payload;
                      let payloadContent = {
                        json: payload,
                      };
                      payloadEditor.set(payloadContent);
                      payloadEditor.refresh();
                      refreshSpec();
                    }
                    resolve();
                  });
                } else {
                  payloadLoading = false;
                  appService.ShowDialog(
                    "An error occurred during data generation, please try another dataset or prompt.",
                    "Ok",
                    DialogType.Ok,
                    [],
                  );
                }
              });
            }
          } else {
            payloadLoading = false;
            appService.ShowDialog(
              "An error occurred during data generation, please try another dataset or prompt.",
              "Ok",
              DialogType.Ok,
              [],
            );
          }
        });
      } else if (product.source === DataSourceTypes.AIModel) {
        setAiPayload();
      }
    });
  }

  function refreshSpec() {

    if (product.source === DataSourceTypes.AIModel) {
      setAiSpec();
    } else {
      let editorValue = payloadEditor.get();
      if (editorValue && editorValue.text)
        product.samplePayload = editorValue.text;

      if (product.samplePayload) {
        specLoading = true;

        // set prompt
        if (product.source === DataSourceTypes.ApigeeProduct)
          product.specPrompt = specApiProductPrompt;
        else
          product.specPrompt = specPrompt;

        fetch("/api/products/generate/spec", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        })
        .then((response) => {
          return response.json();
        })
        .then((newProduct: DataProduct) => {
          if (specLoading) {
            product.specContents = newProduct.specContents;
            let specContent = {
              text: newProduct.specContents,
            };
            specEditor.set(specContent);
            specEditor.refresh();
            specLoading = false;
          }
        });
      } else {
        appService.ShowDialog(
          "A sample payload is needed to generate an API spec. Please either load or enter a payload into the 'Payload' field.",
          "OK",
          DialogType.Ok,
          [],
        );
      }
    }
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

  function setAiPayload() {
    product.samplePayload = `
{
   "model" : "${product.query}",
   "prompt" : "why is the sky blue?",
   "response" : "The sky appears blue primarily due to a phenomenon called **Rayleigh scattering**.",
   "usage" : {
      "completion_tokens" : 412,
      "prompt_tokens" : 6,
      "total_tokens" : 418
   }
}`;
    payloadEditor.set({text: product.samplePayload});
    payloadEditor.refresh();
  }

  function setAiSpec() {
    product.specContents = `

{
  "openapi": "3.0.0",
  "info": {
    "title": "${product.name}",
    "version": "1.0.0",
    "description": "This API allows you to interact with the ${product.name} language model.  All requests require an API key in the 'x-api-key' header."
  },
  "servers": [
    {
      "url": "https://${PUBLIC_API_HOST}",
      "description": "${product.name} Server"
    }
  ],
  "paths": {
    "/v1/genai/${product.entity}": {
      "post": {
        "summary": "Create a new ${product.name} response",
        "description": "Creates a new ${product.name} response.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GenAiRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "${product.name} response created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GenAiResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "apiKeyAuth": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "GenAiRequest": {
        "type": "object",
        "properties": {
          "prompt": {
            "type": "string",
            "example": "why is the sky blue?"
          }
        }
      },
      "GenAiResponse": {
        "type": "object",
        "properties": {
          "model": {
            "type": "string",
            "example": "publishers/google/models/gemini-2.0-flash-001"
          },
          "prompt": {
            "type": "string",
            "example": "why is the sky blue?"
          },
          "response": {
            "type": "string",
            "example": "The sky appears blue primarily due to a phenomenon called **Rayleigh scattering**."
          },
          "usage": {
            "type": "object",
            "properties": {
              "completion_tokens": {
                "type": "integer",
                "example": 12
              },
              "prompt_tokens": {
                "type": "integer",
                "example": 6
              },
              "total_tokens": {
                "type": "integer",
                "example": 18
              }
            }
          }
        }
      }
    },
    "securitySchemes": {
      "apiKeyAuth": {
        "type": "apiKey",
        "name": "x-api-key",
        "in": "header"
      }
    }
  }
}`;
    let specContent = {
      text: product.specContents,
    };
    specEditor.set(specContent);
    specEditor.refresh();
  }
</script>

<div class="right_content_tip">
  Give your data product an appropriate name and description, and enter the
  query and data source to connect the product to. Finally, configure which
  protocols and audiences your product should be offered to.
  <a href={`https://cloud.google.com/apigee/docs/api-platform/publish/what-api-product`} target="_blank"
    >Learn more <svg
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

<div class="product_box">
  <div class="product_left_details">

    <!-- DATA SOURCE SELECTION -->

    <div class="form_list" style="position: relative; top: -12px;">
      <h4>Data source</h4>
      <div class="select_dropdown">
        <select
          name="source"
          id="source"
          bind:value={product.source}
          on:change={onSourceChange}
        >
          <option value={DataSourceTypes.BigQueryTable}>BigQuery table</option>
          <option value={DataSourceTypes.BigQuery}>BigQuery query</option>
          <option value={DataSourceTypes.AIModel}>AI Model</option>
          <option value={DataSourceTypes.GenAITest}>Gen AI test data</option>
          <!-- <option value={DataSourceTypes.ApigeeProduct}>{DataSourceTypes.ApigeeProduct}</option-->
          <!-- <option value={DataSourceTypes.ApiHub}>{DataSourceTypes.ApiHub}</option> -->
          <option value={DataSourceTypes.API}>API endpoint</option>
        </select>
      </div>
    </div>

    <!-- DATA INPUT SELECTION -->

    <div class="input_field_panel" style="position: relative; top: -12px;">
      {#if product.source === DataSourceTypes.GenAITest}
        <!-- svelte-ignore a11y-autofocus -->
        <textarea
          name="query"
          id="query"
          required
          class="input_field"
          bind:value={product.query}
          rows="5"
          on:change={onGenAiTestChange}
          autofocus
        ></textarea>
        <label for="query" class="input_field_placeholder">
          Describe the type of data that should be generated
        </label>
      {:else if product.source === DataSourceTypes.BigQueryTable}
        <div class="select_dropdown" style="width: 270px;">
          <select
            name="bqtable"
            id="bqtable"
            bind:value={product.query}
            on:change={onQueryChange}
          >
            {#each bqTables as bqtable}
              <option value={bqtable.table}>{bqtable.name}</option>
            {/each}
          </select>
        </div>
      {:else if product.source === DataSourceTypes.BigQuery}
        <textarea
          name="query"
          id="query"
          required
          class="input_field"
          bind:value={product.query}
          rows="5"
        ></textarea>
        <label for="query" class="input_field_placeholder">
          BigQuery query
        </label>
      {:else if product.source === DataSourceTypes.AIModel}
        <div style="width: 100%; margin-bottom: 10px;">Base model:</div>
        <div class="select_dropdown" style="width: 270px;">
          <select
            name="aimodel"
            id="aimodel"
            bind:value={product.query}
            on:change={onAiModelChange}
          >
            <option value="publishers/google/models/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
            <option value="publishers/google/models/gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking</option>
            <option value="publishers/google/models/gemini-2.0-pro-exp-02-05" selected>Gemini 2.0 Pro</option>
            <option value="publishers/meta/models/llama-3.3-70b-instruct-maas">Llama 3.3</option>
            <option value="mistralnemo">Mistral Nemo</option>
          </select>
        </div>
      {:else if product.source === DataSourceTypes.ApiHub}
        <div style="width: 380px; height: 300px;">
          <CatTableSelect linkColumnName="Name" update={()=> {}} headers={["Name", "Version", "Created on", "Updated on"]} categories={{
            "test1": [
            {
              "Name": "test1",
              "Version": "v1",
              "Created on": "",
              "Updted on": ""
            },{
              "Name": "test1",
              "Version": "v2",
              "Created on": "",
              "Updted on": ""
            }],
            "test2": [
            {
              "Name": "test2",
              "Version": "v1",
              "Created on": "",
              "Updted on": ""
            },{
              "Name": "test2",
              "Version": "v1",
              "Created on": "",
              "Updted on": ""
            }
          ]}} />
        </div>
        <!-- <div class="select_dropdown">
          <select
            name="apihubapi"
            id="apihubapi"
            bind:value={product.query}
            on:change={onQueryChange}
          >
            {#each apiHubApis as api}
              <option value={api.name}>{api.displayName}</option>
            {/each}
          </select>
        </div> -->
      {:else if product.source === DataSourceTypes.ApigeeProduct}
        <div class="select_dropdown">
          <select
            name="apigeeproducts"
            id="apigeeproducts"
            bind:value={product.query}
            on:change={onQueryChange}
          >
            {#each apigeeApiProducts as apigeeProduct}
              {#if !apigeeProduct.name.startsWith("marketplace_")}
                <option value={apigeeProduct.name}
                  >{apigeeProduct.displayName}</option
                >
              {/if}
            {/each}
          </select>
        </div>
      {:else if product.source === DataSourceTypes.API}
        <textarea
          name="query"
          id="query"
          required
          class="input_field"
          bind:value={product.query}
          rows="5"
        ></textarea>
        <label for="query" class="input_field_placeholder">
          Backend URL
        </label>
      {/if}
    </div>

    <!-- Name -->

    <div class="input_field_panel">
      <!-- svelte-ignore a11y-autofocus -->
      <input
        class="input_field"
        type="text"
        name="name"
        id="name"
        required
        bind:value={product.name}
        autocomplete="off"
        autofocus
        title="none"
      />
      <label for="name" class="input_field_placeholder"> Name </label>
    </div>

    <!-- Description -->

    <div class="input_field_panel">
      <input
        class="input_field"
        required
        type="text"
        name="description"
        id="description"
        bind:value={product.description}
        autocomplete="off"
        title="none"
      />
      <label for="description" class="input_field_placeholder">
        Description
      </label>
    </div>

    <!-- GEN AI SYSTEM PROMPT-->
    {#if product.source === DataSourceTypes.AIModel}
      <div class="input_field_panel">
        <textarea
          name="systemprompt"
          id="systemprompt"
          required
          class="input_field"
          bind:value={product.queryAdditionalInfo}
          on:blur={onSystemPromptChange}
          rows="5"
        ></textarea>
        <label for="systemprompt" class="input_field_placeholder">
          System prompt
        </label>
      </div>
    {/if}

    <!-- ENTITY NAME -->

    {#if product.source.startsWith("BigQuery") || product.source === DataSourceTypes.GenAITest || product.source === DataSourceTypes.API || product.source === DataSourceTypes.AIModel}
      <div class="info_box">
        Choose a technical entity name that makes it easy to recognize the path and type of data.
      </div>

      <div class="input_field_panel">
        <input
          class="input_field"
          required
          type="text"
          name="entity"
          id="entity"
          bind:value={product.entity}
          autocomplete="off"
          title="none"
        />
        <label for="entity" class="input_field_placeholder">
          Entity name
        </label>
      </div>
    {/if}

    <!-- Approval required -->

    <div style="margin-top: 22px">
      <h4>Approval required</h4>
      <input
        type="checkbox"
        name="approvalRequired"
        id="approvalRequired"
        bind:checked={product.approvalRequired}
        autocomplete="off"
        title="none"
        style="position: relative; top: -8px; transform: scale(1.2); width: 34px;"
      />
    </div>
  </div>

  <!-- PAYLOAD & SPEC -->

  <div style="margin-top: 22px;">
    <div style="display: flex; flex-wrap: wrap;">
      <div class="product_payload">
        <div style="height: 36px;">
          <h4 style="margin-block-end: 0px;">Sample data</h4>
          {#if !payloadLoading}
            <button
              on:click={refreshPayload}
              style="position: relative; top: -19px; left: 116px;"
              >Reload</button
            >
          {:else}
            <span
              style="position: relative; top: -20px; left: 116px; font-size: 14px;"
              ><img
                width="20px"
                alt="generating animation"
                src="/gemini_sparkle.gif"
              /></span
            >
          {/if}
        </div>
        <div style="overflow-y: auto; height: 91%;">
          <JSONEditor bind:this={payloadEditor} onChange={onPayloadChange} />
        </div>
      </div>

      <div class="product_payload">
        <div style="height: 36px;">
          <h4 style="margin-block-end: 0px;">Specification</h4>
          {#if !specLoading}
            <button
              on:click|stopPropagation={refreshSpec}
              style="position: relative; top: -19px; left: 114px;"
              >Regenerate</button
            >
          {:else}
            <span
              style="position: relative; top: -20px; left: 114px; font-size: 14px;"
              ><img
                width="20px"
                alt="generating animation"
                src="/gemini_sparkle.gif"
              /></span
            >
          {/if}
        </div>

        <div style="overflow-y: auto; height: 731px; top: 14px;">
          <JSONEditor
            bind:this={specEditor}
            mode={Mode.text}
            onChange={onSpecChange}
          />
        </div>
      </div>
    </div>
  </div>

  <div class="product_left_details">
    <!-- CATEGORY SELECTION -->

    <div class="form_list" style="margin-bottom: 44px;">
      <h4>Categories</h4>

      <TagCloud data={product.categories} onRemove={removeCategory} />

      <InputSelect
        data={categories}
        label="Add category - subcategory"
        onSelect={addCategory}
      />
    </div>

    <!-- PROTOCOLS SELECTION -->

    <div class="form_list">
      <h4>Protocols</h4>
      {#each protocols as protocol}
        <div class="form_list_line">
          <input
            id={protocol.name}
            name={protocol.name}
            disabled={!protocol.active}
            checked={product.protocols.includes(protocol.name)}
            on:change={onProtocolChange}
            type="checkbox"
          /><label for={protocol.name}>{protocol.displayName}</label>
        </div>
      {/each}
    </div>

    <!-- ANALYTICS HUB SELECTION -->

    {#if product.protocols.includes("Analytics Hub")}
      <div class="form_list">
        <h4>Analytics Hub listing</h4>
        <div class="select_dropdown">
          <select
            name="source"
            id="source"
            bind:value={product.analyticsHubName}
          >
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
          <input
            id={aud.name}
            name={aud.name}
            disabled={!aud.active}
            checked={product.audiences.includes(aud.name)}
            on:change={onAudienceChange}
            type="checkbox"
          /><label for={aud.name}>{aud.displayName}</label>
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

    <!-- MONETIZATION selection -->

    <div class="form_list">
      <h4>Monetization rate plan</h4>
      <div class="select_dropdown">
        <select name="monetization" id="monetization" bind:value={product.monetizationId}>
          <option value=""> </option>
          {#each ratePlans as ratePlan}
            <option value={ratePlan.name}>{ratePlan.displayName}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- PUBLISHED / DRAFT selection -->

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
