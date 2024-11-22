<script lang="ts">
  import { appService } from "$lib/app-service";
  import { type User, type BucketSubscription, DialogType } from "$lib/interfaces";
  import type { Bucket } from "@google-cloud/storage";
  import { onMount } from "svelte";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";

  let currentUser: User | undefined = appService.currentUser;
  let bucketSubscriptions: BucketSubscription[] | undefined = undefined;
  let product: string = "";

  onMount(() => {
    document.addEventListener("userUpdated", () => {
      currentUser = appService?.currentUser;
      getSignedUrls();
    });

    if (currentUser) getSignedUrls();
  });

  function getSignedUrls() {
    fetch("/api/apps/storage?email=" + currentUser?.email, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data: BucketSubscription[]) => {
        bucketSubscriptions = data;
      });
  }

  function deleteSync(sub: BucketSubscription) {
    appService
      .ShowDialog(
        "Are you sure you want to delete this subscription data sync?",
        "Delete",
        DialogType.OkCancel, []
      )
      .then((result) => {
        if (result.result === DialogType.Ok) {
          fetch(
            "/api/apps/storage?email=" +
              appService.currentUser?.email +
              "&product=" +
              sub.product +
              "&createdAt=" +
              sub.createdAt,
            {
              method: "DELETE",
              headers: {
                "content-type": "application/json",
              },
            }
          )
            .then((response) => {
              let newBucketSubscriptions = bucketSubscriptions;

              if (newBucketSubscriptions && newBucketSubscriptions.length > 1) {
                let index = newBucketSubscriptions?.indexOf(sub);
                if (index) newBucketSubscriptions?.splice(index, 1);
              } else newBucketSubscriptions = [];

              bucketSubscriptions = newBucketSubscriptions;
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  }
</script>

<div class="left_menu_page">
  <MenuLeftAccount selectedName="bucketapps" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Data syncs</span><a
          href={`/user/apps/storage/new?site=${appService.currentSiteData.id}`}
          class="text_button left_menu_page_right_header_button"
          >+ Create sync</a
        >
      </div>

      <div class="left_menu_page_right_content">
        {#if bucketSubscriptions}
          <table class="flat_table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Creation date</th>
                <th>Format</th>
                <th style="max-width: 200px">Download URL</th>
                <th>Refresh schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if bucketSubscriptions}
                {#each bucketSubscriptions as sub}
                  <tr>
                    <td>{sub.product}</td>
                    <td>{sub.createdAt}</td>
                    <td>{sub.type}</td>
                    <td
                      ><a href={sub.url} target="_blank"
                        >{sub.url.slice(0, 100) + "..."}</a
                      ></td
                    >
                    <td>Daily 08:00:00 UTC</td>
                    <td>
                      {#if sub.status === "Invalid"}
                        <span style="color: red; font-weight: bold;"
                          >{sub.status}</span
                        >
                      {:else}
                        <span style="color: green; font-weight: bold;"
                          >{sub.status}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <button on:click|stopPropagation={() => deleteSync(sub)}>
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
