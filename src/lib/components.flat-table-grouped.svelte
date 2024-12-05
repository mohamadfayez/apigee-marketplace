<!-- 
<script module>
  export class RowClickEvent {}
</script> -->

<script lang="ts">

  export let headers: string[] = [];
  export let headersSearchable: string[] = [];
  export let categories: {[key: string]: any[]} = {};
  export let linkPrefix: string = "";
  export let linkColumnName: string = "";
  export let update: ((e: { detail: { rowIndex: number } }) => void);

  let categoriesDisplay: {[key: string]: any[]} = categories;
  let filterInput: string = "";

  function search() {
    if (filterInput) {
      let tempData: {[key: string]: any[]} = {};

      for (let cat of Object.keys(categories)) {
        tempData[cat] = [];

        for (let row of categories[cat]) {
          let addRow: boolean = false;

          for (let header of headers) {
            if (
              headersSearchable.length === 0 ||
              headersSearchable.includes(header)
            ) {
              if (
                row[header]
                  .toString()
                  .toLowerCase()
                  .includes(filterInput.toLowerCase())
              ) {
                addRow = true;
                break;
              }
            }
          }

          if (addRow) tempData[cat].push(row);
        }
      }

      categoriesDisplay = tempData;
    } else {
      categoriesDisplay = categories;
    }
  }

  const rowClick = (index: number) => {
    // if a callback was provider, also broadcast that
    if (update) {
      update({
        detail: {
          rowIndex: index,
        },
      });
    }
  };
</script>

<div class="card_frame">
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

  <table>
    <thead>
      <tr>
        {#each headers as header}
          <th>{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each Object.keys(categoriesDisplay) as cat, i}

        <tr style="background-color: #eee;">
          {#each headers as header, i}
            {#if i == 0}
              <td style="padding: 6px; padding-left: 12px;">{cat}</td>
            {:else}
              <th></th>
            {/if}
          {/each}
        </tr>

        {#each categoriesDisplay[cat] as row}
          <tr
            on:click={() => {
              rowClick(i);
            }}
          >
            {#each Object.entries(row) as col, i}
              <td
                ><a class="table_row" href={linkPrefix + row[linkColumnName]}
                  >{col[1]}</a
                ></td
              >
            {/each}
          </tr>
        {/each}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .card_frame {
    border-color: #eaedf2 !important;
    box-shadow: 0 2px 18px rgba(0, 0, 0, 0.02) !important;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 0.0625rem solid rgba(46, 54, 80, 0.125);
    border-radius: 0.5rem;
    padding: 22px 32px;
    font-family: "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  table {
    width: 100%;
    margin-bottom: 1rem;
    color: #4a5073;
    vertical-align: top;
    border-color: #eaedf2;
    font-family: "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    border-collapse: collapse;
  }

  table thead tr th {
    vertical-align: center;
    text-align: left;
    border-bottom: 1px solid #eaedf2 !important;
    font-size: 12px;
    font-weight: bold;
    padding-left: 14px;
    padding-bottom: 10px;
  }

  .table_row {
    padding-left: 14px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eaedf2 !important;
  }

  table tbody tr:hover {
    background-color: #eff0f2;
    cursor: pointer;
    border-radius: 0.5rem;
  }

  a:link {
    text-decoration: none;
    color: #4a5073;
  }

  a:visited {
    text-decoration: none;
    color: #4a5073;
  }

  a:hover {
    text-decoration: none;
    color: #4a5073;
  }

  a:active {
    text-decoration: none;
  }

  td a {
    display: block;
  }

  .filter {
    margin-top: 20px;
    margin-bottom: 8px;
    margin-left: 8px;
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
