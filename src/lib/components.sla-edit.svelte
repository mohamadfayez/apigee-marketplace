<script lang="ts">
  import { SLA } from '$lib/interfaces';
  import { onMount } from 'svelte';
  import MoneyEdit from '$lib/components.money-edit.svelte';
  import MonetizationBands from '$lib/components.monetization-bands.svelte';
  import { appService } from './app-service';

  export let sla: SLA;
  //let fixedUnitFee: MonetizationRatePlanMoney = {currencyCode: "USD", units: "0", nanos: 0};

  onMount(async () => {

  });

  function onProtocolChange(e: any) {
    // let name: string = e.target.attributes[1]["nodeValue"];
    
    // if (e.target.checked) {
    //   if (! product.protocols.includes(name))
    //     product.protocols.push(name);
    // }
    // else {
    //   let index = product.protocols.indexOf(name);
    //   if (index >= 0)
    //     product.protocols.splice(index, 1);
    // }

    // product = product;
  }

  function onAudienceChange(e: any) {
    // let name: string = e.target.attributes[1]["nodeValue"];

    // if (e.target.checked) {
    //   if (! product.audiences.includes(name))
    //     product.audiences.push(name);
    // }
    // else {
    //   let index = product.audiences.indexOf(name);
    //   if (index >= 0)
    //     product.audiences.splice(index, 1);
    // }
  }

</script>

<div class="right_content_tip">
  Define your SLA definitions that can be connected to your products. Users can track the status of the SLAs in their **Usage** dashboard.
  <a href={`/home?site=${appService.currentSiteData.id}`} target="_blank">Learn more <svg class="right_content_tip_learnmore" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M13.85 5H14V4h-4v1h2.15l-5.36 5.364.848.848L13 5.85V8h1V4h-1v.15l.15-.15.85.85-.15.15zM8 4H4.995A1 1 0 004 4.995v8.01a1 1 0 00.995.995h8.01a1 1 0 00.995-.995V10h-1v3H5V5h3V4z"></path></svg></a>
</div>

<div class="product_box">
  <div class="product_left_details">
    <div class="input_field_panel">
      <!-- svelte-ignore a11y-autofocus -->
      <input class="input_field" type="text" name="name" id="name" required bind:value={sla.name} autocomplete="off" autofocus title="none" />
      <label for="name" class='input_field_placeholder'>
        Name
      </label>
    </div>

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="description" id="description" bind:value={sla.description} autocomplete="off" title="none" />
      <label for="description" class='input_field_placeholder'>
        Description
      </label>
    </div>

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="limit" id="limit" bind:value={sla.upTimeInPercent} autocomplete="off" title="none" />
      <label for="description" class='input_field_placeholder'>
        Uptime in percent
      </label>
    </div>

    <div class="input_field_panel">
      <input class="input_field" required type="text" name="percent" id="percent" bind:value={sla.maxLatencyMS} autocomplete="off" title="none" />
      <label for="percent" class='input_field_placeholder'>
        Maximum average latency in ms
      </label>
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

</style>