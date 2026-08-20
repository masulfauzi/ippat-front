<template>
    <div class="bg-surface min-h-screen">
        <SideBar />
        <TopAppBar />

        <main class="lg:ml-64 mt-16 min-h-screen">
            <div class="pt-8 pb-12 px-4 lg:px-8 max-w-4xl mx-auto">

                <!-- Header -->
                <div class="flex items-center gap-3 mb-8">
                    <button
                        @click="router.push({ name: 'peserta.hasilUjian.list' })"
                        class="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 class="font-h1 text-h2 text-slate-900">{{ nilaiData?.nama_ujian || 'Detail Hasil Ujian' }}</h2>
                        <p class="text-slate-500 mt-1">Ringkasan jawaban dan poin akhir yang Anda peroleh</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center py-20">
                    <div class="text-center">
                        <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                        <p class="mt-3 text-slate-600">Memuat detail hasil ujian...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                    <div class="flex items-start gap-4">
                        <span class="material-symbols-outlined text-5xl text-red-500 shrink-0">error</span>
                        <div class="flex-1">
                            <h3 class="font-h3 text-h3 text-slate-800 mb-2">Gagal Memuat Detail Hasil Ujian</h3>
                            <p class="text-slate-500 text-sm">{{ error }}</p>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <!-- Ringkasan Jawaban -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 text-center">
                            <div class="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center bg-sky-50 text-sky-600 mb-3">
                                <span class="material-symbols-outlined">edit_note</span>
                            </div>
                            <p class="text-3xl font-black text-on-surface">{{ summary.terjawab }}</p>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Terjawab</p>
                        </div>
                        <div class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 text-center">
                            <div class="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center bg-slate-100 text-slate-500 mb-3">
                                <span class="material-symbols-outlined">help_outline</span>
                            </div>
                            <p class="text-3xl font-black text-on-surface">{{ summary.tidakTerjawab }}</p>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tidak Terjawab</p>
                        </div>
                        <div class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 text-center">
                            <div class="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center bg-green-50 text-green-600 mb-3">
                                <span class="material-symbols-outlined">check_circle</span>
                            </div>
                            <p class="text-3xl font-black text-on-surface">{{ summary.benar }}</p>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jawaban Benar</p>
                        </div>
                        <div class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 text-center">
                            <div class="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center bg-red-50 text-red-600 mb-3">
                                <span class="material-symbols-outlined">cancel</span>
                            </div>
                            <p class="text-3xl font-black text-on-surface">{{ summary.salah }}</p>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jawaban Salah</p>
                        </div>
                    </div>

                    <!-- Poin Akhir -->
                    <div class="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-sky-50 text-center">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Poin Akhir</p>
                        <p class="text-5xl font-black text-on-surface">{{ nilaiData?.nilai ?? '-' }}</p>
                        <span
                            v-if="nilaiData?.status_kelulusan"
                            class="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full text-sm font-bold"
                            :class="isLulus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                            <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">
                                {{ isLulus ? 'check_circle' : 'cancel' }}
                            </span>
                            {{ isLulus ? 'Lulus' : 'Tidak Lulus' }}
                        </span>
                    </div>
                </template>

            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { nilaiService } from '@/services/nilaiService'
import { jawabanService } from '@/services/jawabanService'

const route = useRoute()
const router = useRouter()

const nilaiData = ref(null)
const jawabanList = ref([])
const isLoading = ref(false)
const error = ref(null)

const summary = computed(() => {
    const terjawab = jawabanList.value.filter(item => !!item.jawaban).length
    const benar = jawabanList.value.filter(item => item.is_benar === 1).length
    const salah = jawabanList.value.filter(item => item.is_benar === 0).length
    const tidakTerjawab = jawabanList.value.length - terjawab
    return { terjawab, tidakTerjawab, benar, salah }
})

const isLulus = computed(() => nilaiData.value?.status_kelulusan?.toUpperCase() === 'LULUS')

onMounted(async () => {
    const idNilai = route.params.id
    isLoading.value = true
    error.value = null

    try {
        const [nilaiRes, jawabanRes] = await Promise.all([
            nilaiService.getNilaiById(idNilai),
            jawabanService.getSoalByNilaiId(idNilai),
        ])

        nilaiData.value = nilaiRes.data
        jawabanList.value = jawabanRes.data || []
    } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Gagal memuat detail hasil ujian'
    } finally {
        isLoading.value = false
    }
})
</script>
