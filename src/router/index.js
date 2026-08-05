import { createRouter, createWebHistory } from 'vue-router'
import { dashboardRoutes } from '../modules/dashboard/routes'
import { authRoutes } from '../modules/auth/routes'
import { bankSoalRoutes } from '../modules/bank-soal/routes'
import { mapelRoutes } from '../modules/mapel/routes'
import { kategoriSoalRoutes } from '../modules/kategori-soal/routes'
import { jurusanRoutes } from '../modules/jurusan/routes'
import { kelasRoutes } from '../modules/kelas/routes'
import { pesertaRoutes } from '../modules/peserta/routes'
import { jadwalRoutes } from '../modules/jadwal/routes'
import { jadwalPesertaRoutes } from '../modules/jadwal-peserta/routes'
import { hasilUjianRoutes } from '../modules/hasil-ujian/routes'
import { nilaiRoutes } from '../modules/nilai/routes'
import { setupAuthGuards } from './guards'

const routes = [
    { path: '/', redirect: '/login' },
    ...dashboardRoutes,
    ...bankSoalRoutes,
    ...mapelRoutes,
    ...kategoriSoalRoutes,
    ...jurusanRoutes,
    ...kelasRoutes,
    ...pesertaRoutes,
    ...jadwalRoutes,
    ...jadwalPesertaRoutes,
    ...hasilUjianRoutes,
    ...nilaiRoutes,
    ...authRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// Setup authentication guards
setupAuthGuards(router)

export default router
