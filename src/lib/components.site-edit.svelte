<script lang="ts">
  import { appService } from "./app-service";
  import { DialogResult, DialogType, Site } from "./interfaces";
  import InputSelect from '$lib/components.input.select.svelte';
  import TagCloud from '$lib/components.tag.cloud.svelte';

  export let site: Site
  let defaultCategories = [
    "ESG - Environmental",
    "ESG - Social",
    "ESG - Governance"
  ];

  function addCategory(category: string) {
    if (!site.categories.includes(category)) {
      let siteCopy = site;
      siteCopy.categories.push(category);
      site = siteCopy;
    }

    if (!defaultCategories.includes(category)) {
      defaultCategories.push(category);
    }
  }

  function removeCategory(category: string) {
    if (site.categories.includes(category)) {
      let siteCopy = site;
      let index = siteCopy.categories.indexOf(category);
      siteCopy.categories.splice(index, 1);
      site = siteCopy;
    }
  }

  function addTable() {
    appService.ShowDialog("Enter BigQuery table information.", "Save", DialogType.OkCancel, [{
      label: "Name", value: ""
    }, {
      label: "Entity", value: ""
    }, {
      label: "Table", value: ""
    }]).then((result: DialogResult) => {
      if (result.result === DialogType.Ok) {
        site.bqtables.push({
          name: result.inputs[0].value,
          entity: result.inputs[1].value,
          table: result.inputs[2].value
        });

        site = site;
      }
    });
  }

  function editTable(index: number) {
    appService.ShowDialog("Enter BigQuery table information.", "Save", DialogType.OkCancel, [
      {label: "Name", value: site.bqtables[index].name},
      {label: "Entity", value: site.bqtables[index].entity},
      {label: "Table", value: site.bqtables[index].table}
    ]).then((result) => {
      if (result.result === DialogType.Ok) {
        site.bqtables[index].name = result.inputs[0].value;
        site.bqtables[index].entity = result.inputs[1].value;
        site.bqtables[index].table = result.inputs[2].value;
      }
    });
  }

  function removeTable(index: number) {
    appService.ShowDialog("Are you sure you want to remove the BigQuery table?", "Confirm", DialogType.OkCancel, []).then((result) => {
      if (result.result === DialogType.Ok) {
        site.bqtables.splice(index, 1);
        site = site;
      }
    });
  }

  function setExampleGradient() {
    site.heroGradientStyle = "background: linear-gradient(0deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,1) 62%, rgba(255,255,255,.6) 100%);";
  }
</script>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="name" id="name" required bind:value={site.name} autocomplete="off" autofocus title="none" />
  <label for="name" class='input_field_placeholder'>
    Hub name
  </label>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="name_top" id="name_top" required bind:value={site.nameTop} autocomplete="off" title="none" />
  <label for="name_top" class='input_field_placeholder'>
    Name top position
  </label>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="name_left" id="name_left" required bind:value={site.nameLeft} autocomplete="off" title="none" />
  <label for="name_left" class='input_field_placeholder'>
    Name left position
  </label>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="logo" id="logo" required bind:value={site.logoUrl} autocomplete="off" title="none" />
  <label for="logo" class='input_field_placeholder'>
    Logo url
  </label>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="logo_width" id="logo_width" required bind:value={site.logoWidth} autocomplete="off" title="none" />
  <label for="logo_width" class='input_field_placeholder'>
    Logo width
  </label>
</div>

<div style="margin-top: 22px; margin-left: 8px;">
  <img src={site.logoUrl} alt="logo preview"
  width={site.logoWidth}/><span class="header_title_preview"
  style={"left: " + site.nameLeft + "; top: " + site.nameTop + ";"}>{site.name}</span>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="heroImageUrl" id="heroImageUrl" required bind:value={site.heroImageUrl} autocomplete="off" title="none" />
  <label for="heroImageUrl" class='input_field_placeholder'>
    Hero image url
  </label>
</div>

<div class="input_field_panel">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input_field" type="text" name="heroImagePosition" id="heroImagePosition" required bind:value={site.heroBackgroundPosition} autocomplete="off" title="none" />
  <label for="heroImagePosition" class='input_field_placeholder'>
    Hero image position (top, bottom, center...)
  </label>
</div>

<!-- <div class="input_field_panel">
  <input class="input_field" type="text" name="heroGradientStyle" id="heroGradientStyle" required bind:value={site.heroGradientStyle} autocomplete="off" title="none" />
  <label for="heroGradientStyle" class='input_field_placeholder'>
    Hero gradient style
  </label>
</div>

<button class="rounded_button_outlined" on:click={setExampleGradient}>Set example gradient</button> -->

<div style="margin-top: 22px; margin-left: 8px; width: 100%;">
  <div style={"height: 300px; width: 80%; position: absolute; " + site.heroGradientStyle}></div>
  <div style={"width: 80%; height: 300px; background-size: cover; background-image: url(" + site.heroImageUrl + "); background-position: " + site.heroBackgroundPosition + ";"}
  />
</div>

<div class="form_list" style="margin-bottom: 44px;">
  <h4>Categories</h4>

  <TagCloud data={site.categories} onRemove={removeCategory} />

  <InputSelect data={defaultCategories} label="Add category - subcategory" onSelect={addCategory} />

</div>

<div class="form_list">
  <h4>BigQuery tables <button class="text_button" style="font-weight: bold; font-size: 14px;" on:click|stopPropagation={addTable}>+ Add table</button></h4>
  <table class="flat_table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Entity</th>
        <th>Table</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if site.bqtables}
        {#each site.bqtables as table, i}
          <tr on:click|stopPropagation={() => editTable(i) }>
            <td>{table.name}</td>
            <td>{table.entity}</td>
            <td>{table.table}</td>
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
              <button on:click|stopPropagation={() => removeTable(i)}>
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
      {/if}
    </tbody>
  </table>
</div>

<style>
  .header_title_preview {
    font-family: "Open Sans", sans-serif;
    color: #2c2c2c;
    font-weight: 550;
    font-size: larger;
    position: relative;
    height: 100%;
  }
</style>