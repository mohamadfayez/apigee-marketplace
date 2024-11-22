<script lang="ts">
  import { appService } from "$lib/app-service";
  import {
    UsageData,
    type User,
    type BucketSubscription,
  } from "$lib/interfaces";
  import { onMount } from "svelte";
  import MenuLeftAccount from "$lib/components-menus-left/menus-left.account.svelte";
  let currentUser: User | undefined = appService.currentUser;
  let usageData: UsageData | undefined = undefined;
  let latencyData: UsageData | undefined = undefined;
  let appUsage: { [key: string]: any } | undefined = undefined;
  let appLatency: { [key: string]: any } | undefined = undefined;
  const formatter = new Intl.DateTimeFormat("en", { month: "short" });
  let currentDate = new Date();
  let monthNames: string[] = [];

  onMount(() => {
    // Set the month names
    let monthOneNumber: number = currentDate.getMonth() + 1;
    let monthTwoNumber: number = monthOneNumber - 1;
    if (monthTwoNumber === 0) monthTwoNumber = 12;
    let monthThreeNumber: number = monthTwoNumber - 1;
    if (monthThreeNumber === 0) monthThreeNumber = 12;
    monthNames.push(
      formatter.format(
        new Date(currentDate.getFullYear(), monthThreeNumber - 1)
      )
    );
    monthNames.push(
      formatter.format(new Date(currentDate.getFullYear(), monthTwoNumber - 1))
    );
    monthNames.push(formatter.format(currentDate));

    document.addEventListener("userUpdated", () => {
      currentUser = appService?.currentUser;
    });

    document.addEventListener("appsUpdated", () => {
      updateBillingData();
    });

    updateBillingData();
  });

  function updateBillingData(force: boolean = false) {
    if ((!usageData && currentUser) || force) {
      usageData = undefined;
      appUsage = undefined;
      fetch("/api/billing?email=" + currentUser?.email)
        .then((result) => {
          return result.json();
        })
        .then((data: any) => {
          usageData = data;
          appUsage = getAppData(data);
          google.charts.load("current", {
            packages: ["corechart", "bar", "geochart"],
          });
          google.charts.setOnLoadCallback(drawBasic);
        });
    }
  }

  function getAppData(analyticsData: UsageData): any {
    let newAppUsage: { [key: string]: any } = {};
    if (analyticsData && analyticsData.environments && analyticsData.environments.length > 0 && analyticsData.environments[0].dimensions) {

      for (let dim of analyticsData.environments[0].dimensions) {
        //let myApp = appService.apiApps?.apps.find((app) => app.name === dim.name);
        if (!newAppUsage[dim.name]) {
          newAppUsage[dim.name] = {};
          newAppUsage[dim.name][monthNames[0]] = 0;
          newAppUsage[dim.name][monthNames[1]] = 0;
          newAppUsage[dim.name][monthNames[2]] = 0;
        }

        if (dim.metrics.length > 0) {
          for (let metric of dim.metrics[0].values) {
            let dateObj = new Date(metric.timestamp);
            newAppUsage[dim.name][formatter.format(dateObj)] = parseInt(metric.value);
          }
        }
      }
    }

    return newAppUsage;
  }

  function drawBasic() {
    if (appUsage) {
      let graphAppData: any[][] = [["Month"]];
      for (const [key, value] of Object.entries(appUsage)) {
        if (!graphAppData[0].includes(key)) graphAppData[0].push(key);

        for (let name of monthNames) {
          let monthIndex = graphAppData.findIndex((x) => x[0] == name);
          if (monthIndex === -1) {
            graphAppData.push([name]);
            monthIndex = graphAppData.length - 1;
          }

          graphAppData[monthIndex].push(parseInt(value[name]));
        }
      }

      var data = google.visualization.arrayToDataTable(graphAppData);

      var options = {
        title: "App charges (dollars)",
        curveType: "function",
        legend: { position: "bottom" },
      };

      var chart = new google.visualization.LineChart(
        document.getElementById("chart_div")
      );
      chart.draw(data, options);
    }
  }
</script>

<div class="left_menu_page">
  <MenuLeftAccount selectedName="billing" />

  <div class="left_menu_page_right">
    <div>
      <div class="left_menu_page_right_header">
        <span>Billing</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          on:click={() => {
            updateBillingData(true);
          }}
          class="back_button"
          style="width: 26px; height: 20px; padding-left: 0px; margin-left: 14px;"
          title="Refresh"
        >
          <svg
            style="margin-left: 7px; fill: var(--primary-color);" width="26px"
            aria-hidden="true"
            ><path
              fill-rule="evenodd"
              d="M13.95 4.05A7 7 0 1015.93 10H13.9A5 5 0 014 9a5 5 0 018.536-3.536L10 8h6V2l-2.05 2.05z"
            ></path></svg
          >
        </span>
      </div>

      <div class="left_menu_page_right_content">
        {#if appUsage}
          <div>
            <h4>Current month</h4>

            <div class="app_box">
              {#each Object.keys(appUsage) as appName}
                <div style="text-align: center;" class="app_card">
                  <div
                    style="font-size: 24px; margin-bottom: 20px; margin-top: 8px; font-weight: bold;"
                  >
                    {appName}
                  </div>
                  <div style="width: 100%; font-size: 24px;">
                    {"$" + appUsage[appName][monthNames[2]]}<br>
                  </div>
                </div>
              {/each}
            </div>

            <h4>Last 3 months</h4>
            <div id="chart_div"></div>
            <div id="chart_latency_div"></div>
          </div>
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

<style>
  .app_box {
    display: flex;
    flex-wrap: wrap;
    margin-left: 68px;
  }

  .app_card {
    width: 270px;
    height: 120px;
    color: black;
    background-color: #fff;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 1px 5px 0px,
      rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
      rgba(0, 0, 0, 0.12) 0px 3px 1px -2px;
    padding: 16px 20px;
    border-radius: 44px;
    margin: 12px;
  }

  .app_card:hover {
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 3px 5px -1px,
      rgba(0, 0, 0, 0.14) 0px 6px 10px 0px,
      rgba(0, 0, 0, 0.12) 0px 1px 18px 0px;
    cursor: pointer;
  }
</style>
