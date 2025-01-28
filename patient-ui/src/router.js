import { createRouter, createWebHistory } from 'vue-router'

import { isAuthenticated } from "@/lib/auth/jwt.js"

import Home from "@/views/Home.vue"
import Map from "@/views/Map.vue"

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      layout: false
    },
  },
  {
    path: '/map',
    name: 'map',
    component: Map,
    meta: {
      layout: true 
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (!isAuthenticated() && to.name !== "home") {
    next({ name: "home" });
  } else if (isAuthenticated() && to.name !== "map") {
    next({ name: "map"})
  } else {
    next();
  }
});

export default router
