<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import {
    DataProduct,
    DisplayOptions,
    MonetizationConsumptionTypes,
    MonetizationRatePlan,
    MonetizationRatePlanRate,
  } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import MonetizationEditor from "$lib/components.monetization-edit.svelte";
  import { generateRandomString, protocols, audiences } from "$lib/utils";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  let plan: MonetizationRatePlan;
  let products: DataProduct[] | undefined = appService.products;
  let product: DataProduct;
  let titleText: string = "Create monetization plan";

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
      let tempProduct = products.find((prod) => prod.id === data.productId);
      if (tempProduct) product = tempProduct;

      if (product?.monetizationId) {
        titleText = "Edit monetization plan";

        // Load monetization data
        fetch(
          "/api/products/" +
            product.id +
            "/monetization/" +
            product?.monetizationId
        )
          .then((response) => {
            if (response.status == 200) return response.json();
            else {
              // Error fetching monetization plan, probably doesn't exist, reset...
              product.monetizationId = "";
              product.monetizationData = undefined;
              return new MonetizationRatePlan(
                product.id,
                product.name + " plan"
              );
            }
          })
          .then((monetizationRecord: MonetizationRatePlan) => {
            plan = monetizationRecord;
          });
      } else {
        plan = new MonetizationRatePlan(product.id, product.name + " plan");
      }
    }
  }

  function submit() {
    plan.apiproduct = product.id;
    plan.startTime = Date.now();
    let validationResult = validateMonetizationPlan();

    if (validationResult && !product.monetizationId) {
      // Create new monetization plan
      fetch("/api/products/" + product.id + "/monetization", {
        method: "POST",
        body: JSON.stringify(plan),
      })
        .then((response: Response) => {
          if (response.status != 200 && response.status != 201) {
            console.log(
              `Error creating montization plan ${response.status} - ${response.statusText}`
            );
            appService.ShowSnackbar(
              "Error updating monetization plan: " + response.statusText
            );
          }
          return response.json();
        })
        .then((result: any) => {
          // Now update product with monetization name
          if (result.name) {
            product.monetizationId = result.name;
            product.monetizationData = result;
            // Update in appservice
            let index = appService.products?.findIndex(
              (x) => x.id == product.id
            );
            if (appService.products && index)
              appService.products[index] = product;
            fetch("/api/products/" + product.id + "?site=" + appService.currentSiteData.id, {
              method: "PUT",
              body: JSON.stringify(product),
            });

            appService.ShowSnackbar("Monetization plan created.");
          } else {
            console.error(
              "Monetization rate could not be created! " +
                JSON.stringify(result)
            );
          }

          appService.GoTo("/admin/monetization");
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (validationResult) {
      // Update monetization plan
      fetch("/api/products/" + product.id + "/monetization/" + plan.name, {
        method: "PUT",
        body: JSON.stringify(plan),
      })
        .then((response: Response) => {
          if (response.status != 200 && response.status != 201) {
            console.log(
              `Error updating montization plan ${response.status} - ${response.statusText}`
            );
            appService.ShowSnackbar(
              "Error updating monetization plan: " + response.statusText
            );
          }
          return response.json();
        })
        .then((result: any) => {
          // Now update product with monetization name
          if (result.name) {
            product.monetizationId = result.name;
            product.monetizationData = result;
            // Update in appservice
            let index = appService.products?.findIndex(
              (x) => x.id == product.id
            );
            if (appService.products && index)
              appService.products[index] = product;
            fetch("/api/products/" + product.id + "?site=" + appService.currentSiteData.id, {
              method: "PUT",
              body: JSON.stringify(product),
            });

            appService.ShowSnackbar("Monetization plan updated.");
          } else {
            console.error(
              "Monetization rate could not be updated! " +
                JSON.stringify(result)
            );
          }

          appService.GoTo("/admin/monetization");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  function back() {
    appService.GoTo("/admin/monetization");
  }

  function validateMonetizationPlan(): boolean {
    let result: boolean = true;

    // Make sure if there is a fixed fee, that there is also a fixed fee interval
    if (plan.fixedRecurringFee && !plan.fixedFeeFrequency)
      plan.fixedFeeFrequency = 1;

    // Make sure if there is a fixed fee, that it > 0
    if (
      plan.consumptionPricingType ==
        MonetizationConsumptionTypes.FIXED_PER_UNIT &&
      (plan.consumptionPricingRates.length == 0 ||
        ((plan.consumptionPricingRates[0].fee.nanos == "" ||
          plan.consumptionPricingRates[0].fee.nanos == "0") &&
          (plan.consumptionPricingRates[0].fee.units == "" ||
            plan.consumptionPricingRates[0].fee.units == "0")))
    ) {
      result = false;
      appService.ShowSnackbar("Fixed fee must be greater than 0.");
    }

    // Make sure that the rate bands are ok
    if (plan.consumptionPricingType === MonetizationConsumptionTypes.BANDED) {
      if (plan.consumptionPricingRates.length > 0) {
        plan.consumptionPricingRates[0].start = "0";
        plan.consumptionPricingRates[
          plan.consumptionPricingRates.length - 1
        ].end = "0";
      }
    } else if (
      plan.consumptionPricingType ===
      MonetizationConsumptionTypes.FIXED_PER_UNIT
    ) {
      plan.consumptionPricingRates[0].start = "0";
      plan.consumptionPricingRates[0].end = "0";
    }

    return result;
  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="monetization" />

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
        <span>{titleText}</span>
      </div>

      <div class="right_content">
        {#if plan}
          <MonetizationEditor {plan} />

          <div class="form_controls">
            <button
              on:click={back}
              type="button"
              class="rounded_button_outlined">Cancel</button
            >
            <button
              type="button"
              on:click={submit}
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
