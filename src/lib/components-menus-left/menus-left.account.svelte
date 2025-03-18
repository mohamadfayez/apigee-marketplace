<script lang="ts">
    import { appService } from "$lib/app-service";

  export let selectedName: string = "";

  function getClassName(baseClassName: string, name: string) {
    if (name === selectedName)
      baseClassName += " " + baseClassName + "_selected";

    return baseClassName;
  }
</script>

<div class="left_menu_page_left">
  <div class="left_menu_page_left_header">
    <svg
      class="left_menu_page_left_icon"
      width="36px"
      viewBox="0 0 18 18"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      ><path
        d="M17 9.008l-3.363-3.363-1.883 1.883 1.48 1.48-1.48 1.48 1.883 1.882L17 9.008zM8.992 1l3.363 3.363-1.883 1.883-1.48-1.48-1.48 1.48L5.63 4.363 8.992 1zm.016 16l-3.363-3.363 1.883-1.883 1.48 1.48 1.48-1.48 1.882 1.883L9.008 17zM1 8.992l3.363 3.363 1.883-1.883-1.48-1.48 1.48-1.48L4.363 5.63 1 8.992zM9.008 7.32l1.688 1.688-1.688 1.688-1.69-1.688 1.69-1.69z"
        fill-rule="evenodd"
      ></path></svg
    >
    <span class="left_menu_page_left_title">My account</span>
  </div>
  <div class="left_menu_page_left_list">
    <a href={`/user?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "profile")}>
      <svg
        class={getClassName("side_menu_button_logo", "profile")}
        width="20px"
        fill-rule="evenodd"
        height="100%"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M12 2.084V5.44a2.56 2.56 0 0 1 0 5.12V12c1.335 0 4 .824 4 2.46v1.265c-.065.094-.126.19-.195.283A7.433 7.433 0 0 1 12 18.738v2.827a11.062 11.062 0 0 0 8-10.667v-5.48l-8-3.334z"
          opacity=".8"
        ></path><path
          d="M12 2.084V5.44a2.56 2.56 0 0 0 0 5.12V12c-1.335 0-4 .824-4 2.46v1.265c.065.094.126.19.195.283A7.433 7.433 0 0 0 12 18.738v2.827a11.062 11.062 0 0 1-8-10.667v-5.48l8-3.334z"
        ></path></svg
      >
      <span class={getClassName("side_menu_button_name", "profile")}
        >Profile</span
      >
    </a>
    <a href={`/user/apps/api?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "apiapps")}>
      <svg
        class={getClassName("side_menu_button_logo", "apiapps")}
        width="20px"
        viewBox="0 0 18 18"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M9.874 10H12v2h3v-2h1V8H9.874A4.002 4.002 0 0 0 2 9a4 4 0 0 0 7.874 1zM6 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
          fill-rule="evenodd"
        ></path></svg
      >
      <span class={getClassName("side_menu_button_name", "apiapps")}
        >API subscriptions</span
      >
    </a>
    <a href={`/user/apps/bigquery?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "bigqueryapps")}>
      <svg
        class={getClassName("side_menu_button_logo", "bigqueryapps")}
        width="20px"
        viewBox="0 0 18 18"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M7.9 8.76L6 7.58a1.09 1.09 0 000-.26 1 1 0 10-.33.75l2 1.17a.28.28 0 00.15 0A.31.31 0 008 9.15a.29.29 0 00-.1-.39zM5 7.78a.46.46 0 010-.92.46.46 0 010 .92z"
        ></path><path
          d="M6.9 14.12A5.12 5.12 0 1112 9a5.13 5.13 0 01-5.1 5.12zM6.9 5a4 4 0 104 4 4 4 0 00-4-4z"
        ></path><path
          d="M14.83 11.66a1.4 1.4 0 00-.83.27L9.68 9.45a1.72 1.72 0 000-.9L14 6.07A1.39 1.39 0 1013.43 5a.68.68 0 000 .14L9.08 7.59a1.85 1.85 0 100 2.82l4.37 2.5a.68.68 0 000 .14 1.4 1.4 0 101.4-1.39z"
        ></path></svg
      >
      <span class={getClassName("side_menu_button_name", "bigqueryapps")}>Analytics Hub subscriptions</span>
    </a>
    <a href={`/user/apps/storage?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "bucketapps")}>
      <svg
        class={getClassName("side_menu_button_logo", "bucketapps")}
        width="20px"
        viewBox="0 0 18 18"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M7.027 11h6.978c.55 0 .995.443.995 1v1c0 .553-.456 1-.995 1H7.027v1.758L2 12.378 7.027 9v2zM11 4H3.995C3.455 4 3 4.447 3 5v1c0 .557.446 1 .995 1H11v1.79l5.027-3.396L11 2v2z"
          fill-rule="evenodd"
        ></path></svg
      >
      <span class={getClassName("side_menu_button_name", "bucketapps")}>Data sync subscriptions</span>
    </a>    
    <a href={`/user/usage?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "usage")}>
      <!-- <svg class="side_menu_button_logo side_menu_button_logo_selected" width="20px" viewBox="0 0 18 18" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M7.9 8.76L6 7.58a1.09 1.09 0 000-.26 1 1 0 10-.33.75l2 1.17a.28.28 0 00.15 0A.31.31 0 008 9.15a.29.29 0 00-.1-.39zM5 7.78a.46.46 0 010-.92.46.46 0 010 .92z"></path><path d="M6.9 14.12A5.12 5.12 0 1112 9a5.13 5.13 0 01-5.1 5.12zM6.9 5a4 4 0 104 4 4 4 0 00-4-4z"></path><path d="M14.83 11.66a1.4 1.4 0 00-.83.27L9.68 9.45a1.72 1.72 0 000-.9L14 6.07A1.39 1.39 0 1013.43 5a.68.68 0 000 .14L9.08 7.59a1.85 1.85 0 100 2.82l4.37 2.5a.68.68 0 000 .14 1.4 1.4 0 101.4-1.39z"></path></svg>             -->
      <svg
        style="position: relative; top: -2px"
        class={getClassName("side_menu_button_logo", "usage")}
        width="20px"
        viewBox="0 0 18 18"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M10.83 16.33h2.33v1.85h-2.33zM5.5 12.76L7.88 9.6a.55.55 0 01.37-.22.63.63 0 01.42.12l2.12 1.72 2.8-2.94a.54.54 0 01.4-.17.54.54 0 01.4.17l4.33 4.48H22V6a.74.74 0 00-.74-.74H2.74A.74.74 0 002 6v6.81z"
          opacity=".6"
        ></path><path
          d="M18.48 13.87a.56.56 0 01-.4-.17L14 9.47l-2.74 2.89a.57.57 0 01-.76.05l-2.08-1.68-2.2 2.92a.56.56 0 01-.45.22H2v1.71a.75.75 0 00.74.75h18.52a.75.75 0 00.74-.75v-1.71zM9 18.18h6a.29.29 0 01.3.3.29.29 0 01-.3.3H9a.29.29 0 01-.3-.3.29.29 0 01.3-.3z"
          opacity=".8"
        ></path></svg
      >
      <span class={getClassName("side_menu_button_name", "usage")}>Usage</span>
    </a>
    <!-- <a
      href="/user/credits"
      style="pointer-events: none; cursor: not-allowed;"
      class={getClassName("side_menu_button", "credits")}
    >
      <svg
        class={getClassName("side_menu_button_logo", "credits")}
        width="20px"
        viewBox="0 0 20 20"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path
          d="M16.61 12.73a1.49 1.49 0 001.31-.73l2.85-5.1a1.49 1.49 0 00-1.31-2.23H7l-.87-1.9H3v1.5h2.21L8.76 12l-1.15 2.35A1.5 1.5 0 009 16.5h10.79V15H9l1.1-2.27zm2.85-6.6l-2.85 5.1h-6.54l-2.34-5.1z"
          fill="currentColor"
        ></path><g opacity=".8" fill="currentColor"
          ><circle cx="8.61" cy="19.4" r="1.87"></circle><circle
            cx="17.92"
            cy="19.4"
            r="1.87"
          ></circle></g
        ></svg
      >
      <span class={getClassName("side_menu_button_name", "credits")}
        >Credits</span
      >
    </a> -->
    <a href={`/user/billing?site=${appService.currentSiteData.id}`} class={getClassName("side_menu_button", "billing")}>
      <svg
        style="position: relative; top: -2px"
        class={getClassName("side_menu_button_logo", "billing")}
        width="20px"
        viewBox="0 0 18 18"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        ><path d="M3 7h9v2H3z" opacity=".4"></path><path
          d="M12 7h9v2h-9z"
          opacity=".3"
        ></path><path d="M5 11h14v2H5z" opacity=".6"></path><path
          d="M4 5a1 1 0 0 0-1 1v1h9V5H4z"
        ></path><path d="M20 5h-8v2h9V6a1 1 0 0 0-1-1z" opacity=".9"
        ></path><path
          d="M12 11V9H3v9a1 1 0 0 0 1 1l8-.004V13H5v-2h7zm-4 4v2H5v-2h3z"
        ></path><path d="M5 15h3v2H5z" opacity=".4"></path><path
          d="M12 9v2h7v2h-7v5.996l8-.004a1 1 0 0 0 1-1V9h-9zm3 7h-1v-1h1v1zm3 0h-1v-1h1v1z"
          opacity=".9"
        ></path><path d="M14 15h1v1h-1zm3 0h1v1h-1z" opacity=".6"></path></svg
      >
      <span class={getClassName("side_menu_button_name", "billing")}
        >Billing</span
      >
    </a>
  </div>
</div>
