<script lang="js">
import SideNavButton from "./SideNavButton.vue"
import DashboardIcon from "@/components/icons/DashboardIcon.vue"
import BurgerMenuIcon from "@/components/icons/BurgerMenuIcon.vue"
import CloseIcon from "@/components/icons/CloseIcon.vue"
import MapIcon from "@/components/icons/MapIcon.vue"
import BookingIcon from "@/components/icons/BookingIcon.vue"

const screenPixelBreakpoint = 768

export default {
  components: {
    SideNavButton,
    DashboardIcon,
    BurgerMenuIcon,
    CloseIcon,
    MapIcon,
    BookingIcon,
  },
  data() {
    return {
      isSidebarOpen: false,
      isLargeScreen: window.innerWidth >= screenPixelBreakpoint
    }
  },
  mounted() {
    this.isSidebarOpen = false
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    handleResize() {
      this.isLargeScreen = window.innerWidth >= screenPixelBreakpoint
    }
  },
  watch: {
    $route() {
      if (!this.isLargeScreen) {
        this.isSidebarOpen = false
      }
    }
  }
}
</script>

<template>
  <div>
    <button class="absolute left-[15px] top-[25px] z-50" v-if="!isLargeScreen" @click="toggleSidebar">
      <BurgerMenuIcon  fill="#0f172a"/>
    </button>

    <Transition name="slide-fade">
      <div
        v-if="isSidebarOpen || isLargeScreen"
        class="p-3 flex flex-col gap-3 w-[250px] min-h-screen h-full bg-slate-900 absolute md:relative z-50"
        :class="{ none: !isSidebarOpen && !isLargeScreen }"
      >
        <div class="px-3 w-full flex flex-row justify-end" v-if="!isLargeScreen">
          <button @click="toggleSidebar">
            <CloseIcon width="25" height="25" />
          </button>
        </div>
        <SideNavButton href="/dashboard" name="Dashboard">
            <DashboardIcon />
        </SideNavButton>
        <SideNavButton href="/map" name="Map">
            <MapIcon />
        </SideNavButton>
        <SideNavButton href="/booking" name="Bookings">
            <BookingIcon />
        </SideNavButton>
      </div>
    </Transition>
  </div>
</template>

<style lang="css" scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
