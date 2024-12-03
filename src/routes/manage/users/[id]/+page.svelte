<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import TagCloud from "$lib/components.tag.cloud.svelte";
  import InputSelect from "$lib/components.input.select.svelte";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import type { IdentityConfig, User } from "$lib/interfaces";

  export let data: PageData;
  let userData: User;
  let roles: string[];

  onMount(async () => {
    fetch("/api/users/" + data.userId)
      .then((response) => {
        return response.json();
      })
      .then((data: User) => {
        userData = data;
      })
      .catch((err) => {
        console.error("Error loading user data in admin user management.");
        console.error(err);
      });

    fetch("/api/data/default?col=apigee-marketplace-config").then((response) => {
      if (response.status === 404) {
      }
      else if (response.status === 200)
        return response.json();
    }).then((config: {roles: string[]}) => {
      roles = config.roles;
    });
  });

  function addRole(role: string) {
    if (!userData.roles.includes(role)) {
      
      userData.roles.push(role);
      userData = userData;
    }
  }

  function removeRole(role: string) {
    let index = userData.roles.indexOf(role);
    userData.roles.splice(index);
    userData = userData;
  }

  function submit() {
    fetch("/api/users/" + userData.email, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    }).then((response) => {
      if (response.status != 200) {
        appService.ShowSnackbar("Error saving user: " + response.statusText);
      }
      else {
        back();
      }
    });
  }

  function back() {
    appService.GoTo("/manage/users");
  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="users" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <button class="back_button" on:click={back}>
          <svg
            data-icon-name="arrowBackIcon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
            ><path
              fill-rule="evenodd"
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"
            ></path></svg
          >
        </button>
        <span>Edit user</span>
      </div>

      <div class="right_content">
        {#if userData && roles}
          <div>
            <div class="right_content_tip">
              <h3>{userData.firstName + " " + userData.lastName}</h3>
            </div>

            <div style="margin-top: 34px;">
              <div class="product_left_details">
                
                <div class="input_field_panel">
                  <!-- svelte-ignore a11y-autofocus -->
                  <input
                    class="input_field"
                    type="text"
                    name="email"
                    id="email"
                    required
                    bind:value={userData.email}
                    autocomplete="off"
                    title="none"
                    disabled
                  />
                  <label for="email" class="input_field_placeholder">
                    Email
                  </label>
                </div>

                <div class="input_field_panel">
                  <!-- svelte-ignore a11y-autofocus -->
                  <input
                    class="input_field"
                    type="text"
                    name="userName"
                    id="userName"
                    required
                    bind:value={userData.userName}
                    autocomplete="off"
                    autofocus
                    title="none"
                  />
                  <label for="userName" class="input_field_placeholder">
                    Username
                  </label>
                </div>

                <div style="display: flex; max-width: 524px">
                  <div class="input_field_panel" style="width: 50%; margin-right: 4px;">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                      class="input_field"
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      bind:value={userData.firstName}
                      autocomplete="off"
                      title="none"
                    />
                    <label for="firstName" class="input_field_placeholder">
                      First name
                    </label>
                  </div>

                  <div class="input_field_panel" style="width: 50%;">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                      class="input_field"
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      bind:value={userData.lastName}
                      autocomplete="off"
                      title="none"
                    />
                    <label for="lastName" class="input_field_placeholder">
                      Last name
                    </label>
                  </div>
                </div>

                <div class="form_list">
                  <h4>Roles</h4>
            
                  <TagCloud data={userData.roles} onRemove={removeRole} />
            
                  <InputSelect data={roles} label="Add role" onSelect={addRole} />
            
                </div>

              </div>
            </div>
          </div>
          <div class="form_controls">
            <button
              on:click={back}
              type="button"
              class="rounded_button_outlined">Cancel</button
            >
            <button
              type="button"
              on:click={submit}
              class="rounded_button_filled">Save</button
            >
          </div>
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
