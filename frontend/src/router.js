import { createRouter, createWebHistory } from "vue-router";

import { isAuthenticated } from "./lib/auth/jwt";

import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Bookings from "./views/Bookings.vue";
import Appointments from "./views/Appointment.vue";

export const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      layout: true,
      inNav: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      layout: false,
      inNav: false,
    },
  },
  {
    path: "/bookings",
    name: "Bookings",
    component: Bookings,
    meta: {
      layout: true,
      inNav: true,
    },
  },
  {
    path: "/appointment",
    name: "Appointments",
    component: Appointments,
    meta: {
      layout: true,
      inNav: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (!isAuthenticated() && to.name !== "login") {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
