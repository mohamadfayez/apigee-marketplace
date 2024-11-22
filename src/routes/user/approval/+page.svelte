<script lang="ts">
    import { goto } from "$app/navigation";
    import { appService } from "$lib/app-service";
  import type { Developer, User } from "$lib/interfaces";
    import { onMount } from "svelte";

	onMount(() => {
    setInterval(() => {
      if (appService.currentUser) {
        fetch("/api/users/" + appService.currentUser.email).then((response) => {
            return response.json();
        }).then((data: User) => {
          if (data && appService.currentUser && data.email == appService.currentUser.email && data.status === "approved") {
            appService.reloadFlag = true;
            goto(`/home?site=${appService.currentSiteData.id}`);
          }
        });
      }
    }, 5000);
  });
</script>

<div class="approval">
  <div class="approval_message">
    Thank you for registering, you will be notified by email when your registration is approved. 
  </div>
</div>

<style>
  .approval {
    position: fixed;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    height: 100%;
    width: 100%;
    z-index: 2;
    background: white;
  }

  .approval_message {
    text-align: center;
    padding-top: 240px;
    font-size: 24px;
    padding-left: 20%;
    padding-right: 20%;
  }
</style>