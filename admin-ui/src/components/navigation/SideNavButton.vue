<script lang="js">
import { useRoute } from 'vue-router'

export default {
    data() {
        return {
            route: useRoute()
        }
    },
    props: {
        href: {
            type: String
        },
        name: {
            type: String
        }
    }
}
</script>

<template>
  <div class="rounded hover:bg-neutral-700 transition-colors ease-in">
    <router-link
      :to="href"
      class="px-3 py-2 flex flex-row gap-3 items-center text-white rounded"
      :class="[{ 'bg-neutral-800': route.path === href }]"
    >
      <slot></slot>
      <p class="text-sm font-semibold">{{ name }}</p>
    </router-link>
  </div>
</template>