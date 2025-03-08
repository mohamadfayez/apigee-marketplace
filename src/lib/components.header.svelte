<script lang="ts">
  import { onMount } from 'svelte';
  import { Site, User } from './interfaces';
  import { appService } from './app-service';
	import { goto } from '$app/navigation';
    import { fade, slide } from 'svelte/transition';

  let currentUser: User | undefined = appService.currentUser;
  let currentSite: Site = appService.currentSiteData;
  let allSites: Site[] = appService.sites;
  let menuVisible: boolean = false;
  let siteMenuVisible: boolean = false;

  onMount(async () => {
    document.addEventListener("userUpdated", () => {
      currentUser = appService.currentUser;
    });

    document.addEventListener("siteUpdated", () => {
      if (appService.currentSiteData)
        currentSite = appService.currentSiteData;
      allSites = appService.sites;
    });

    document.addEventListener("cancelEvent", () => {
      menuVisible = false;
      siteMenuVisible = false;
    });
  });

  function goToPublish() {
    appService.GoTo(`/manage/products/new`);
    document.dispatchEvent(new Event('cancelEvent'));
  }

  function signOut() {
    appService.SignOut();
    document.dispatchEvent(new Event('cancelEvent'));
    goto("/");
  }

  function goToMyApps() {
    appService.GoTo("/user/apps");

    setTimeout(() => {
      //First, we initialize our event
      const event = new Event('cancelEvent');
      // Next, we dispatch the event.
      document.dispatchEvent(event);
    }, 50);
  }

  function goToAccount() {
    appService.GoTo("/user");

    //First, we initialize our event
    const event = new Event('cancelEvent');
    // Next, we dispatch the event.
    document.dispatchEvent(event);
  }

  function goToAdmin() {
    appService.GoTo("/manage");

    //First, we initialize our event
    const event = new Event('cancelEvent');
    // Next, we dispatch the event.
    document.dispatchEvent(event);
  }  

</script>

<div class="header">
  <span class="header_left_panel1">
    <a href={`/home?site=${currentSite.id}`}>
      <!-- <svg class="leader_left_panel1_logo" fill="none" fill-rule="evenodd" height="36px" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M5.803 16l1.98-1.98-2.69-2.692a4.41 4.41 0 0 1 6.235-6.235l2.692 2.69L16 5.803l-2.692-2.69A7.164 7.164 0 0 0 8.21 1 7.218 7.218 0 0 0 1 8.21a7.17 7.17 0 0 0 2.112 5.1L5.802 16zm20.394 0l-1.98 1.98 2.69 2.692a4.41 4.41 0 0 1-6.235 6.236l-2.69-2.693L16 26.195l2.692 2.693A7.162 7.162 0 0 0 23.79 31c1.926 0 3.736-.75 5.098-2.112A7.162 7.162 0 0 0 31 23.79a7.16 7.16 0 0 0-2.112-5.098L26.198 16z" fill="#757575"></path><path d="M11.328 26.908a4.41 4.41 0 0 1-6.236-6.236l2.692-2.69 6.235 6.234-2.7 2.692zm9.345-21.815a4.41 4.41 0 0 1 6.234 6.235l-2.69 2.692-6.236-6.236 2.7-2.69zM16 20.778a4.778 4.778 0 0 1-.002-9.555h.004A4.778 4.778 0 0 1 16 20.777zM26.197 16l2.69-2.692A7.162 7.162 0 0 0 31 8.21C31 4.235 27.765 1 23.79 1a7.17 7.17 0 0 0-5.1 2.112L16 5.804 5.803 16l-2.69 2.692A7.16 7.16 0 0 0 1 23.79c0 1.926.75 3.736 2.112 5.098A7.16 7.16 0 0 0 8.21 31a7.17 7.17 0 0 0 5.1-2.112L16 26.196 26.197 16z" fill="#434343"></path><path d="M1 1h30v30H1z"></path></svg> -->
      <img class="leader_left_panel1_logo" src={currentSite.logoUrl} alt="" style={`width: ${currentSite.logoWidth};`} />
      <span class="header_left_panel1_name" style={`top: ${currentSite.nameTop}; left: ${currentSite.nameLeft}`}>{currentSite.name}</span>
    </a>

  </span>

  <span class="header_right_panel1">
    
    {#if currentUser}

      {#if currentUser.roles && (currentUser.roles.includes("publisher") || currentUser.roles.includes("admin"))}
        <button style="position: relative; top: -14px; left: -28px;" on:click={goToPublish} class="rounded_button_outlined">+ New product</button>
      {:else}
        <button style="position: relative; top: -14px; left: -28px;" on:click={goToAccount} class="rounded_button_outlined">My account</button>
      {/if}

      <button style="position: relative; top: -4px; left: -20px; width: 44px; padding: 8px;" class="back_button" title="Hubs"
        on:click|stopPropagation={() => { siteMenuVisible = !siteMenuVisible; menuVisible = false; }}
        on:keydown|stopPropagation={() => { siteMenuVisible = !siteMenuVisible; menuVisible = false; }}>
        
        <!-- windows -->
        <svg width="100%" height="100%" fill="darkslategray" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 487.295 487.295" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M356.688,130.469H55.517c-15.439,0-27.994,12.554-27.994,27.987v300.852c0,15.434,12.555,27.987,27.994,27.987h301.171 c15.434,0,27.993-12.554,27.993-27.987V158.45C384.681,143.017,372.121,130.469,356.688,130.469z M337.72,162.324 c6.62,0,11.987,5.37,11.987,11.99c0,6.629-5.373,11.996-11.987,11.996c-6.632,0-11.998-5.367-11.998-11.996 C325.722,167.694,331.088,162.324,337.72,162.324z M294.737,162.324c6.632,0,11.992,5.37,11.992,11.99 c0,6.629-5.366,11.996-11.992,11.996c-6.62,0-11.987-5.367-11.987-11.996C282.75,167.694,288.117,162.324,294.737,162.324z M352.698,455.301H59.512V216.092h293.174v239.209H352.698z M431.784,0H130.607c-15.436,0-27.988,12.552-27.988,27.987v82.302 h31.98V85.626h293.183v239.211h-10.391v31.989h14.387c15.433,0,27.993-12.561,27.993-27.987V27.981 C459.777,12.546,447.217,0,431.784,0z M369.839,55.842c-6.632,0-11.992-5.37-11.992-11.99c0-6.623,5.366-11.993,11.992-11.993 c6.62,0,11.987,5.37,11.987,11.993C381.826,50.472,376.459,55.842,369.839,55.842z M412.816,55.842 c-6.638,0-11.999-5.37-11.999-11.99c0-6.623,5.373-11.993,11.999-11.993c6.62,0,11.981,5.37,11.981,11.993 C424.81,50.472,419.437,55.842,412.816,55.842z"></path> </g> </g></svg>

        <!-- <svg width="100%" height="100%" viewBox="0 0 16 16" fill="darkslategray" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 1H5L8 3H13V5H3.7457L2.03141 11H4.11144L5.2543 7H16L14 14H0V1Z" fill="darkgray"></path> </g></svg> -->
        
        <!-- <svg width="100%" height="100%" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false"><path fill="#333" d="M18 17v-6c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v6H4v2h16v-2h-2zm-2 0H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zm-4 5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"></path></svg> -->
      </button>

      <button
        on:click|stopPropagation={() => { menuVisible = !menuVisible; siteMenuVisible = false;}}
        on:keydown|stopPropagation={() => { menuVisible = !menuVisible; siteMenuVisible = false;}}
        class="profile_button"
      >
        <img class="profile_button_image" src={currentUser.photoUrl} onerror="this.src='/avatar.png';" alt="The user's profile." />
      </button>

      {#if menuVisible}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="menuPanel" transition:slide on:click|stopPropagation={() => {}}>
          <div class="arrow" />
          <div class="menu">
            <div class="menu_profile">
              <img class="panel_profile_image" src={currentUser.photoUrl} onerror="this.src='/avatar.png';" alt="Profile"/>
              <div class="profile_info">
                <div class="profile_info_primary">{currentUser.userName}</div>
                <div class="profile_info_secondary" title={currentUser.email}>{currentUser.email}</div>
                <div class="profile_info_secondary profile_info_divide">{currentUser.providerId}</div>
              </div>
            </div>
            <div class="panel">
              
              {#if currentUser?.roles.includes("admin")}
                <button class="result" on:click={goToAdmin} style="width: 97%;">Admin</button>
              {/if}
              <button class="result" on:click={signOut}>Sign out</button>
              <button class="result" on:click={goToAccount}>My account</button>
              
            </div>
          </div>
        </div>
      {/if}

      {#if siteMenuVisible}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="menuPanel" transition:slide on:click|stopPropagation={() => {}} style="right: 76px; width: 240px;">
          <div class="arrow" style="left: 196px;" />
          <div class="site_menu" style="width: 100%;">
            <span style="width: 100%; text-align: center; position: relative; top: 15px; font-size: 17px; color: darkslategray;">
              {#if currentUser.roles.includes("admin")}
                <div style="display: flex; padding-left: 4px; padding-right: 4px;">
                  <a class="text_button" style="width: 50%; text-align: left; padding: 0px; padding-left: 12px;" href={`/manage/sites?site=${currentSite.id}`}>Hubs</a>
                  <a class="text_button" style="width: 50%; text-align: right; padding: 0px;" href={`/manage/sites/new?site=${currentSite.id}`}>+ New</a>
                </div>
              {:else}
                <b style="position: relative; left: 12px;">Hubs</b>
              {/if}
            </span>
            <div class="site_panel">
              {#each allSites as site}
                <div class="site_line" style="display: flex;">
                    <img src={site.logoUrl} alt="" width="10%" style="position: relative; top: -2px; margin: 0px 4px;"/>
                    <a class="site_button" style="width: 90%; text-align: left;" href={"/home?site=" + site.id}>{site.name}</a>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

    {:else}
      <span>
        <a href="/sign-in" class="rounded_button_filled">Sign In</a>
        <a href="/register" class="rounded_button_outlined">Register</a>
      </span>
    {/if}
  </span>
</div>

<style>
  .header {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: flex-start;

    height: var(--header-height);
    background-color: rgba(255, 255, 255, .6);
    backdrop-filter: blur(10px);
    /* width: 100vw; */
    border-bottom: solid 1px rgba(222, 222, 222, 1);

    font-weight: 560;
    color: #333;
    font-size: 20px;

    padding: 0px;
    margin: 0px;

    position: sticky;
    top: 0;
    z-index: 2;
  }

  .header_left_panel1 {
    /* margin-top: 12px; */
    margin-top: calc(var(--header-height)*.26);
    margin-left: 24px;
    cursor: pointer;
    display: flex;
  }

  .header_left_panel1_name {
    font-family: "Open Sans", sans-serif;;
    color: #2c2c2c;
    font-weight: 550;
    font-size: larger;
    position: relative;
    top: -12px;
    left: 4px;
  }

  .leader_left_panel1_logo {
    width: 36px;
  }

  .header_right_panel1 {
    margin-top: calc(var(--header-height)*.20);
    margin-right: 24px;
  }

  .profile_button {
    position: relative;
    top: 2px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
  }

  .profile_button_image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .menuPanel {
    position: absolute;
    top: 57px;
    margin-top: 8px;
    right: 10px;
    background: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 10px 0px;
    border: 1px solid rgb(242, 242, 242);
    z-index: 6;
  }

  .menu {
    /* height: 222px; */
    width: 300px;
    overflow-y: auto;
    background-color: rgb(255, 255, 255);
    z-index: 2;
    position: relative;
    top: -15px;
  }

  .menu_profile {
    display: flex;
  }

  .profile_info {
    margin-top: 32px;
    margin-left: 18px;
  }

  .profile_info_primary {
    font-size: 16px;
  }

  .profile_info_secondary {
    font-size: 14px;
    font-weight: normal;
    margin-top: 2px;
    margin-left: 2px;
    width: 145px;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .profile_info_divide {
    margin-top: 16px;
  }

  .panel_profile_image {
    margin-left: 20px;
    margin-top: 20px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .panel {
    /* position: relative; */
    background: rgb(255, 255, 255);
    /* height: 100%; */
    padding-left: 10px;
    padding-right: 10px;
    margin-top: 18px;
    z-index: 2;
    padding-top: 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    align-items: flex-end;
    height: 73px;
    /* padding-bottom: 20px; */
    /* font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif; */
  }

  .arrow {
    position: relative;
    top: -29px;
    left: 259px;
    border: 1px solid rgb(242, 242, 242);
    box-shadow: rgba(0, 0, 0, 0.15) -1px -1px 1px -1px;
    transform: rotate(45deg) translate(16px, 16px);
    background: rgb(255, 255, 255);
    height: 14px;
    width: 14px;
    display: block;
    content: "";
    pointer-events: none;
    z-index: 1;
    /* border: 1px solid red; */
  }
  
  .result {
    display: block;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 10px;
    color: black;
    /* border-bottom: 1px dashed rgb(242, 242, 242); */
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
    font-weight: 200;
    background-color: transparent;
    border-width: 0px;
    width:47%;
    text-align: center;
    margin: 4px;
    border-color: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.66);
    font-weight: 400;
    background-color: #fdfdfd;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 2px;
    font-size: 14px;
    /* border-bottom: 1px solid #dddddd; */
    /* width: 300px; */
    border-radius: 5px;
  }

  .result:hover {
    background-color: #f1f1f1;
  }

  .site_menu {
    height: 300px;
    width: 340px;
    overflow-y: auto;
    background-color: rgb(255, 255, 255);
    z-index: 2;
    position: relative;
    top: -15px;
    display: flex;
    flex-flow: column;
  }

  .site_panel {
    background: rgb(255, 255, 255);
    padding-left: 10px;
    padding-right: 10px;
    margin-top: 18px;
    z-index: 2;
    padding-top: 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    align-items: flex-end;
    overflow-y: auto;
  }

  .site_button {
    font-size: 15px;
    width: 97%;
    text-align: center;
    font-weight: 400;
    /* border-bottom: solid 1px lightgray; */
    margin-bottom: 4px;
    padding: 6px;
  }

  .site_line:hover {
    background-color: #f1f1f1;
  }

  /* Scroll bars */

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1; 
  }
  
  ::-webkit-scrollbar-thumb {
    background: #cccccc; 
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #cfcfcf; 
  }
</style>