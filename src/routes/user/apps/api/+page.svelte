<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import { DialogType, ApiApp, ApiApps, User } from "$lib/interfaces";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  let appData: ApiApps | undefined = appService.apiApps;
  updateApps();

  onMount(() => {
    document.addEventListener("appsUpdated", () => {
      appData = appService.apiApps;
      updateApps();
    });
  });

  function updateApps() {
    if (appData && appData.apps) {
      for (let app of appData?.apps) {
        var d = new Date(parseInt(app.createdAt));
        app.createdAtDate = d.toLocaleString();
      }

      appData.apps.sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt));
    }
  }

  function open(appId: string) {
    appService.GoTo("/user/apps/api/" + appId);
  }

  function deleteApp(app: ApiApp) {
    appService
      .ShowDialog("Do you really want to delete this app?", "Delete", DialogType.OkCancel, [])
      .then((result) => {
        if (result.result === DialogType.Ok) {
          if (appData) {
            if (appService.currentUser) {
              fetch(
                "/api/apps/api/" +
                  app.name +
                  "?email=" +
                  appService.currentUser.email,
                {
                  method: "DELETE",
                  headers: {
                    "content-type": "application/json",
                  },
                }
              )
                .then((response) => {
                  return response.json();
                })
                .then((data: ApiApp) => {
                  let index = appService.apiApps?.apps.findIndex(x => x.appId === data.appId);
                  if (index !== undefined && index >= 0) {
                    let newAppData = appService.apiApps;
                    newAppData?.apps.splice(index, 1);
                    appService.apiApps = newAppData;
                    appData = newAppData;
                  }
                  const event = new Event("appsUpdated");
                  document.dispatchEvent(event);
                });
            }

            appService.ShowSnackbar("App has been deleted.");
          }
        }
      });
  }
</script>

<div class="left_menu_page">
  <MenuLeftAccount selectedName="apiapps" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>API subscriptions</span><a
          style="margin-left: 8px;"
          href={`/user/apps/api/new?site=${appService.currentSiteData.id}`}
          class="text_button left_menu_page_right_header_button"
          >+ Add subscription</a
        >
      </div>

      <div class="left_menu_page_right_content">
        <table class="flat_table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Creation date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if appData && appData.apps}
              {#each appData.apps as app, i}
                <tr on:click={() => open(app.name)}>
                  <td>{app.name}</td>
                  {#if app.createdAtDate}
                    <td>{app.createdAtDate}</td>
                  {:else}
                    <td></td>
                  {/if}
                  <td>
                    <span style="color: green; font-weight: bold;">Active</span>
                  </td>
                  <td>
                    <button>
                      <svg
                        width="18px"
                        viewBox="0 0 18 18"
                        preserveAspectRatio="xMidYMid meet"
                        focusable="false"
                        ><path
                          d="M2 13.12l8.49-8.488 2.878 2.878L4.878 16H2v-2.88zm13.776-8.017L14.37 6.507 11.494 3.63l1.404-1.406c.3-.3.783-.3 1.083 0l1.8 1.796c.3.3.3.784 0 1.083z"
                          fill-rule="evenodd"
                        ></path></svg
                      >
                    </button>
                    <button on:click|stopPropagation={() => deleteApp(app)}>
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
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
    {#if !appData}
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    {/if}
  </div>
</div>

<style>
</style>
