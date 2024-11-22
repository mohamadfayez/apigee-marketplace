<script lang="ts">
  import Header from "$lib/components.header.svelte";
  import ModalDialog from "$lib/components.modal.dialog.svelte";
  import { appService } from "$lib/app-service";
  import {DialogType, DialogResult} from "$lib/interfaces";

  import "../app.css"
  import { onMount } from "svelte";
    import { fade } from "svelte/transition";

  let modalDialogVisible = false;
  let modalDialogMessage = "";
  let modalSubmitButtonText = "OK";
  let modalDialogType: DialogType = DialogType.Ok;
  let modalInputs: {label: string, value: string}[] = [];
  let modalPromise: Promise<DialogResult> | undefined = undefined;
  let modalPromiseResolve: (value: DialogResult) => void;

  onMount(async () => {
    document.addEventListener("cancelEvent", () => {
      modalDialogVisible = false;
    });
  });

  appService.RegisterModalDialogHandler = modalDialog;

  function modalDialog(message: string, submitButtonText: string, type: DialogType, inputs: {label: string, value: string}[]): Promise<DialogResult> {
    modalPromise = new Promise((resolve, reject) => {
      modalDialogMessage = message;
      modalDialogType = type;
      modalSubmitButtonText = submitButtonText;
      modalInputs = inputs;
      modalDialogVisible = true;
      modalPromiseResolve = resolve;
    });

    return modalPromise;
  }

  function modalResult(result: DialogResult): void {
    modalDialogVisible = false;
    modalPromiseResolve(result);
  }

  function sendCancel() {
      //First, we initialize our event
      const event = new Event('cancelEvent');
      // Next, we dispatch the event.
      document.dispatchEvent(event);
  }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={sendCancel} on:keyup={(e) => {if (e.key == "Escape") sendCancel();}} in:fade={{ duration: 150, delay: 150 }} out:fade={{ duration: 150 }}>
  <Header />

  {#if modalDialogVisible}
    <ModalDialog message={modalDialogMessage} submitButtonText={modalSubmitButtonText} type={modalDialogType} submit={modalResult} inputs={modalInputs}></ModalDialog>
  {/if}
  <slot />
</div>
