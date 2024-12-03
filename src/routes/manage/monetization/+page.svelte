<script lang="ts">
  import { goto } from "$app/navigation";
  import { appService } from "$lib/app-service";
  import { DialogType,
    type User,
    type DataProduct,
    type FlatTableData,
    MonetizationRatePlan

  } from "$lib/interfaces";
  import MenuLeftAdmin from "$lib/components-menus-left/menus-left.admin.svelte";
  import FlatTable from "$lib/components.flat-table.svelte";
  import { onMount } from "svelte";

  let currentUser: User | undefined = appService.currentUser;
  let ratePlans: MonetizationRatePlan[] = []

  let monetizationTableConfig: FlatTableData = {
    headers: [
    {
      name: "displayName",
      displayName: "Plan name",
      sortable: true,
      searchable: true
    }, {
      name: "billingPeriod",
      displayName: "Billing period",
      sortable: true,
      searchable: true
    }, {
      name: "paymentFundingModel",
      displayName: "Payment model",
      sortable: true,
      searchable: false
    }, {
      name: "consumptionPricingType",
      displayName: "Payment type",
      sortable: true,
      searchable: false
    }],
    data: [],
    styles: []
  };
  if (appService.configData && appService.configData.ratePlans) monetizationTableConfig.data = appService.configData.ratePlans;

  onMount(() => {
    document.addEventListener("siteUpdated", () => {
      if (appService.configData && appService.configData.ratePlans) {
        monetizationTableConfig.data = appService.configData.ratePlans;
        monetizationTableConfig = monetizationTableConfig;
      }
    });

    document.addEventListener("userUpdated", () => {
      currentUser = appService.currentUser;
    });
  });

  function onRowClick(row: MonetizationRatePlan) {
    appService.GoTo("/manage/monetization/" + row.name);
  }

  function onRowDelete(row: MonetizationRatePlan) {
    if (row) {
      appService.ShowDialog(`Are you sure that you want to delete the monetization plan "${row.displayName}"?`, "Delete", DialogType.OkCancel, []).then((value) => {
        if (value.result == DialogType.Ok) {
          if (appService.configData && appService.configData.ratePlans) {
            let ratePlanIndex = appService.configData.ratePlans.findIndex((x) => x.name === row.name);
            if (ratePlanIndex != undefined && ratePlanIndex >= 0) {
              appService.configData.ratePlans.splice(ratePlanIndex, 1);
              monetizationTableConfig.data = appService.configData.ratePlans;
              monetizationTableConfig = monetizationTableConfig;
              // save rate plans
              fetch("/api/data/default?col=apigee-marketplace-config", {
                method: "PUT",
                body: JSON.stringify(appService.configData)
              });
            }
          }
        }
      })
    }
  }
</script>

<div class="left_menu_page">
  <MenuLeftAdmin selectedName="monetization" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Monetization rate plans</span>
        <a
          href="/manage/monetization/new"
          class="text_button left_menu_page_right_header_button"
          style="margin-left: 20px;">+ Add plan</a
        >
      </div>

      <div class="left_menu_page_right_content">
        {#if monetizationTableConfig}
          <FlatTable data={monetizationTableConfig} {onRowClick} {onRowDelete} />
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
