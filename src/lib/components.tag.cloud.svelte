<script lang="ts">
  export let data: string[] = [];
  export let onRemove: (tag: string) => void;
  import { fade, slide, fly, blur, scale } from 'svelte/transition';
</script>

<div class="cloud_box">
  {#each data as tag}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="cloud_tag" transition:scale>
      <svg class="cloud_remove_button" on:click={() => {onRemove(tag)}} width="24px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M512 897.6c-108 0-209.6-42.4-285.6-118.4-76-76-118.4-177.6-118.4-285.6 0-108 42.4-209.6 118.4-285.6 76-76 177.6-118.4 285.6-118.4 108 0 209.6 42.4 285.6 118.4 157.6 157.6 157.6 413.6 0 571.2-76 76-177.6 118.4-285.6 118.4z m0-760c-95.2 0-184.8 36.8-252 104-67.2 67.2-104 156.8-104 252s36.8 184.8 104 252c67.2 67.2 156.8 104 252 104 95.2 0 184.8-36.8 252-104 139.2-139.2 139.2-364.8 0-504-67.2-67.2-156.8-104-252-104z" fill=""></path><path d="M707.872 329.392L348.096 689.16l-31.68-31.68 359.776-359.768z" fill=""></path><path d="M328 340.8l32-31.2 348 348-32 32z" fill=""></path></g></svg>  
      <span style="position: relative; top: -5px;">{tag}</span>
    </span>
  {/each}
</div>

<style>
  .cloud_box {
    margin-top: 18px;
    display: flex;
    flex-flow: row wrap;
  }

  .cloud_tag {
    border-radius: 44px;
    padding: 6px;
    padding-right: 12px;
    border-width: 2px;
    border-style: solid;
    border-color: var(--primary-color-dark);
    font-weight: bold;
    font-size: 14px;
    color: var(--primary-color);
    background-color: transparent;
    text-decoration: none;
    margin-right: 6px;
    margin-bottom: 6px;
    position: relative;
    cursor:default;
    top: 9px;
    transition: color 0.2s ease-in-out, background-position 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .cloud_tag:hover {
    background-color: #f4f4f4;
  }

  .cloud_remove_button {
    position: relative; 
    top: 2px;
    cursor: pointer;
    /* fill: #8c8c8c; */
    fill: var(--primary-color-dark);
    margin-right: 4px;
  }
</style>
