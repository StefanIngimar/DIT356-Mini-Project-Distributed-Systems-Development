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
  <li
    :class="[
      'list-none border-b-2',
      {
        'border-blue-600 text-blue-600': route.path === href,
        'border-transparent hover:border-gray-300 hover:text-gray-600':
          route.path !== href,
      },
    ]"
  >
    <router-link :to="href" class="inline-block px-2 py-2">
      {{ name }}
    </router-link>
  </li>
</template>
