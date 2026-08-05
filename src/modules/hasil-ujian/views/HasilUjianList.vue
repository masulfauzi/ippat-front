<template>
    <div class="bg-surface min-h-screen">
        <SideBar />
        <TopAppBar />

        <main class="lg:ml-64 mt-16 min-h-screen">
            <div class="pt-8 pb-12 px-4 lg:px-8 max-w-5xl mx-auto">

                <!-- Header -->
                <div class="mb-8">
                    <h2 class="font-h1 text-h2 text-slate-900">Hasil Ujian</h2>
                    <p class="text-slate-500 mt-1">Daftar seluruh ujian yang telah Anda selesaikan beserta nilai akhirnya</p>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center py-20">
                    <div class="text-center">
                        <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                        <p class="mt-3 text-slate-600">Memuat hasil ujian...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                    <div class="flex items-start gap-4">
                        <span class="material-symbols-outlined text-5xl text-red-500 shrink-0">error</span>
                        <div class="flex-1">
                            <h3 class="font-h3 text-h3 text-slate-800 mb-2">Gagal Memuat Hasil Ujian</h3>
                            <p class="text-slate-500 text-sm">{{ error }}</p>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <!-- Empty State -->
                    <div v-if="hasilUjian.length === 0"
                        class="bg-white rounded-3xl p-12 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center text-center">
                        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">fact_check</span>
                        <h3 class="font-h3 text-h3 text-slate-500 mb-2">Belum ada hasil ujian</h3>
                        <p class="text-slate-400 text-sm">Hasil akan muncul di sini setelah Anda menyelesaikan sebuah ujian.</p>
                    </div>

                    <!-- Result List -->
                    <div v-else class="grid grid-cols-1 gap-6">
                        <div v-for="item in hasilUjian" :key="item.id"
                            class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">

                            <!-- Left color bar -->
                            <div class="absolute top-0 left-0 w-2 h-full bg-primary-container"></div>

                            <!-- Icon -->
                            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50 text-primary">
                                <span class="material-symbols-outlined text-3xl">quiz</span>
                            </div>

                            <!-- Content -->
                            <div class="flex-1">
                                <h3 class="font-h3 text-h3 text-slate-800">{{ item.nama_ujian || '-' }}</h3>
                                <div class="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                                    <span class="material-symbols-outlined text-[18px]">event_available</span>
                                    {{ formatDate(item.wkt_selesai) }}
                                </div>
                            </div>

                            <!-- Nilai -->
                            <div class="shrink-0 text-center px-6 py-3 bg-slate-50 rounded-2xl">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nilai</p>
                                <p class="text-2xl font-black text-on-surface">{{ item.nilai ?? '-' }}</p>
                            </div>

                            <!-- Action Button -->
                            <div class="shrink-0 w-full md:w-auto">
                                <button
                                    @click="handleView(item.id)"
                                    class="w-full md:w-auto bg-primary-container hover:bg-primary text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Lihat Detail
                                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div v-if="hasilUjian.length > 0 && totalPages > 1" class="flex items-center justify-between mt-6">
                        <p class="text-slate-600 text-sm">
                            Menampilkan {{ (currentPage - 1) * pageSize + 1 }} hingga
                            {{ Math.min(currentPage * pageSize, totalItems) }} dari {{ totalItems }} hasil
                        </p>
                        <div class="flex gap-2">
                            <button
                                @click="handlePageChange(currentPage - 1)"
                                :disabled="currentPage === 1"
                                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Sebelumnya
                            </button>
                            <button
                                @click="handlePageChange(currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Berikutnya
                            </button>
                        </div>
                    </div>
                </template>

            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { useAuthStore } from '@/stores/auth'
import { nilaiService } from '@/services/nilaiService'

const router = useRouter()
const authStore = useAuthStore()

const allHasilUjian = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// Hanya tampilkan attempt yang sudah selesai dikerjakan
const hasilUjian = computed(() => allHasilUjian.value.filter(item => !!item.wkt_selesai))
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

function formatDate(dateString) {
    if (!dateString) return '-'
    try {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return dateString
    }
}

async function fetchHasilUjian(page = 1) {
    const idPeserta = authStore.currentUser?.user_id
    if (!idPeserta) {
        error.value = 'Data peserta tidak ditemukan'
        return
    }

    isLoading.value = true
    error.value = null

    try {
        const response = await nilaiService.getNilaiByPeserta(idPeserta, page, pageSize.value)
        allHasilUjian.value = response.data?.data || []
        totalItems.value = response.data?.total || 0
        currentPage.value = page
    } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Gagal memuat hasil ujian'
    } finally {
        isLoading.value = false
    }
}

function handleView(id) {
    router.push({ name: 'peserta.hasilUjian.detail', params: { id } })
}

function handlePageChange(page) {
    if (page >= 1 && page <= totalPages.value) {
        fetchHasilUjian(page)
    }
}

onMounted(() => {
    fetchHasilUjian(1)
})
</script>
