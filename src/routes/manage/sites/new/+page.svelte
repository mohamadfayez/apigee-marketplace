<script lang="ts">
  import { Site } from "$lib/interfaces";
  import { onMount } from "svelte";
  import MenuLeftAdmin from '$lib/components-menus-left/menus-left.admin.svelte';
  import SiteEdit from '$lib/components.site-edit.svelte';
  import { generateRandomString, defaultCategories, bqtables } from "$lib/utils";
  import { appService } from "$lib/app-service";
  import { PUBLIC_PROJECT_ID } from '$env/static/public';
    import { goto } from "$app/navigation";

  let site: Site = {id: generateRandomString(4), name: "", nameTop: "-12px", nameLeft: "4px", logoUrl: "/loop.svg", logoWidth: "36px", owner: appService.currentUser?.email ? appService.currentUser?.email : "", categories: defaultCategories, products: [], bqtables: bqtables, googleCloudProjectId: PUBLIC_PROJECT_ID, heroImageUrl: "/products_banner.png", heroGradientStyle: "", heroBackgroundPosition: ""};

  onMount(() => {
    document.addEventListener("siteUpdated", () => {
      site.categories = defaultCategories;
    });
  });

  function back() {
    history.back();
  }

  function submit() {
    site.id = encodeURI(site.name.split(" ")[0].toLowerCase().replace("%", "") + "_" + site.id);
    if (appService.currentUser)
    site.owner = appService.currentUser?.email;

    fetch("/api/data?col=apigee-marketplace-sites", {
      method: 'POST',
      body: JSON.stringify(site),
      headers: {
        'content-type': 'application/json',
      },
    }).then((response) => {
        return response.json();
    }).then((data: Site) => {
      goto("/home?site=" + data.id).then(() => {
        location.reload();
      });
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
          <span>Create Hub</span>
      </div>

      <div class="right_content">

        <SiteEdit {site} />

        <div class="form_controls">
          <button on:click={back} type="button" class="rounded_button_outlined">Cancel</button>
          <button type="button" on:click={submit} class="rounded_button_filled">Save</button>
        </div>
      </div>

    </div>
  </div>
</div>


