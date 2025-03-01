<script lang="ts">
  import { appService } from "$lib/app-service";
  import { type Site, type SLA, DialogType } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  let sites: Site[] = appService.sites;
  let userEmail: string = "";

  if (appService.currentUser) userEmail = appService.currentUser.email;

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      if (appService.currentUser) userEmail = appService.currentUser.email;
    });
    
    document.addEventListener("siteUpdated", () => {
      if (sites.length === 0)
        sites = appService.sites;
    });
  });

  function openSite(id: string) {
    appService.GoTo("/manage/sites/" + id);
  }

  function openPage(id: string) {
    if (browser && window) {
      let newTab = window.open("/home?site=" + id, "_blank");
      if (newTab) newTab.focus();
    }
  }

  function deleteSite(id: string) {
    appService
      .ShowDialog(
        `Are you sure that you want to delete the site ${id}?`,
        "Delete", DialogType.OkCancel, []
      )
      .then((result) => {
        if (result.result == DialogType.Ok) {
          let index = sites?.findIndex(x => x.id == id);
          if (index != undefined && index >= 0) {
            sites?.splice(index, 1);
            sites = sites;
            appService.sites = sites;
            document.dispatchEvent(new Event('siteUpdated'));

            // first delete products
            fetch("/api/data?col=apigee-marketplace-sites/" + id + "/products", {
              method: "DELETE"
            });
            // now delete site
            fetch("/api/data/" + id + "?col=apigee-marketplace-sites", {
              method: "DELETE"
            });
          }
        }
      });
  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="sites" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Hubs</span><a
          href={`/manage/sites/new?site=${appService.currentSiteData.id}`}
          class="text_button left_menu_page_right_header_button"
          style="margin-left: 18px;">+ Add hub</a
        >
      </div>

      <div class="left_menu_page_right_content">
        {#if sites && sites.length > 0}
          <table class="flat_table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each sites as site, i}
                <tr on:click={() => openSite(site.id)}>
                  <td>{site.id}</td>
                  <td>{site.name}</td>
                  <td>{site.owner}</td>
                  <td style="white-space: pre;">
                    {#if site.owner === userEmail}
                      <button title="Delete the site"
                        on:click|stopPropagation={() => deleteSite(site.id)}
                      >
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
                    <button
                      on:click|stopPropagation={() => openPage(site.id)}
                      title="Open site in new window"
                    >
                      <svg
                        width="18px"
                        viewBox="0 0 512 512"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        fill="#000000"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                          <title>open-external</title>
                          <g
                            id="Page-1"
                            stroke="none"
                            stroke-width="1"
                            fill="none"
                            fill-rule="evenodd"
                          >
                            <g
                              id="icon"
                              fill="#000000"
                              transform="translate(85.333333, 64.000000)"
                            >
                              <path
                                d="M128,63.999444 L128,106.666444 L42.6666667,106.666667 L42.6666667,320 L256,320 L256,234.666444 L298.666,234.666444 L298.666667,362.666667 L4.26325641e-14,362.666667 L4.26325641e-14,64 L128,63.999444 Z M362.666667,1.42108547e-14 L362.666667,170.666667 L320,170.666667 L320,72.835 L143.084945,249.751611 L112.915055,219.581722 L289.83,42.666 L192,42.6666667 L192,1.42108547e-14 L362.666667,1.42108547e-14 Z"
                                id="Combined-Shape"
                              >
                              </path>
                            </g>
                          </g>
                        </g></svg
                      >
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
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
