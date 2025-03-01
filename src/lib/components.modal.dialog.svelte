<script lang="ts">

  import {DialogType, DialogResult} from "$lib/interfaces";

  export let message = "";
  export let inputs: {label: string, value: string}[] = [];
  export let submitButtonText = "Ok";
  export let type: DialogType = DialogType.OkCancel;

  export let submit: (result: DialogResult) => void

  function onClick() {
    
  }

  function onOk() {
    let result: DialogResult = {
      result: DialogType.Ok,
      inputs: inputs
    };

    if (submit) submit(result);
  }

  function onCancel() {
    let result: DialogResult = {
      result: DialogType.Cancel,
      inputs: inputs
    };

    if (submit) submit(result);  }
</script>

<div class="modal_background">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal_dialog" on:click|stopPropagation={onClick}>
    <div class="modal_message">
      {message}
    </div>

    {#each inputs as input, i}
      <div class="input_field_panel">
        <!-- svelte-ignore a11y-autofocus -->
        <input class="input_field" type="text" autofocus={i === 0 ? true : false} name={input.label} id={input.label} required bind:value={input.value} autocomplete="off" title="none" />
        <label for={input.label} class='input_field_placeholder'>
          {input.label}
        </label>
      </div>
    {/each}

    <div class="modal_controls">
      {#if type == DialogType.OkCancel}
      <button class="rounded_button_outlined" on:click={onCancel}>Cancel</button>
      {/if}
      <button class="rounded_button_filled" on:click={onOk}>{submitButtonText}</button>
    </div>
  </div>
</div>

<style>
  .modal_background {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.5);
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vw;
    animation: 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 0s 1 normal forwards
      running k3;
    transform-origin: center bottom;
    align-items: center;
    justify-content: center;
    z-index: 3000;
  }

  .modal_dialog {
    width: 400px;
    text-align: left;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: flex;
    /* flex: 1 0 auto; */
    position: relative;

    animation: 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 0s 1 normal forwards
      running k3;

    padding: 44px 64px;
    background: rgb(255, 255, 255);
    box-shadow: rgb(0 0 0 / 15%) 0px 2px 10px;
    border-radius: 44px;
    display: block;
    
    min-height: 164px;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: row;

    margin: 0;
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 20px;
    font-weight: 100;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .modal_message {
    margin-top: 40px;
    color: var(--selected-gray-color);
  }

  .modal_controls {
    margin-bottom: 14px;
    margin-top: 16px;
    text-align: right;
  }
</style>