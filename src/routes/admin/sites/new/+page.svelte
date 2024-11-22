<script lang="ts">
  import { DialogResult, DialogType, Site, SLA } from "$lib/interfaces";
  import { onMount } from "svelte";
  import MenuLeftAdmin from '$lib/components-menus-left/menus-left.admin.svelte';
  import InputSelect from '$lib/components.input.select.svelte';
  import TagCloud from '$lib/components.tag.cloud.svelte';
  import { goto } from "$app/navigation";
  import { generateRandomString } from "$lib/utils";
  import { appService } from "$lib/app-service";

  let site: Site = {id: generateRandomString(4), name: "", nameTop: "-12px", nameLeft: "4px", logoUrl: "/loop.svg", logoWidth: "36px", owner: appService.currentUser?.email ? appService.currentUser?.email : "", categories: [], products: [], bqtables: []};

  let categories = [
    "ESG - Environmental",
    "ESG - Social",
    "ESG - Governance"
  ];

  onMount(() => {
    
  });

  function back() {
    appService.GoTo("/admin/sites");
  }

  function submit() {
    site.id = encodeURI(site.name.split(" ")[0].toLowerCase().replace("%", "") + "_" + site.id);
    if (appService.currentUser)
    site.owner = appService.currentUser?.email;

    fetch("/api/data?col=apigee-marketplace-sites", {
      method: 'POST',
      body: JSON.stringify(site),
      headers: {
        'content-type': 'application/json',
      },
    }).then((response) => {
        return response.json();
    }).then((data: Site) => {
      appService.sites.push(data);
      document.dispatchEvent(new Event('siteUpdated'));
      appService.GoTo("/admin/sites");
    }).catch((error) => {
      console.error(error);
    });
  }

  function addCategory(category: string) {
    if (!site.categories.includes(category)) {
      let siteCopy = site;
      siteCopy.categories.push(category);
      site = siteCopy;
    }

    if (!categories.includes(category)) {
      categories.push(category);
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

</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="sites" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
          <button class="back_button" on:click={back}>
            <svg data-icon-name="arrowBackIcon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></path></svg>
          </button>            
          <span>Create Site</span>
      </div>

      <div class="right_content">
        
        <div class="input_field_panel">
          <!-- svelte-ignore a11y-autofocus -->
          <input class="input_field" type="text" name="name" id="name" required bind:value={site.name} autocomplete="off" autofocus title="none" />
          <label for="name" class='input_field_placeholder'>
            Site name
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

        <div class="form_list" style="margin-bottom: 44px;">
          <h4>Categories</h4>
    
          <TagCloud data={site.categories} onRemove={removeCategory} />

          <InputSelect data={categories} label="Add category - subcategory" onSelect={addCategory} />
   
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

        <div class="form_controls">
          <button on:click={back} type="button" class="rounded_button_outlined">Cancel</button>
          <button type="button" on:click={submit} class="rounded_button_filled">Save</button>
        </div>
      </div>

    </div>
  </div>
</div>


