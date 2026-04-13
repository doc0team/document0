import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./globals.css";

const routes = [
  {
    path: "/",
    redirect: "/docs",
  },
  {
    path: "/docs/:slug(.*)*",
    component: () => import("./pages/DocPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

const app = createApp(App);
app.use(router);
app.mount("#app");
