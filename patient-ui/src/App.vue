<script setup>
import Layout from "@/components/layout/Layout.vue";
</script>

<template>
  <div>
    <Layout v-if="$route.meta.layout !== false">
      <router-view />
    </Layout>

    <router-view v-else />
  </div>
</template>
