import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/model'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '展厅' },
            children:[
                {
                    path: '/model',
                    component: resolve => require(['../components/page/Model.vue'], resolve),
                    meta: { title: '展厅' }
                },
                {
                    path: '/userContral',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve),
                    meta: { title: '用户列表' }
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '/register',
            component: resolve => require(['../components/page/Register.vue'], resolve)
        }
    ]
})
