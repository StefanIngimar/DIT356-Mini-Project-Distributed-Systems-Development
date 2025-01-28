import { createMemoryHistory, createRouter } from "vue-router";

import { isAuthenticated } from "@/lib/auth/jwt.js";

import ClinicsLayout from "@/components/layout/ClinicsLayout.vue";
import DentistsLayout from "@/components/layout/DentistsLayout.vue";

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";

import DentistsFormView from "@/views/dentist/DentistsFormView.vue";

import ClinicsView from "@/views/clinic/ClinicsView.vue";
import ClinicsFormView from "@/views/clinic/ClinicsFormView.vue";

const routes = [
    { path: "/", name: "home", component: HomeView, meta: { withLayout: true } },
    { path: "/login", name: "login", component: LoginView, meta: { withLayout: false }},
    {
        path: "/dentists",
        name: "dentists",
        component: DentistsLayout,
        children: [{ path: "new", component: DentistsFormView }],
        meta: { withLayout: true }
    },
    {
        path: "/clinics",
        name: "clinics",
        component: ClinicsLayout,
        children: [
            { path: "existing", component: ClinicsView },
            { path: "new", component: ClinicsFormView },
        ],
        meta: { withLayout: true }
    },
];

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

router.beforeEach((to, _from, next) => {
    if (!isAuthenticated() && to.name !== "login") { 
        next({ name: "login" });
    } else if (isAuthenticated() && to.name === "login") {
        next({ name: "/" });
    } else {
        next();
    }
});
