<script lang="ts">
  import {
    FlatTableData,
    type FlatTableHeader,
    type FlatTableStyle,
  } from "$lib/interfaces";

  export let data: FlatTableData;
  export let onRowClick: (row: any) => void;
  export let onRowDelete: (row: any) => void;

  $: displayData = data;
  let filterInput: string = "";
  let sortFlags: { [key: string]: boolean } = {};

  function sortHeader(header: FlatTableHeader) {
    if (header.sortable) {
      let tempData = displayData;

      if (sortFlags[header.name]) {
        tempData.data.sort((a, b) => (a[header.name] < b[header.name] ? -1 : 1));
      } else {
        tempData.data.sort((a, b) => (a[header.name] > b[header.name] ? -1 : 1));
      }
      if (sortFlags[header.name]) sortFlags[header.name] = false;
      else sortFlags[header.name] = true;

      displayData = tempData;
    }
  }

  function search() {
    if (filterInput) {
      let tempData: any[] = [];

      for (let row of data.data) {
        let addRow: boolean = false;

        for (let header of data.headers) {
          if (header.searchable) {
            if (
              row[header.name]
                .toString()
                .toLowerCase()
                .includes(filterInput.toLowerCase())
            ) {
              addRow = true;
              break;
            }
          }
        }

        if (addRow) tempData.push(row);
      }

      displayData.data = tempData;
    } else {
      displayData.data = data.data;
    }
  }

  function rowClick(row: any) {
    if (onRowClick) onRowClick(row);
  }

  function deleteClick(row: any) {
    if (onRowDelete) onRowDelete(row);
  }
</script>

{#if data}
  <div class="filter">
    <svg
      data-icon-name="filterIcon"
      viewBox="0 0 18 18"
      width="18"
      height="18"
      aria-hidden="true"
      ><path fill-rule="evenodd" d="M2 4h14v2H2V4zm2 4h10v2H4V8zm2 4h6v2H6v-2z"
      ></path></svg
    >
    <span class="filter_input_box">
      Filter
      <input
        class="filter_input"
        on:keyup={search}
        bind:value={filterInput}
        placeholder="Value to filter for"
      />
    </span>
  </div>
  <table class="flat_table" style="margin-top: 8px;">
    <thead>
      <tr>
        {#each Object.values(data.headers) as header, i}
          <th on:click={() => sortHeader(header)}>
            {header.displayName}
            {#if sortFlags[header.name] === true}
              <svg
                viewBox="0 0 24 24"
                class="header_sort_icon"
                width="14px"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g><g id="SVGRepo_iconCarrier">
                  <path
                    d="M18.2929 15.2893C18.6834 14.8988 18.6834 14.2656 18.2929 13.8751L13.4007 8.98766C12.6195 8.20726 11.3537 8.20757 10.5729 8.98835L5.68257 13.8787C5.29205 14.2692 5.29205 14.9024 5.68257 15.2929C6.0731 15.6835 6.70626 15.6835 7.09679 15.2929L11.2824 11.1073C11.673 10.7168 12.3061 10.7168 12.6966 11.1073L16.8787 15.2893C17.2692 15.6798 17.9024 15.6798 18.2929 15.2893Z"
                    fill="#0F0F0F"
                  ></path>
                </g></svg
              >
            {:else if sortFlags[header.name] === false}
              <svg
                viewBox="0 0 24 24"
                class="header_sort_icon"
                width="14px"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g><g id="SVGRepo_iconCarrier">
                  <path
                    d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                    fill="#0F0F0F"
                  ></path>
                </g></svg
              >
            {/if}
          </th>
        {/each}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.values(displayData.data) as row, i}
        <tr on:click={() => rowClick(row)}>
          {#each Object.values(data.headers) as header, i}
            <td>{row[header.name]}</td>
          {/each}
          <td style="white-space: pre;">
            <button>
              <svg
                width="18px"
                viewBox="0 0 18 18"
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
                ><path
                  d="M2 13.12l8.49-8.488 2.878 2.878L4.878 16H2v-2.88zm13.776-8.017L14.37 6.507 11.494 3.63l1.404-1.406c.3-.3.783-.3 1.083 0l1.8 1.796c.3.3.3.784 0 1.083z"
                  fill-rule="evenodd"
                ></path></svg
              >
            </button>
            <button on:click|stopPropagation={() => deleteClick(row)}>
              <svg
                width="18px"
                viewBox="0 0 18 18"
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
                ><path
                  d="M6.5 3c0-.552.444-1 1-1h3c.552 0 1 .444 1 1H15v2H3V3h3.5zM4 6h10v8c0 1.105-.887 2-2 2H6c-1.105 0-2-.887-2-2V6z"
                  fill-rule="evenodd"
                ></path></svg
              >
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .filter {
    margin-top: 20px;
    margin-bottom: 8px;
  }

  .header_sort_icon {
    position: absolute;
    margin-left: 4px;
  }

  .filter_input_box {
    position: relative;
    top: -3px;
    font-weight: bold;
    font-size: 14px;
  }

  .filter_input {
    width: 50%;
    margin-left: 8px;
    font-family:
      Google Sans,
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    padding: var(--padding);
    /* border: 2px solid gray; */
    border: 0px;
    outline: none;
    border-radius: 0px;
    /* background-color: #f1f3f4; */
    background-color: rgb(255, 255, 255);
  }
</style>
