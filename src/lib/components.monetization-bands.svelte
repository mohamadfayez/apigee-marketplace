<script lang="ts">
  import { MonetizationRatePlan, MonetizationRatePlanRate } from "./interfaces";
  import MoneyEdit from '$lib/components.money-edit.svelte';

  export let plan: MonetizationRatePlan;

  for (let band of plan.consumptionPricingRates) {
    if (band.start == "") band.start = "0";
    if (band.end == "") band.end = "0";
  }

  function addBand() {
    let rates = plan.consumptionPricingRates;
    let newBand = new MonetizationRatePlanRate();
    let previousBand = rates[rates.length - 1];

    if (previousBand.end == "-1" || previousBand.end == "0" || previousBand.end == "") {
      let currentNano = (parseInt(previousBand.fee.nanos) - 1).toString();
      if (currentNano.length === 1) currentNano = currentNano + "0000000";
      previousBand.end = (parseInt(previousBand.start) + 100).toString();
      newBand.start = (parseInt(previousBand.end) + 1).toString();
      newBand.fee = {currencyCode: "USD", units: previousBand.fee.units, nanos: currentNano};
    } else {
      let previosEnd = parseInt(previousBand.end);
      newBand.start = (previosEnd + 1).toString();
      newBand.fee = {currencyCode: "USD", units: "0", nanos: (100 - rates.length * 10).toString()};
    }

    rates.push(newBand);
    plan.consumptionPricingRates = rates;
  }

  function deleteBand(index: number) {
    let tempRates = plan.consumptionPricingRates;
    tempRates.splice(index, 1);
    tempRates[tempRates.length - 1].end = "-1";
    plan.consumptionPricingRates = tempRates;
  }
</script>

<div style="position: relative; top: -10px;">
  {#each plan.consumptionPricingRates as band, i}
    <div>
      <span class="band_input input_field_panel">
        <input class="input_field" type="text" name={i + "_start"} id={i + "_start"} required bind:value={band.start} autocomplete="off" title="none" />
        <label for={i + "_start"} class='input_field_placeholder'>
          Start
        </label>
      </span>

      <span class="band_input input_field_panel">
        <input class="input_field" type="text" name={i + "_end"} id={i + "_end"} required bind:value={band.end} autocomplete="off" title="none" />
        <label for={i + "_end"} class='input_field_placeholder'>
          End
        </label>
      </span>

      <MoneyEdit amount={band.fee} label="Unit fee" small={true}/>

      {#if i > 0}
        <button on:click|stopPropagation={() => deleteBand(i)}>
          <svg
            width="18px"
            viewBox="0 0 18 18"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            ><path
              d="M6.5 3c0-.552.444-1 1-1h3c.552 0 1 .444 1 1H15v2H3V3h3.5zM4 6h10v8c0 1.105-.887 2-2 2H6c-1.105 0-2-.887-2-2V6z"
              fill-rule="evenodd"
            ></path></svg
          >
        </button>
      {/if}
    </div>
  {/each}
</div>

<button style="margin-top: 20px; font-size: 16px" on:click={addBand}>+ Add band</button>

<style>
  .band_input {
    width: 100px;
    display: inline-block;
    margin-right: 24px;
  }
</style>