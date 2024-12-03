<script lang="ts">
  import { MonetizationConsumptionTypes, MonetizationRatePlan, MonetizationRatePlanMoney } from '$lib/interfaces';
  import { onMount } from 'svelte';
  import MoneyEdit from '$lib/components.money-edit.svelte';
  import MonetizationBands from '$lib/components.monetization-bands.svelte';
  import { appService } from './app-service';

  export let plan: MonetizationRatePlan;
  //let fixedUnitFee: MonetizationRatePlanMoney = {currencyCode: "USD", units: "0", nanos: 0};

  onMount(async () => {

  });

</script>

<div class="right_content_tip">
  Give your product monetization plan an appropriate name and description, and enter the rate type and details.
  <a href="https://cloud.google.com/apigee/docs/api-platform/monetization/overview" target="_blank">Learn more <svg class="right_content_tip_learnmore" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M13.85 5H14V4h-4v1h2.15l-5.36 5.364.848.848L13 5.85V8h1V4h-1v.15l.15-.15.85.85-.15.15zM8 4H4.995A1 1 0 004 4.995v8.01a1 1 0 00.995.995h8.01a1 1 0 00.995-.995V10h-1v3H5V5h3V4z"></path></svg></a>
</div>

<div class="product_box">
  <div class="product_left_details">
    <div class="input_field_panel">
      <!-- svelte-ignore a11y-autofocus -->
      <input class="input_field" type="text" name="name" id="name" required bind:value={plan.displayName} autocomplete="off" autofocus title="none" />
      <label for="name" class='input_field_placeholder'>
        Name
      </label>
    </div>

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="description" id="description" bind:value={plan.description} autocomplete="off" title="none" />
      <label for="description" class='input_field_placeholder'>
        Description
      </label>
    </div>

    <div class="form_list">
      <h4>Payment model</h4>
      <div class="select_dropdown">
        <select name="paymentFundingModel" id="paymentFundingModel" bind:value={plan.paymentFundingModel}>
          <option value="POSTPAID">Post paid</option>
          <option value="PREPAID">Pre paid</option>
        </select>
      </div>
    </div>

    <div class="form_list">
      <h4>Currency code</h4>
      <div class="select_dropdown">
        <select name="currencyCode" id="currencyCode" bind:value={plan.currencyCode}>
          <option value="USD">USD</option>
          <option value="EUR">EURO</option>
        </select>
      </div>
    </div>

    <div class="form_list">
      <h4>Billing period</h4>
      <div class="select_dropdown">
        <select name="billingPeriod" id="billingPeriod" bind:value={plan.billingPeriod}>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>
    </div>

    <h4>Fees</h4>
    
    <MoneyEdit amount={plan.setupFee} label="Setup fee" />

    <MoneyEdit amount={plan.fixedRecurringFee} label="Fixed recurring fee" />

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="fixedFeeFrequency" id="fixedFeeFrequency" bind:value={plan.fixedFeeFrequency} autocomplete="off" title="none" />
      <label for="fixedFeeFrequency" class='input_field_placeholder'>
        Fixed recurring fee frequency
      </label>
    </div>

    <div class="form_list">
      <h4>Consumption pricing type</h4>
      <div class="select_dropdown">
        <select name="consumptionPricingType" id="consumptionPricingType" bind:value={plan.consumptionPricingType}>
          <option value="FIXED_PER_UNIT">Fixed per unit</option>
          <option value="BANDED">Banded</option>
        </select>
      </div>
    </div>

    {#if plan.consumptionPricingType == MonetizationConsumptionTypes.FIXED_PER_UNIT}
      <div class="input_field_panel">
        <MoneyEdit amount={plan.consumptionPricingRates[0].fee} label="Fixed unit fee" />
      </div>
    {:else}
      <MonetizationBands {plan} />
    {/if}
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

</style>