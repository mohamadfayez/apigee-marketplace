<script lang="ts">
  import { goto } from "$app/navigation";
	import { appService } from "$lib/app-service";
  import Header from "../../lib/components.header.svelte";

  function cancel() {
    history.back();
  }

  function signInWithGoogle() {
    history.back();
    appService.SignInWithGoogle();
  }

  function signInWithSAML() {
    history.back();
    appService.SignInWithSAML();
  }

  function signInWithEmail() {
    appService.GoTo("/sign-in/email");
  }

</script>

<Header />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sc" on:keydown={() => {}} on:click={cancel}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="sp" on:keydown={() => {}} on:click|stopPropagation={() => {}}>
    <h2>Welcome to Data Marketplace</h2>
    <div class="so">

      <div class="sign_in_option">
        <button class="sob" on:click={signInWithGoogle}>
          <div class="sobt">
            <svg width="25" height="25" class="sobti"
              ><g fill="none" fill-rule="evenodd"
                ><path
                  d="M20.66 12.7c0-.61-.05-1.19-.15-1.74H12.5v3.28h4.58a3.91 3.91 0 0 1-1.7 2.57v2.13h2.74a8.27 8.27 0 0 0 2.54-6.24z"
                  fill="#4285F4"
                /><path
                  d="M12.5 21a8.1 8.1 0 0 0 5.63-2.06l-2.75-2.13a5.1 5.1 0 0 1-2.88.8 5.06 5.06 0 0 1-4.76-3.5H4.9v2.2A8.5 8.5 0 0 0 12.5 21z"
                  fill="#34A853"
                /><path
                  d="M7.74 14.12a5.11 5.11 0 0 1 0-3.23v-2.2H4.9A8.49 8.49 0 0 0 4 12.5c0 1.37.33 2.67.9 3.82l2.84-2.2z"
                  fill="#FBBC05"
                /><path
                  d="M12.5 7.38a4.6 4.6 0 0 1 3.25 1.27l2.44-2.44A8.17 8.17 0 0 0 12.5 4a8.5 8.5 0 0 0-7.6 4.68l2.84 2.2a5.06 5.06 0 0 1 4.76-3.5z"
                  fill="#EA4335"
                /></g
              ></svg
            >
            Sign in with Google
          </div>
        </button>
      </div>

      <div class="sign_in_option">
        <button class="sob" on:click={signInWithEmail}>
          <div class="sobt">
            <svg class="sobti" width="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z" fill="#080341"></path> </g></svg>
            Sign in with Email
          </div>
        </button>
      </div>

      <div class="sign_in_option">
        <button class="sob" on:click={signInWithSAML} disabled>
          <div class="sobt">
            <svg class="sobti" width="25px" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8.1819 10.7027H6.00008C5.44781 10.7027 5.0001 11.1485 5.00009 11.7008C5.00005 13.3483 5 16.6772 5.00011 18.9189C5.00023 21.4317 8.88618 22 12 22C15.1139 22 19 21.4317 19 18.9189C19 16.6773 19 13.3483 19 11.7008C19 11.1485 18.5523 10.7027 18 10.7027H15.8182M8.1819 10.7027C8.1819 10.7027 8.18193 8.13514 8.1819 6.59459C8.18186 4.74571 9.70887 3 12 3C14.2912 3 15.8182 4.74571 15.8182 6.59459C15.8182 8.13514 15.8182 10.7027 15.8182 10.7027M8.1819 10.7027H15.8182" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M13 16.6181V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V16.6181C10.6931 16.3434 10.5 15.9442 10.5 15.5C10.5 14.6716 11.1716 14 12 14C12.8284 14 13.5 14.6716 13.5 15.5C13.5 15.9442 13.3069 16.3434 13 16.6181Z" fill="#000000"></path> </g></svg>
            Sign in with Enterprise SSO
          </div>
        </button>
      </div>
    </div>
  </div>

</div>

<style>
    .sc {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.95);
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vw;
    animation: 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 0s 1 normal forwards
      running k3;
    transform-origin: center bottom;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    /* display: flex; */
  }

  .sp {
    width: 500px;
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: flex;
    /* flex: 1 0 auto; */
    position: relative;

    animation: 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 0s 1 normal forwards
      running k3;

    padding: 44px 56px;
    background: rgb(255, 255, 255);
    box-shadow: rgb(0 0 0 / 15%) 0px 2px 10px;
    border-radius: 4px;
    display: block;
    /* max-height: 695px;
    height: 100%; */
    flex-direction: row;

    margin: 0;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .so {
    margin-top: 50px;
  }

  .sob {
    width: 242px;
    border-color: rgb(168, 168, 168);
    text-align: left;
    padding: 6px 12px 8px 16px;
    background: rgb(255, 255, 255);
    border-style: solid;
    border-width: 1px;
    border-radius: 99em;
    color: rgba(41, 41, 41, 1);
    font-size: 14px;
    font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: 400;
    display: inline-block;
    box-sizing: border-box;
    cursor: pointer;
  }

  .sob:disabled {
    opacity: .4;
    cursor: default;
  }

  .sobt {
    align-items: center;
    text-align: left;
    line-height: 20px;
    display: flex;
  }

  .sobti {
    margin-right: 8px;
    vertical-align: middle;
  }

  .sign_in_option {
    margin-bottom: 14px;
  }
</style>