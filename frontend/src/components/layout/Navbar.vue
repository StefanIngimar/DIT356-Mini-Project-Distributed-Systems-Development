<template>
  <nav class="bg-gray-800 p-4">
    <ul class="flex space-x-4">
      <li v-for="r in activeRoutes" :key="r.name">
        <button
          @click="navigate(r.path)"
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
            r.current
              ? 'bg-gray-900 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white',
          ]"
        >
          {{ r.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { routes } from "@/router";

const router = useRouter();
function navigate(href) {
  router.push(href);
}

const activeRoutes = routes.filter(route => route.meta.inNav === true)
</script>
