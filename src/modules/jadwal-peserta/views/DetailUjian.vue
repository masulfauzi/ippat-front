<template>
    <div class="bg-surface min-h-screen">
        <SideBar />
        <TopAppBar />

        <main class="lg:ml-64 h-screen pt-20 pb-4 px-8 flex flex-col overflow-hidden">
            <div class="max-w-4xl w-full mx-auto flex-1 min-h-0 flex flex-col">

                <!-- Loading State -->
                <div v-if="isLoading" class="flex-1 flex justify-center items-center">
                    <div class="text-center">
                        <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                        <p class="mt-3 text-slate-600">Memuat detail ujian...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                    <div class="flex items-start gap-4">
                        <span class="material-symbols-outlined text-5xl text-red-500 shrink-0">error</span>
                        <div class="flex-1">
                            <h3 class="font-h3 text-h3 text-slate-800 mb-2">Gagal Memuat Detail Ujian</h3>
                            <p class="text-slate-500 text-sm mb-6">{{ error }}</p>
                            <button @click="router.back()" class="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <template v-else>
                    <!-- Header Section -->
                    <section class="flex items-start justify-between gap-4 mb-4 shrink-0">
                        <div>
                            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider mb-2">
                                Ujian
                            </div>
                            <h1 class="font-h2 text-h2 text-on-surface leading-tight">{{ detail?.nama_bank_soal || '-' }}</h1>
                            <p class="text-slate-500 mt-1 font-body-md text-sm flex items-center gap-2 flex-wrap">
                                <span>{{ detail?.nama_ujian || '-' }}</span>
                                <span class="text-slate-300">•</span>
                                <span class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                                    {{ formatDateTime(detail?.wkt_mulai) }}, {{ formatJam(detail?.wkt_mulai) }} - {{ formatJam(detail?.wkt_selesai) }} WIB
                                </span>
                            </p>
                        </div>
                        <button @click="router.back()" class="shrink-0 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </section>

                    <!-- Compact Stat Strip -->
                    <div class="grid grid-cols-3 gap-3 mb-4 shrink-0">
                        <div class="bg-white p-3 rounded-2xl border border-sky-50 flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-[20px]">timer</span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Durasi</p>
                                <p class="font-h3 text-sm font-bold text-on-surface truncate">{{ detail?.durasi ? detail.durasi + ' menit' : '-' }}</p>
                            </div>
                        </div>
                        <div class="bg-white p-3 rounded-2xl border border-sky-50 flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-[20px]">checklist</span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tipe Ujian</p>
                                <p class="font-h3 text-sm font-bold text-on-surface truncate">Pilihan Ganda</p>
                            </div>
                        </div>
                        <div class="bg-white p-3 rounded-2xl border border-sky-50 flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
                                <span class="w-2.5 h-2.5 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(78,222,163,0.6)]"></span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Terbuka Hingga</p>
                                <p class="font-h3 text-sm font-bold text-on-surface truncate">{{ formatJam(detail?.wkt_selesai) }} WIB</p>
                            </div>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div class="flex-1 min-h-0 bg-white rounded-2xl p-5 border border-sky-50 overflow-y-auto">
                        <h3 class="font-h3 text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sky-500 text-[18px]">gavel</span>
                            Instruksi Pengerjaan
                        </h3>
                        <ul class="space-y-2">
                            <li class="flex gap-2.5 text-sm text-slate-600">
                                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-[11px] mt-0.5">1</span>
                                Pastikan koneksi internet Anda stabil sebelum menekan tombol "Mulai Ujian".
                            </li>
                            <li class="flex gap-2.5 text-sm text-slate-600">
                                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-[11px] mt-0.5">2</span>
                                Dilarang keras membuka tab/aplikasi lain selama ujian berlangsung — sistem akan mendeteksi kecurangan.
                            </li>
                            <li class="flex gap-2.5 text-sm text-slate-600">
                                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-[11px] mt-0.5">3</span>
                                Waktu akan terus berjalan meskipun Anda keluar dari halaman ujian atau menutup browser.
                            </li>
                            <li class="flex gap-2.5 text-sm text-slate-600">
                                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-[11px] mt-0.5">4</span>
                                Klik tombol "Simpan & Selesai" jika sudah menyelesaikan seluruh soal sebelum waktu habis.
                            </li>
                            <li class="flex gap-2.5 text-sm text-amber-700 bg-amber-50 -mx-1 px-1 py-1 rounded-lg">
                                <span class="material-symbols-outlined text-[16px] shrink-0" style="font-variation-settings: 'FILL' 1;">warning</span>
                                Ujian ini hanya dapat dilakukan satu kali.
                            </li>
                        </ul>
                    </div>

                    <!-- Error Notification -->
                    <div v-if="startError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shrink-0">
                        <span class="material-symbols-outlined text-red-500 shrink-0">error</span>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-red-800">Gagal Memulai Ujian</p>
                            <p class="text-sm text-red-600 mt-1">{{ startError }}</p>
                        </div>
                        <button @click="startError = null" class="text-red-400 hover:text-red-600">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>

                    <!-- CTA Section -->
                    <div class="mt-4 pt-4 border-t border-slate-200 flex justify-end shrink-0">
                        <button
                            @click="mulaiSekarang"
                            :disabled="isStarting"
                            class="group relative inline-flex items-center justify-center px-8 py-3.5 bg-primary-container text-white font-h3 text-base rounded-2xl overflow-hidden transition-all hover:shadow-xl active:scale-95 duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                            <span class="relative z-10 flex items-center gap-2">
                                {{ isStarting ? 'Memulai...' : 'Mulai Ujian Sekarang' }}
                                <span v-if="!isStarting" class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                <span v-else class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            </span>
                            <div class="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </template>

            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { useDialog } from '@/composables/useDialog'
import { jadwalService } from '@/services/jadwalService'
import { nilaiService } from '@/services/nilaiService'

const route = useRoute()
const router = useRouter()
const { $alert } = useDialog()

const jadwal = history.state?.jadwal || null
const detail = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isStarting = ref(false)
const startError = ref(null)

function formatJam(dt) {
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
}

function formatDateTime(dt) {
    if (!dt) return ''
    return new Date(dt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

async function mulaiSekarang() {
    if (isStarting.value) return
    isStarting.value = true
    startError.value = null

    try {
        const response = await nilaiService.mulaiUjian(route.params.id)
        const nilaiData = response.data?.data
        // detail.value adalah Vue Proxy — harus di-convert ke plain object dulu
        // sebelum dikirim via history.state (structured clone tidak bisa handle Proxy)
        const jadwalPlain = JSON.parse(JSON.stringify(toRaw(detail.value) ?? {}))

        router.push({
            name: 'peserta.ujian.pengerjaan',
            params: { id: route.params.id },
            state: { nilai: nilaiData, jadwal: jadwalPlain },
        })
    } catch (err) {
        const status = err.response?.status
        const message = err.response?.data?.message

        if (status === 400 && message === 'Ujian sudah pernah dilakukan') {
            await $alert('Ujian sudah pernah dilakukan. Anda akan diarahkan ke dashboard.', { title: 'Perhatian', type: 'warning' })
            await router.push({ name: 'dashboard.home' })
            return
        }

        if (status === 401) {
            startError.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
            setTimeout(() => router.push({ name: 'login' }), 1500)
            return
        }

        startError.value = message || 'Gagal memulai ujian. Coba lagi.'
    } finally {
        isStarting.value = false
    }
}

onMounted(async () => {
    isLoading.value = true
    error.value = null
    try {
        const response = await jadwalService.getJadwalById(route.params.id)
        detail.value = response.data
    } catch (err) {
        error.value = err.response?.data?.message || 'Gagal memuat detail ujian'
    } finally {
        isLoading.value = false
    }
})
</script>
