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
    <span class="left_menu_page_left_title">Admin</span>
  </div>
  <div class="left_menu_page_left_list">
    <a
      href={`/manage/users?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "users")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={getClassName("side_menu_button_logo", "users")}
        width="20px"
        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g><g id="SVGRepo_iconCarrier">
          <path
            d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <path
            d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g></svg
      >
      <span class={getClassName("side_menu_button_name", "users")}>Users</span>
    </a>
    <a
      href={`/manage/roles?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "roles")}
    >
      <svg
        class={getClassName("side_menu_button_logo", "roles")}
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
      <span class={getClassName("side_menu_button_name", "roles")}>Roles</span>
    </a>
    <a
      href={`/manage/products?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "products")}
    >
      <svg
        class={getClassName("side_menu_button_logo", "products")}
        width="20px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g><g id="SVGRepo_iconCarrier">
          <path
            d="M16.5276 2H7.47201C6.26919 2 5.66778 2 5.18448 2.2987C4.70117 2.5974 4.43221 3.13531 3.8943 4.21114L2.49068 7.75929C2.16639 8.57905 1.88266 9.54525 2.42854 10.2375C2.79476 10.7019 3.36244 11 3.99978 11C5.10435 11 5.99978 10.1046 5.99978 9C5.99978 10.1046 6.89522 11 7.99978 11C9.10435 11 9.99978 10.1046 9.99978 9C9.99978 10.1046 10.8952 11 11.9998 11C13.1044 11 13.9998 10.1046 13.9998 9C13.9998 10.1046 14.8952 11 15.9998 11C17.1044 11 17.9998 10.1046 17.9998 9C17.9998 10.1046 18.8952 11 19.9998 11C20.6371 11 21.2048 10.7019 21.5711 10.2375C22.117 9.54525 21.8333 8.57905 21.509 7.75929L20.1054 4.21114C19.5674 3.13531 19.2985 2.5974 18.8152 2.2987C18.3319 2 17.7305 2 16.5276 2Z"
          ></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M20 21.25H22C22.4142 21.25 22.75 21.5858 22.75 22C22.75 22.4142 22.4142 22.75 22 22.75H2C1.58579 22.75 1.25 22.4142 1.25 22C1.25 21.5858 1.58579 21.25 2 21.25H4L4 12.5C4.74363 12.5 5.43309 12.2681 6 11.8727C6.56692 12.2681 7.25638 12.5 8 12.5C8.74363 12.5 9.43309 12.2681 10 11.8727C10.5669 12.2681 11.2564 12.5 12 12.5C12.7436 12.5 13.4331 12.2681 14 11.8727C14.5669 12.2681 15.2564 12.5 16 12.5C16.7436 12.5 17.4331 12.2681 18 11.8727C18.5669 12.2681 19.2564 12.5 20 12.5L20 21.25ZM9.5 21.25H14.5V18.5C14.5 17.5654 14.5 17.0981 14.299 16.75C14.1674 16.522 13.978 16.3326 13.75 16.2009C13.4019 16 12.9346 16 12 16C11.0654 16 10.5981 16 10.25 16.2009C10.022 16.3326 9.83261 16.522 9.70096 16.75C9.5 17.0981 9.5 17.5654 9.5 18.5V21.25Z"
          ></path>
        </g></svg
      >
      <span class={getClassName("side_menu_button_name", "products")}
        >Products</span
      >
    </a>
    <a
      href={`/manage/monetization?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "monetization")}
    >
      <svg
        class={getClassName("side_menu_button_logo", "monetization")}
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
      <span class={getClassName("side_menu_button_name", "monetization")}
        >Monetization</span
      >
    </a>
    <a
      href={`/manage/slas?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "slas")}
    >
      <svg
        style="position: relative; top: -2px"
        class={getClassName("side_menu_button_logo", "slas")}
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
      <span class={getClassName("side_menu_button_name", "slas")}>SLAs</span>
    </a>
    <a
      href={`/manage/datagen?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "datagen")}
    >
      <svg
        style="position: relative; top: -2px;"
        width="20px"
        class={getClassName("side_menu_button_logo", "datagen")}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g><g id="SVGRepo_iconCarrier">
          <path
            d="M23.5295 6.47L21.5295 4.47C21.3895 4.33 21.1995 4.25 20.9995 4.25C20.7995 4.25 20.6095 4.33 20.4695 4.47L18.4695 6.47C18.1795 6.76 18.1795 7.24 18.4695 7.53C18.7595 7.82 19.2395 7.82 19.5295 7.53L20.2495 6.81V11C20.2495 14.58 18.5795 16.25 14.9995 16.25H12.7495V3.81L14.7695 5.83C14.9195 5.98 15.1095 6.05 15.2995 6.05C15.4895 6.05 15.6795 5.98 15.8295 5.83C16.1195 5.54 16.1195 5.06 15.8295 4.77L12.5295 1.47C12.3895 1.33 12.1995 1.25 11.9995 1.25C11.7995 1.25 11.6095 1.33 11.4695 1.47L8.16945 4.77C7.87945 5.06 7.87945 5.54 8.16945 5.83C8.45945 6.12 8.93945 6.12 9.22945 5.83L11.2495 3.81V16.25H8.99945C5.41945 16.25 3.74945 14.58 3.74945 11V6.81L4.46945 7.53C4.61945 7.68 4.80945 7.75 4.99945 7.75C5.18945 7.75 5.37945 7.68 5.52945 7.53C5.81945 7.24 5.81945 6.76 5.52945 6.47L3.52945 4.47C3.38945 4.33 3.19945 4.25 2.99945 4.25C2.79945 4.25 2.60945 4.33 2.46945 4.47L0.469453 6.47C0.179453 6.76 0.179453 7.24 0.469453 7.53C0.759453 7.82 1.23945 7.82 1.52945 7.53L2.24945 6.81V11C2.24945 15.42 4.57945 17.75 8.99945 17.75H11.2495V22C11.2495 22.41 11.5895 22.75 11.9995 22.75C12.4095 22.75 12.7495 22.41 12.7495 22V17.75H14.9995C19.4195 17.75 21.7495 15.42 21.7495 11V6.81L22.4695 7.53C22.6195 7.68 22.8095 7.75 22.9995 7.75C23.1895 7.75 23.3795 7.68 23.5295 7.53C23.8195 7.24 23.8195 6.76 23.5295 6.47Z"
          ></path>
          <path
            d="M15 20.75H9C8.59 20.75 8.25 20.41 8.25 20C8.25 19.59 8.59 19.25 9 19.25H15C15.41 19.25 15.75 19.59 15.75 20C15.75 20.41 15.41 20.75 15 20.75Z"
          ></path>
        </g></svg
      >
      <span class={getClassName("side_menu_button_name", "datagen")}
        >AI DataGen</span
      >
    </a>    
    <a
      href={`/manage/sites?site=${appService.currentSiteData.id}`}
      class={getClassName("side_menu_button", "sites")}
    >
      <svg
        style="position: relative; top: -4px"
        class={getClassName("side_menu_button_logo", "sites")}
        width="20px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 80 80"
        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g><g id="SVGRepo_iconCarrier">
          <g>
            <path
              d="M73.9,27c-3.9,0-7.1,3.2-7.1,7.1c0,0.6,0.1,1.1,0.2,1.6l-6.7,4.4c-2.1-2.4-5.1-4-8.6-4 c-2.6,0-5,0.9-6.9,2.4l-11-7.6c0.7-2.9-0.8-6.1-3.6-7.4c-3.3-1.5-7.2-0.1-8.7,3.1s-0.1,7.2,3.1,8.7c1.7,0.8,3.6,0.8,5.3,0.1 l11.3,7.9c-0.5,1.2-0.8,2.6-0.8,4c0,0.8,0.1,1.5,0.2,2.3l-6.9,2.5c-0.9-1-2.1-1.8-3.6-2.2c-3.9-1.1-8,1.2-9.1,5.2 c-1.1,3.9,1.2,8,5.2,9.1c3.9,1.1,8-1.2,9.1-5.2c0.1-0.4,0.2-0.8,0.2-1.2l7.9-2.8c2.1,2.2,5,3.6,8.2,3.6c0.3,0,0.6,0,0.9,0l1.1,5.6 c-2.1,1.7-3.3,4.4-3,7.2c0.4,4.6,4.5,7.9,9.1,7.5c4.6-0.4,7.9-4.5,7.5-9.1c-0.4-4.1-3.7-7.2-7.7-7.5l-1.2-5.9 c2.8-2,4.7-5.4,4.7-9.1c0-0.6-0.1-1.2-0.1-1.7l7.9-5.2c1,0.5,2.1,0.8,3.2,0.8c3.9,0,7.1-3.2,7.1-7.1C81,30.2,77.8,27,73.9,27z M51.7,54.6c-4,0-7.2-3.2-7.2-7.2c0-4,3.2-7.2,7.2-7.2c4,0,7.2,3.2,7.2,7.2C58.9,51.3,55.7,54.6,51.7,54.6z"
            ></path> <circle cx="51.8" cy="47.4" r="3.2"></circle>
          </g>
        </g></svg>
      <span class={getClassName("side_menu_button_name", "categories")}>Hubs</span
      >
    </a>
  </div>
</div>
