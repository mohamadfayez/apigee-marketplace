<script lang="ts">
  import { appService } from "$lib/app-service";
  import { DialogType, DialogResult, type SLA, DataGenJob } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
    import { fade, fly, scale, slide } from "svelte/transition";

  let job: DataGenJob = new DataGenJob();
  let processing: boolean = false;

  job.userName = appService.currentUser?.firstName + " " + appService.currentUser?.lastName;
  job.userEmail = appService.currentUser?.email ?? "";

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      job.userName = appService.currentUser?.firstName + " " + appService.currentUser?.lastName;
      job.userEmail = appService.currentUser?.email ?? "";
    });
  });

  async function submit() {
    processing = true;
    let response = await fetch("/api/datagen", {
      method: "POST",
      body: JSON.stringify(job)
    });
    processing = false;
    appService.ShowSnackbar("Data successfully generated.")
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

        {#if !processing}
          <div transition:fly>
            <div class="input_field_panel">
              <input class="input_field" required type="text" name="description" id="description" bind:value={job.topic} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Topic
              </label>
            </div>
        
            <div class="input_field_panel">
              <input class="input_field" required type="text" name="limit" id="limit" bind:value={job.categoryCount} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Number of Categories to generate
              </label>
            </div>

            <div class="input_field_panel">
              <input class="input_field" required type="text" name="limit" id="limit" bind:value={job.apiCount} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Number of APIs to generate
              </label>
            </div>

            <div class="input_field_panel">
              <input class="input_field" required type="text" name="limit" id="limit" bind:value={job.versionCount} autocomplete="off" title="none" />
              <label for="description" class='input_field_placeholder'>
                Number of Versions per API to generate
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
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
</style>
