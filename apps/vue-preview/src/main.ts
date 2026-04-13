import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./globals.css";

const routes = [
  {
    path: "/preview/:namespace/:component",
    component: () => import("./PreviewShell.vue"),
    props: true,
  },
  {
    path: "/",
    component: () => import("./PreviewIndex.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
