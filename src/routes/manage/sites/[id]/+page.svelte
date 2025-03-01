<script lang="ts">
  import { DialogResult, DialogType, Site, SLA } from "$lib/interfaces";
  import { onMount } from "svelte";
  import InputSelect from '$lib/components.input.select.svelte';
  import TagCloud from '$lib/components.tag.cloud.svelte';
  import MenuLeftAdmin from '$lib/components-menus-left/menus-left.admin.svelte';
  import SiteEdit from '$lib/components.site-edit.svelte';
  import type { PageData } from "./$types";
  import { appService } from "$lib/app-service";
  
  export let data: PageData;

  let site: Site;

  let categories = [
    "ESG - Environmental",
    "ESG - Social",
    "ESG - Governance"
  ];

  onMount(() => {
    fetch("/api/data/" + data.siteId + "?col=apigee-marketplace-sites").then((response) => {
      if (response.status === 404) {
      }
      else if (response.status === 200)
        return response.json();
    }).then((result: Site) => {
      site = result;
    });
  });

  function back() {
    appService.GoTo("/manage/sites");
  }

  function submit() {
    fetch("/api/data/" + data.siteId + "?col=apigee-marketplace-sites", {
      method: 'PUT',
      body: JSON.stringify(site),
      headers: {
        'content-type': 'application/json',
      },
    }).then((response) => {
      appService.GoTo("/manage/sites", true);
    }).catch((error) => {
      console.error(error);
    });

  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="sites" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
          <button class="back_button" on:click={back}>
            <svg data-icon-name="arrowBackIcon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></path></svg>
          </button>            
          <span>Edit hub</span>
      </div>

      <div class="right_content">
        {#if site}

          <SiteEdit {site} />

          <div class="form_controls">
            <button on:click={back} type="button" class="rounded_button_outlined">Cancel</button>
            <button type="button" on:click={submit} class="rounded_button_filled">Save</button>
          </div>
        {/if}
      </div>

    </div>
  </div>
</div>
