<script lang="ts">

export let data: string[] = [];
export let label: string = "";
export let onSelect: (selection: string) => void;

let inputString: string = "";
let matchingData: string[] = [];

function onInput(e: any) {

  if (e.key == "Enter") {
    onSelectCat(inputString);
  }
  else {
    let newMatchingData: string[] = [];
    if (inputString) {
      for (let cat of data) {
        if (cat.toLowerCase().includes(inputString.toLowerCase())) {
          newMatchingData.push(cat);
        }
      }
    }

    matchingData = newMatchingData;
  }
}

function onFocus() {
  if (!inputString) {
    matchingData = data;
  }
}

function onBlur() {
  matchingData = [];
}

function onSelectCat(selection: string) {
  inputString = "";
  matchingData = [];
  onSelect(selection);
}
</script>


<div class="input_field_panel">
  <input class="input_field" required type="text" name="category" id="category" on:focus={onFocus} on:blur={onBlur} on:keyup={onInput} bind:value={inputString} autocomplete="off" title="none" />
  <label for="category" class='input_field_placeholder'>
    {label}
  </label>
  {#if matchingData.length > 0}
    <div class="preview_box">
      {#each matchingData as cat}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="category_box" on:mousedown={() => onSelectCat(cat)}>{cat}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .preview_box {
    width: 100%;
    position: absolute;
    top: 42px;
    background: white;
    cursor: pointer;
    z-index: 1;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 10px 0px;
    border: 1px solid rgb(242, 242, 242);
  }

  .category_box {
    padding: 4px;
  }
</style>

