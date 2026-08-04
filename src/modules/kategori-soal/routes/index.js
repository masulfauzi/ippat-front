import KategoriSoalList from '../views/KategoriSoalList.vue'
import KategoriSoalCreate from '../views/KategoriSoalCreate.vue'
import KategoriSoalEdit from '../views/KategoriSoalEdit.vue'
import KategoriSoalDetail from '../views/KategoriSoalDetail.vue'

export const kategoriSoalRoutes = [
  {
    path: '/admin/kategori-soal',
    name: 'kategoriSoal.list',
    component: KategoriSoalList,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/kategori-soal/create',
    name: 'kategoriSoal.create',
    component: KategoriSoalCreate,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/kategori-soal/:id',
    name: 'kategoriSoal.detail',
    component: KategoriSoalDetail,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/kategori-soal/:id/edit',
    name: 'kategoriSoal.edit',
    component: KategoriSoalEdit,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]
