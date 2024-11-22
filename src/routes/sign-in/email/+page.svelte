<script lang="ts">
	import { appService } from "$lib/app-service";
  import Header from "$lib/components.header.svelte";

  let email: string = "";
  let password1: string = "";

  function cancel() {
    history.back();
  }

  function submit(e: { key: string; }) {
    if (e.key == "Escape")
      cancel();
    else if (e.key == "Enter")
      signInWithEmail();
  }

  function signInWithEmail() {
    if (email == "" || !email.includes("@")) {
      appService.ShowSnackbar("Email address is invalid.");
    }
    else if (password1 == "") {
      appService.ShowSnackbar("Please enter your password.");
    }
    else 
      appService.SignInWithEmail(email, password1);
  }
</script>

<Header />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sc" on:keydown={() => {}} on:click={cancel}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="sp" on:keydown={() => {}} on:click|stopPropagation={() => {}}>
    <h2>Sign in with your email</h2>
    <div class="so" on:keydown={submit}>

      <div class="input_field_panel">
        <input class="input_field" type="text" id="email" required bind:value={email} autocomplete="off" autofocus title="none" />
        <label for="email" class='input_field_placeholder'>
          Email
        </label>
      </div>

      <div class="input_field_panel">
        <input class="input_field" type="password" id="password1" required bind:value={password1} autocomplete="off" title="none" />
        <label for="password1" class='input_field_placeholder'>
          Password
        </label>
      </div>      

    </div>

    <div class="controls">
      <button on:click={() => history.back()} class="rounded_button_outlined">Cancel</button>
      <button on:click={signInWithEmail} class="rounded_button_filled">Sign in</button>
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
    width: 450px;
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

  .controls {
    margin-top: 24px;
  }


</style>