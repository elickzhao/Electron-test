/**
 * 这个打包必须用静态服务器
 */
const routers = [{
    path: '/',
    meta: {
        title: ''
    },
    component: resolve => require(['./views/index.vue'], resolve)
}];

export default routers;


/**
 *  以下可以打包成静态页
 */

// import Vue from 'vue';
// import Router from 'vue-router';

// Vue.use(Router);

// export default new Router({
//     routes: [{
//         path: '/',
//         meta: {
//             title: ''
//         },
//         component: resolve => require(['./views/index.vue'], resolve)
//     }]
// });