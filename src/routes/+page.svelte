<script lang="ts">
  import { onMount } from "svelte";

 
  let selectedTab: string = "overview";
  let lastKnownScrollPosition = 0;

	onMount(() => {
    document.addEventListener("scroll", (event) => {
      let scrollDown = true;
      if (lastKnownScrollPosition > window.scrollY) scrollDown = false;

      if (scrollDown) {
        if (isInViewport("privacy"))
          selectedTab = "privacy";
        else if (isInViewport("partners"))
          selectedTab = "partners";
        else if (isInViewport("pricing"))
          selectedTab = "pricing";
        else if (isInViewport("mission"))
          selectedTab = "mission";
        else if (isInViewport("overview"))
          selectedTab = "overview";
      }
      else {
        if (isInViewport("overview"))
          selectedTab = "overview";
        else if (isInViewport("mission"))
          selectedTab = "mission";
        else if (isInViewport("pricing"))
          selectedTab = "pricing";
        else if (isInViewport("partners"))
          selectedTab = "partners";
        else if (isInViewport("privacy"))
          selectedTab = "privacy";
      }

      lastKnownScrollPosition = window.scrollY;
    });
  });

  function scrollToDiv(div: string) {
    selectedTab = div;
    const element = document.querySelector('#' + div);
    element?.scrollIntoView({
      behavior: 'smooth', // smooth scroll
      block: 'center' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
    })
    // if (element) {
    //   const rect = element.getBoundingClientRect() // get rects(width, height, top, etc)
    //   const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    //   window.scroll({
    //     top: rect.top + rect.height / 2 - viewHeight / 2,
    //     behavior: 'smooth'
    //   });
    // }
  }

  function isInViewport(elementId: string): boolean {
    const element = document.querySelector('#' + elementId);
    if (element) {
      var rect = element.getBoundingClientRect();
      var html = document.documentElement;
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || html.clientHeight) &&
        rect.right <= (window.innerWidth || html.clientWidth)
      );
    }
    else 
      return false;
  }

</script>


<div class="header_tabs">
</div>

<div class="header_tabs_box">
  <button on:click={() => {scrollToDiv("overview");}} class:header_tab_button_selected={selectedTab === "overview"} class="header_tab_button">
    Overview
  </button>
  <button on:click={() => {scrollToDiv("mission");}} class:header_tab_button_selected={selectedTab === "mission"} class="header_tab_button">
    Our mission
  </button>
  <button on:click={() => {scrollToDiv("pricing");}} class:header_tab_button_selected={selectedTab === "pricing"} class="header_tab_button">
    Pricing
  </button>
  <button on:click={() => {scrollToDiv("partners");}} class:header_tab_button_selected={selectedTab === "partners"} class="header_tab_button">
    Partners
  </button>
  <button on:click={() => {scrollToDiv("privacy");}} class:header_tab_button_selected={selectedTab === "privacy"} class="header_tab_button">
    Privacy
  </button>
</div>

<div class="background_left">
  <svg class="g-h-swoop-image" role="presentation" width="289" height="208" viewBox="0 0 315 222" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_228_2286)"><path d="M312.433 -0.753784C312.912 1.10786 313.214 3.26622 313.397 5.75039C315.766 43.4191 313.397 80.2612 297.105 114.978C266.832 180.101 212.21 210.124 143.637 218.95C94.2485 225.333 46.4444 217.558 0.000188589 201.267C-0.27401 201.17 -0.548162 201.074 -0.822266 200.977" stroke="#4285F4" stroke-width="2" stroke-linejoin="round"></path></g></svg>
</div>
<div class="background_right">
  <svg class="g-h-swoop-image" role="presentation" width="192" height="618" viewBox="0 0 192 618" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M33.2884 -0.999986C11.8162 21.3558 1.00001 48.7302 1.00001 77.9528C1.00003 229.64 178.083 265.688 178.083 415.406C178.083 477.349 135.321 488.804 135.321 550.137C135.321 583.574 163.684 611.749 193 617" stroke="#FBBC04" stroke-width="2" stroke-linejoin="round"></path></svg>
</div>

<div class="landing_main_panel">
    <div id="overview" class="landing_heading">
        Let's achieve more with our data & AI assets
    </div>
    <div class="landing_content">
        <div>
          Apigee Marketplace is a specialized online hub designed to connect data providers and consumers within various industrial sectors. Its focus is on facilitating the exchange of highly valuable industrial datasets, empowering businesses to optimize operations, accelerate innovation, and gain a competitive edge.
        </div>
    </div>
    <div class="landing_heading_small">
      <span>
        <a href="/sign-in" class="rounded_button_filled">Sign In</a>
        <a href="/register" class="rounded_button_outlined">Register</a>
      </span>
    </div>
    <div class="landing_content_gray">
      <div class="landing_sub_heading">
        Our mission is data & AI collaboration at scale
      </div>
      <div class="landing_content_divided">
          <div class="landing_content_half">
            <img class="landing_content_half_image" alt="frankfurt" src="/network.jpg" />
          </div>
          <div id="mission" class="landing_content_half_text">
            Apigee Marketplace is a specialized online hub designed to connect data providers and consumers within and across industries. Its focus is on facilitating the exchange of highly valuable industrial datasets, empowering businesses to optimize operations, accelerate innovation, and gain a competitive edge.
          </div>
      </div>
    </div>
    <div class="landing_content_white">
      <div class="landing_sub_heading">
        Transparent & simple pricing for first, second and third-party data
      </div>
      <div class="landing_content_divided">
        <div id="pricing" class="landing_content_half_text">
          Our data marketplace puts simplicity at the forefront. Pricing structures are clear and concise, with no hidden fees or complicated calculations.  You'll find tiered subscription options based on your needs, or the ability to pay-as-you-go for individual datasets.
        </div>
        <div class="landing_content_half">
          <img class="landing_content_half_image" alt="frankfurt" src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        </div>
      </div>
    </div>
    <div class="landing_content_gray">
      <div class="landing_sub_heading">
        Verified & curated data from a network of high-quality partners
      </div>
      <div class="landing_content_divided">
          <div class="landing_content_half">
            <img class="landing_content_half_image" alt="frankfurt" src="https://images.unsplash.com/photo-1540646794357-6cbbd6f3501e?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
          </div>
          <div id="partners" class="landing_content_half_text">
            Data Marketplace is a specialized online hub designed to connect data providers and consumers within various industrial sectors. Its focus is on facilitating the exchange of highly valuable industrial datasets, empowering businesses to optimize operations, accelerate innovation, and gain a competitive edge.
          </div>
      </div>
    </div>

    <div class="landing_content_white">
      <div class="landing_sub_heading">
        Security & privacy built-in
      </div>
      <div class="landing_content_divided">
        <div id="privacy" class="landing_content_half_text">
          Apigee Marketplace prioritizes security by providing a multi-layered approach to protect customer data and infrastructure. Built-in safeguards, like encryption and access control, are foundational to the platform. The global network, equipped with custom-designed hardware and a hardened operating system, ensures high availability and resilience against attacks.
        </div>
        <div class="landing_content_half">
          <img class="landing_content_half_image" alt="frankfurt" src="/security.jpg" />
        </div>
      </div>
    </div>

    <div class="footer"></div>
</div>

<style>

.background_left {
  position: absolute;
  top: 72px;
}

.background_right {
  position: absolute;
  top: 72px;
  right: 0px;
}

.landing_main_panel {
  background: var(--primary-background-color);
  left: 0px;
  width: 100%;
  bottom: 0px;
  padding-top: 104px;
  text-align: center;
}

.landing_heading {
  margin: auto;
  margin-top: 75px;
  width: 60vw;
  font-size: 72px;
  font-style: normal;
}

.landing_content_divided {
  width: 60vw;
  margin: auto;
  display: flex;
}

.landing_content {
  margin: auto;
  margin-top: 46px;
  color: #555;
  line-height: 24px;
  width: 60vw;
}

.landing_content_half {
  margin: auto;
  margin-top: 46px;
  color: #555;
  line-height: 24px;
  width: 50%;
  text-align: center;
}

.landing_content_half_image {
  width: 80%;
  border-radius: 45px;
}

.landing_content_half_text {
  margin: auto;
  margin-top: 98px;
  color: #555;
  line-height: 24px;
  width: 50%;
  text-align: left;
}

.landing_heading_small {
  margin: auto;
  margin-top: 35px;
  width: 60vw;
}

.landing_content_gray {
  background-color: rgb(248, 249, 250);
  margin-top: 74px;
  min-height: 400px;
  /* margin-bottom: 400px; */
  padding-bottom: 110px;
}

.landing_content_white {
  background-color: rgb(255, 255, 255);
  /* margin-top: 74px; */
  min-height: 400px;
  /* margin-bottom: 400px; */
  /* padding-bottom: 110px; */
}

.landing_sub_heading {
  margin: auto;
  padding-top: 124px;
  width: 50vw;
  font-size: 48px;
  font-style: normal;
  padding-bottom: 22px;
}

.footer {
  height: 200px;
  width: 100%;
}
</style>
