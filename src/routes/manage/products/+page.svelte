<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import { DialogType, type User, type DataProduct, type FlatTableData } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import FlatTable from "$lib/components.flat-table.svelte";

  import { onMount } from "svelte";

  let currentUser: User | undefined = appService.currentUser;
  let products: DataProduct[] | undefined = appService.products;
  let productsTableConfig: FlatTableData = {
    headers: [
      {
        name: "name",
        displayName: "Name",
        searchable: true,
        sortable: true
      },{
        name: "ownerEmail",
        displayName: "Owner",
        searchable: true,
        sortable: true
      },{
        name: "source",
        displayName: "Data source",
        searchable: true,
        sortable: true
      },{
        name: "createdAt",
        displayName: "Creation date",
        searchable: true,
        sortable: true
      },{
        name: "status",
        displayName: "Status",
        searchable: true,
        sortable: true
      }
    ],
    data: [],
    styles: []
  };
  if (products)
    productsTableConfig.data = products;


  let sortName: boolean = false;

  onMount(() => {
    document.addEventListener("productsUpdated", () => {
      products = appService.products;
      if (products)
        productsTableConfig.data = products;
    });

    document.addEventListener("userUpdated", () => {
      currentUser = appService.currentUser;
      products = appService.products;
      if (products)
        productsTableConfig.data = products;
    });
  });

  function onRowClick(row: DataProduct) {
    appService.GoTo("/manage/products/" + row.id);
  }

  function onRowDelete(row: DataProduct) {
    appService
      .ShowDialog(
        "Are you sure you want to delete this product?",
        "Delete",
        DialogType.OkCancel, []
      )
      .then((result) => {
        if (result.result === DialogType.Ok) {
          fetch(`/api/products/${row.id}?site=${appService.currentSiteData.id}`, {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
            },
          }).then((response) => {
            if (appService && appService.products) {
              let index = appService.products.findIndex((x) => x.id == row.id);
              appService.products.splice(index, 1);
              products = appService.products;
              productsTableConfig.data = products;
            }
          });
        }
      });
  }

  function onDeleteAll() {
    appService
      .ShowDialog(
        "Are you sure you want to delete all products from this Hub? Products on other Hubs will not be deleted.",
        "Delete",
        DialogType.OkCancel, []
      )
      .then((result) => {
        if (result.result === DialogType.Ok) {

          let idArray: string[] = products ? products.map(a => a.id) : [];

          fetch(`/api/products?site=${appService.currentSiteData.id}`, {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(idArray)
          }).then(() => {
            if (appService && appService.products) {
              appService.products = [];
              products = appService.products;
              productsTableConfig.data = products;
            }
          });
        }
      });
  }

</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="products" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Products</span>
        <a
          href={`/manage/products/new?site=${appService.currentSiteData.id}`}
          class="text_button left_menu_page_right_header_button"
          >+ Add product</a
        >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <button on:click|stopPropagation={onDeleteAll}
        class="text_button left_menu_page_right_header_button" style="margin-left: 0px;"
        >⌫ Delete all</button>
      </div>

      <div class="left_menu_page_right_content">
        {#if products}
          <FlatTable data={productsTableConfig} {onRowClick} {onRowDelete} />
        {:else}
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
