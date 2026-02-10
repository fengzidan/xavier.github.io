import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: () => import('@/views/MapView.vue'),
      meta: { title: '打卡中国' },
    },
    {
      path: '/province/:key',
      name: 'province-media',
      component: () => import('@/views/ProvinceMediaView.vue'),
      meta: { title: '省份打卡' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title ? `${to.meta.title} · 路过人间` : '路过人间 · 打卡中国'
  next()
})

export default router
