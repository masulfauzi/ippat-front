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
                        <p class="text-slate-500 mt-1">Rincian jawaban dan poin yang Anda peroleh tiap soal</p>
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
                    <!-- Soal per Soal -->
                    <div class="space-y-4 mb-8">
                        <div v-for="(item, index) in questions" :key="item.id"
                            class="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                            <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                <span class="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                    Soal {{ index + 1 }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-bold"
                                        :class="statusBadgeClass(item)">
                                        {{ statusLabel(item) }}
                                    </span>
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-bold"
                                        :class="item.poin > 0 ? 'bg-green-50 text-green-700' : item.poin < 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'">
                                        {{ item.poin > 0 ? '+' : '' }}{{ item.poin }} poin
                                    </span>
                                </div>
                            </div>

                            <div class="text-slate-800 prose prose-sm max-w-none mb-4" v-html="item.soal || '-'"></div>
                            <img
                                v-if="item.gambar_soal"
                                :src="item.gambar_soal"
                                alt="Gambar soal"
                                class="mb-4 max-h-64 w-auto rounded-xl border border-slate-100 object-contain" />

                            <!-- Opsi Jawaban -->
                            <div class="space-y-2">
                                <div
                                    v-for="option in ['A', 'B', 'C', 'D', 'E']"
                                    :key="option"
                                    v-show="item[`opsi_${option.toLowerCase()}`]"
                                    class="p-3 rounded-xl border-2 flex items-start gap-3"
                                    :class="optionClass(item, option)">
                                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                                        :class="optionCircleClass(item, option)">
                                        {{ option }}
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-slate-700 text-sm prose prose-sm max-w-none" v-html="item[`opsi_${option.toLowerCase()}`]"></div>
                                    </div>
                                    <span v-if="item.kunci === option" class="text-xs font-bold text-green-700 whitespace-nowrap">Kunci Jawaban</span>
                                    <span v-else-if="item.jawaban === option" class="text-xs font-bold text-red-700 whitespace-nowrap">Jawaban Anda</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total Nilai -->
                    <div class="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-sky-50 text-center">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nilai</p>
                        <p class="text-5xl font-black text-on-surface">{{ nilaiData?.nilai ?? '-' }}</p>
                    </div>
                </template>

            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { nilaiService } from '@/services/nilaiService'
import { jawabanService } from '@/services/jawabanService'
import { soalService } from '@/services/soalService'
import { useKategoriSoalStore } from '@/stores/kategoriSoal'

const route = useRoute()
const router = useRouter()
const kategoriSoalStore = useKategoriSoalStore()

const nilaiData = ref(null)
const questions = ref([])
const isLoading = ref(false)
const error = ref(null)

function statusLabel(item) {
    if (item.is_benar === 1) return 'Benar'
    if (item.is_benar === 0) return 'Salah'
    return 'Belum Dijawab'
}

function statusBadgeClass(item) {
    if (item.is_benar === 1) return 'bg-green-50 text-green-700'
    if (item.is_benar === 0) return 'bg-red-50 text-red-700'
    return 'bg-slate-100 text-slate-500'
}

function optionClass(item, option) {
    if (item.kunci === option) return 'border-green-400 bg-green-50/50'
    if (item.jawaban === option) return 'border-red-400 bg-red-50/50'
    return 'border-slate-200'
}

function optionCircleClass(item, option) {
    if (item.kunci === option) return 'border-green-500 bg-green-500 text-white'
    if (item.jawaban === option) return 'border-red-500 bg-red-500 text-white'
    return 'border-slate-300 text-slate-500'
}

onMounted(async () => {
    const idNilai = route.params.id
    isLoading.value = true
    error.value = null

    try {
        const [nilaiRes, jawabanRes] = await Promise.all([
            nilaiService.getNilaiById(idNilai),
            jawabanService.getSoalByNilaiId(idNilai),
            kategoriSoalStore.fetchKategoriSoalList(1, 100),
        ])

        nilaiData.value = nilaiRes.data
        const jawabanList = jawabanRes.data || []

        // Ambil id_kategori_soal & gambar_soal tiap soal (tidak tersedia di response jawaban)
        const withKategori = await Promise.all(
            jawabanList.map(item =>
                soalService.getSoalById(item.id_soal)
                    .then(res => ({
                        ...item,
                        id_kategori_soal: res.data?.id_kategori_soal || null,
                        gambar_soal: res.data?.gambar_soal || null,
                    }))
                    .catch(() => ({ ...item, id_kategori_soal: null, gambar_soal: null }))
            )
        )

        questions.value = withKategori
            .sort((a, b) => (a.no_soal || a.no_urut || 0) - (b.no_soal || b.no_urut || 0))
            .map(item => {
                const kategori = kategoriSoalStore.kategoriSoals.find(k => k.id === item.id_kategori_soal)
                let poin = 0
                if (kategori) {
                    if (item.is_benar === 1) poin = Number(kategori.benar) || 0
                    else if (item.is_benar === 0) poin = Number(kategori.salah) || 0
                }
                return { ...item, poin }
            })
    } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Gagal memuat detail hasil ujian'
    } finally {
        isLoading.value = false
    }
})
</script>
