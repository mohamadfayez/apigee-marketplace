<script lang="ts">
  import { onMount } from "svelte";
  import type { MonetizationRatePlanMoney } from "./interfaces";

  export let label: string;
  export let amount: MonetizationRatePlanMoney;
  export let small: boolean = false;

  let input: string = "0";

  onMount(async () => {
    if (amount.units) {
      input = amount.units;
    }

    if (amount.nanos)
      input = (parseInt(input) + ((parseFloat(amount.nanos) / 1000000000))).toFixed(2);
  });

  function onChange(e: any) {
    let value: string = e.srcElement.value;

    if (value) {
      let pieces: string[] = value.split(".");
      if (pieces.length == 2) {
        amount.units = pieces[0];
        if (amount.units == "") amount.units = "0";
        amount.nanos = pieces[1];
        if (amount.nanos.length >= 2 && amount.nanos[0] == '0') {
          // remove leading 0
          amount.nanos = amount.nanos.substring(1);
        }
        amount.nanos += "0000000";
      }
      else if (pieces.length == 1) {
        amount.units = pieces[0];
        amount.nanos = "0";
      }
    }
  }
</script>

<div class={small ? "input_field_panel small" : "input_field_panel"} style="margin-top: 24px;">
  <input class="input_field" on:input={(e) => {onChange(e)}} required type="text" name={label} id={label} bind:value={input} autocomplete="off" title="none" />
  <label for={label} class='input_field_placeholder'>
    {label + " (" + amount.currencyCode + ")"}
  </label>
</div>

<style>
  .small {
    width: 120px;
    display: inline-block;
    margin-right: 24px;
  }
</style>