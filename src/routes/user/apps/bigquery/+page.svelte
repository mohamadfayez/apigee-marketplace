<script lang="ts">
  import { appService } from "$lib/app-service";
  import { DialogType, DialogResult, type AnalyticsHubSubscription, type User } from "$lib/interfaces";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";
  import { onMount } from "svelte";

  let currentUser: User | undefined = appService.currentUser;
  let hubSubscriptions: AnalyticsHubSubscription[] | undefined = undefined;

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      currentUser = appService?.currentUser;
      getAHSubscriptions();
    });

    if (currentUser) getAHSubscriptions();
  });

  function getAHSubscriptions() {
    fetch("/api/apps/bigquery?email=" + currentUser?.email, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data: AnalyticsHubSubscription[]) => {
        hubSubscriptions = data;
      });
  }

  function deleteSubscription(sub: AnalyticsHubSubscription) {
    appService
      .ShowDialog(
        "Are you sure you want to delete this subscription dataset?",
        "Delete",
        DialogType.OkCancel, []
      )
      .then((result) => {
        if (result.result === DialogType.Ok) {
          fetch(
            "/api/apps/bigquery?email=" +
              appService.currentUser?.email +
              "&project=" +
              sub.project +
              "&dataset=" +
              sub.dataset,
            {
              method: "DELETE",
              headers: {
                "content-type": "application/json",
              },
            }
          )
            .then((response) => {
              let newHubSubscriptions = hubSubscriptions;
              let index = newHubSubscriptions?.indexOf(sub);
              if (index) newHubSubscriptions?.splice(index, 1);

              hubSubscriptions = newHubSubscriptions;
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  }
</script>

<div class="left_menu_page">

  <MenuLeftAccount selectedName="bigqueryapps" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Analytics Hub subscriptions</span><a
          href={`/user/apps/bigquery/new?site=${appService.currentSiteData.id}`}
          class="text_button right_panel_header_button">+ Create subscription</a
        >
      </div>

      <div class="left_menu_page_right_content">
        {#if hubSubscriptions}
          <table class="flat_table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Creation date</th>
                <th>Project</th>
                <th>Dataset</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if hubSubscriptions}
                {#each hubSubscriptions as sub}
                  <tr>
                    <td>{sub.product}</td>
                    <td>{sub.createdAt}</td>
                    <td>{sub.project}</td>
                    <td>
                      <a
                        target="_blank"
                        href={"https://console.cloud.google.com/bigquery?project=cloud32x&ws=!1m4!1m3!3m2!1s" +
                          sub.project +
                          "!2s" +
                          sub.dataset}
                      >
                        {sub.dataset}
                      </a>
                    </td>
                    <td>
                      {#if sub.status === "Inactive"}
                        <span
                          style="color: red; font-weight: bold;"
                          title="Your subscription could be automatically created, please register manually at the Analytics Hub product page."
                          >{sub.status}</span
                        >
                      {:else}
                        <span style="color: green; font-weight: bold;"
                          >{sub.status}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <button
                        on:click|stopPropagation={() => deleteSubscription(sub)}
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
                    </td>
                  </tr>
                {/each}
              {/if}
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
