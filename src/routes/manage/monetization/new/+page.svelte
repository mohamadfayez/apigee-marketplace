<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import {
    DataProduct,
    DialogType,
    DisplayOptions,
    MonetizationConsumptionTypes,
    MonetizationRatePlan,
    MonetizationRatePlanMoney,
    MonetizationRatePlanRate,
  } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import MonetizationEditor from "$lib/components.monetization-edit.svelte";
  import { generateRandomString, protocols, audiences } from "$lib/utils";
  import { onMount } from "svelte";

  let plan: MonetizationRatePlan = new MonetizationRatePlan("", "");
  let titleText: string = "Create monetization plan";

  onMount(async () => {

  });

  function submit() {
    plan.name = plan.displayName.replaceAll(" ", "_") + "_" + generateRandomString(5);
    plan.startTime = Date.now();
    let validationResult = validateMonetizationPlan();

    if (validationResult) {
      appService.configData?.ratePlans.push(plan);
      fetch("/api/data/default?col=apigee-marketplace-config", {
        method: "PUT",
        body: JSON.stringify(appService.configData)
      });
      appService.GoTo("/manage/monetization");
    }
    else
      appService.ShowDialog("The rate plan could not be validated, please check the entries and try again.", "Ok", DialogType.Ok, []);
  }

  function back() {
    appService.GoTo("/manage/monetization");
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
