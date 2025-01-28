<script setup>
import Layout from "./components/layout/Layout.vue";
</script>

<template>
  <div>
    <Layout v-if="$route.meta.layout !== false">
      <div class="pt-16"></div>
      <!-- without the padding, a part of the calendar is hidden behind the navbar -->
      <router-view />
    </Layout>

    <router-view v-else />
  </div>
</template>

<style scoped></style>
