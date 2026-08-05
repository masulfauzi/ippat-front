import HasilUjianList from '../views/HasilUjianList.vue'
import HasilUjianDetail from '../views/HasilUjianDetail.vue'

export const hasilUjianRoutes = [
  {
    path: '/hasil-ujian',
    name: 'peserta.hasilUjian.list',
    component: HasilUjianList,
    meta: { requiresAuth: true },
  },
  {
    path: '/hasil-ujian/:id',
    name: 'peserta.hasilUjian.detail',
    component: HasilUjianDetail,
    meta: { requiresAuth: true },
  },
]
