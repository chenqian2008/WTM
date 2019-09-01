import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import store from "@/store/index";
import userStore from "@/store/common/user";
import cache from "@/util/cache";
import config from "@/config/index";
Vue.use(VueRouter);

// 等待接口
export default function createRouter() {
    const uData = cache.getStorage(config.tokenKey, true);
    // 接口路由
    return store
        .dispatch("loginCheckLogin", { ID: uData.Id })
        .then(res => {
            userStore.setAction(res.Attributes.Actions);
            const treeMenus = userStore.setTreeMenus(res.Attributes.Menus);
            const menus = userStore.setParallelMenus(res.Attributes.Menus);
            // 数据结构不同，此处重新维护
            store.commit("setMenuItems", treeMenus);
            const routers = new VueRouter({
                mode: "hash", // 'history',
                routes: menus
            });
            return routers;
        })
        .catch(error => {
            // 本地调试 可以注释
            location.href = "/login.html";
        });
}
