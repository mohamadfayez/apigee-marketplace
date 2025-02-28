<script lang="ts">
  import { appService } from "$lib/app-service";
  import { DialogType, DialogResult, type SLA, DataGenJob, DataProduct } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
  import { fade, fly, scale, slide } from "svelte/transition";

  let job: DataGenJob = new DataGenJob();
  let processing: boolean = false;

  job.userName = appService.currentUser?.firstName + " " + appService.currentUser?.lastName;
  job.userEmail = appService.currentUser?.email ?? "";
  job.site = appService.currentSiteData.id;
  job.categories = appService.currentSiteData.categories;

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      job.userName = appService.currentUser?.firstName + " " + appService.currentUser?.lastName;
      job.userEmail = appService.currentUser?.email ?? "";
    });

    document.addEventListener("siteUpdated", () => {
      job.site = appService.currentSiteData.id;
      job.categories = appService.currentSiteData.categories;
    });

    if (appService.dataGenJob) {
      job = appService.dataGenJob;
      processing = true;
      monitorJob();
    }
  });

  async function submit() {
    processing = true;
    let response = await fetch("/api/datagen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    let newJob: DataGenJob = await response.json();
    appService.dataGenJob = newJob;
    monitorJob();
  }

  async function monitorJob() {
    if (appService.dataGenJob) {
      const processingResponse = await fetch('/api/datagen?id=' + appService.dataGenJob.id);
      if (processingResponse && processingResponse.body) {
        const reader = processingResponse.body.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          job = JSON.parse(value);
        }
      }

      if (job && job.products.length > 0) {
        appService.products = appService.products?.concat(job.products);
        appService.GoTo("/home");
      }
      appService.dataGenJob = undefined;
      processing = false;
      appService.ShowSnackbar("Data successfully generated.");
    }
  }

</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="datagen" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
          <span>AI DataGen</span>
      </div>

      <div class="right_content">

        <div style="margin-left: 8px; padding-bottom: 10px;">AI DataGen will generate test data for the number of apis and for the given topic entered. The api definitions will be added to the marketplace for this site, as well as to Apigee & API Hub.</div>

        {#if !processing}
          <div transition:fly>
            <div class="input_field_panel">
              <input class="input_field" required type="text" name="description" id="description" bind:value={job.topic} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Topic
              </label>
            </div>
        
            <div class="input_field_panel">
              <input class="input_field" required type="text" name="limit" id="limit" bind:value={job.apiCount} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Number of APIs to generate
              </label>
            </div>

            <div class="form_controls">
              <button type="button" on:click={submit} class="rounded_button_filled">Submit</button>
            </div>
          </div>
        {:else}
          <div in:fade class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div style="margin-bottom: 20px; margin-left: 8px;">
            Created {job.products.length} item(s) of {job.apiCount}.
            {#if job.products && job.products.length > 0}
              {#each job.products as product}
                <div>Item: {product.name}</div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
</style>
