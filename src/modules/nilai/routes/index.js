import NilaiList from '../views/NilaiList.vue'
import NilaiJawabanDetail from '../views/NilaiJawabanDetail.vue'

export const nilaiRoutes = [
  {
    path: '/admin/nilai',
    name: 'nilai.list',
    component: NilaiList,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/nilai/:id/jawaban',
    name: 'nilai.jawabanDetail',
    component: NilaiJawabanDetail,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]
