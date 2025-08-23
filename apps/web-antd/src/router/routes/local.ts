import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '@vben/locales';

// eslint-disable-next-line no-empty-pattern
const {
  // vite inject-metadata 插件注入的全局变量
} = __VBEN_ADMIN_METADATA__ || {};

/**
 * 该文件放非后台返回的路由 比如个人中心 等需要跳转显示的页面
 * 也可以直接在菜单管理配置
 */
const localRoutes: RouteRecordStringComponent[] = [
  {
    component: '/_core/profile/index',
    meta: {
      icon: 'mingcute:profile-line',
      title: $t('ui.widgets.profile'),
      hideInMenu: true,
      requireHomeRedirect: true,
    },
    name: 'Profile',
    path: '/profile',
  },
];

/**
 * 这里放本地路由
 */
export const localMenuList: RouteRecordStringComponent[] = [
  {
    component: 'BasicLayout',
    meta: {
      order: -1,
      title: 'page.dashboard.title',
      // 不使用基础布局（仅在顶级生效）
      noBasicLayout: true,
    },
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          title: 'page.dashboard.analytics',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },

      {
        name: 'AutomaticScheduling',
        path: '/automatic-scheduling',
        component: '/saas-multiple-branches/index',
        meta: {
          title: '自动排班',
        },
      },
      {
        path: '/schedule/history',
        name: 'ScheduleHistory',
        component: '/saas-multiple-branches/ScheduleHistory.vue',
        meta: { title: '排班历史' },
      },
    ],
  },

  ...localRoutes,
];
