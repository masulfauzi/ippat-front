<template>
  <div class="bg-surface min-h-screen">
    <SideBar />
    <TopAppBar />

    <main class="lg:ml-64 min-h-screen">
      <div class="pt-24 pb-12 px-4 lg:px-8 max-w-4xl mx-auto">
        <div class="mb-8">
          <button
            @click="handleBack"
            class="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-4">
            <span class="material-symbols-outlined">arrow_back</span>
            Kembali
          </button>
          <h1 class="text-3xl font-bold text-slate-900">{{ nilaiData?.nama_ujian || 'Detail Jawaban Peserta' }}</h1>
          <p class="text-slate-500 mt-1">
            Rincian soal, jawaban peserta, dan kunci jawaban untuk
            <span class="font-semibold text-slate-700">{{ nilaiData?.nama_peserta || '-' }}</span>
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p class="mt-3 text-slate-600">Memuat detail jawaban...</p>
          </div>
        </div>

        <template v-else-if="!error">
          <!-- Ringkasan Nilai -->
          <div class="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ summary.benar }}</p>
                <p class="text-xs text-slate-500 uppercase font-semibold mt-1">Jawaban Benar</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ summary.salah }}</p>
                <p class="text-xs text-slate-500 uppercase font-semibold mt-1">Jawaban Salah</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ summary.tidakTerjawab }}</p>
                <p class="text-xs text-slate-500 uppercase font-semibold mt-1">Tidak Terjawab</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ nilaiData?.nilai ?? '-' }}</p>
                <p class="text-xs text-slate-500 uppercase font-semibold mt-1">Nilai Akhir</p>
              </div>
            </div>
            <div class="flex items-center justify-center mt-4">
              <span
                v-if="nilaiData?.status_kelulusan"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold"
                :class="isLulus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">
                  {{ isLulus ? 'check_circle' : 'cancel' }}
                </span>
                {{ isLulus ? 'Lulus' : 'Tidak Lulus' }}
              </span>
            </div>
          </div>

          <!-- Soal per Soal -->
          <div class="space-y-4">
            <div
              v-for="(item, index) in questions"
              :key="item.id"
              class="bg-white rounded-lg shadow border border-slate-200 p-6">
              <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <span class="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Soal {{ index + 1 }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="statusBadgeClass(item)">
                  {{ statusLabel(item) }}
                </span>
              </div>

              <div class="text-slate-800 prose prose-sm max-w-none mb-4" v-html="item.soal || '-'"></div>
              <img
                v-if="item.gambar_soal"
                :src="item.gambar_soal"
                alt="Gambar soal"
                class="mb-4 max-h-64 w-auto rounded-lg border border-slate-200 object-contain" />

              <!-- Opsi Jawaban -->
              <div class="space-y-2">
                <div
                  v-for="option in ['A', 'B', 'C', 'D', 'E']"
                  :key="option"
                  v-show="item[`opsi_${option.toLowerCase()}`]"
                  class="p-3 rounded-lg border-2 flex items-start gap-3"
                  :class="optionClass(item, option)">
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    :class="optionCircleClass(item, option)">
                    {{ option }}
                  </div>
                  <div class="flex-1">
                    <div class="text-slate-700 text-sm prose prose-sm max-w-none" v-html="item[`opsi_${option.toLowerCase()}`]"></div>
                  </div>
                  <span v-if="item.kunci === option" class="text-xs font-bold text-green-700 whitespace-nowrap">Kunci Jawaban</span>
                  <span v-else-if="item.jawaban === option" class="text-xs font-bold text-red-700 whitespace-nowrap">Jawaban Peserta</span>
                </div>
              </div>
            </div>

            <div v-if="questions.length === 0" class="bg-white rounded-lg shadow border border-slate-200 p-12 text-center">
              <span class="material-symbols-outlined text-6xl text-slate-300">quiz</span>
              <p class="text-slate-600 mt-4">Peserta belum menjawab soal apapun</p>
            </div>
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
import { soalService } from '@/services/soalService'

const route = useRoute()
const router = useRouter()

const nilaiData = ref(null)
const questions = ref([])
const isLoading = ref(false)
const error = ref(null)

const summary = computed(() => {
  const terjawab = questions.value.filter(item => !!item.jawaban).length
  const benar = questions.value.filter(item => item.is_benar === 1).length
  const salah = questions.value.filter(item => item.is_benar === 0).length
  const tidakTerjawab = questions.value.length - terjawab
  return { terjawab, tidakTerjawab, benar, salah }
})

const isLulus = computed(() => nilaiData.value?.status_kelulusan?.toUpperCase() === 'LULUS')

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
    ])

    nilaiData.value = nilaiRes.data
    const jawabanList = jawabanRes.data || []

    // gambar_soal tidak tersedia di response jawaban, ambil terpisah per soal
    const withGambar = await Promise.all(
      jawabanList.map(item =>
        soalService.getSoalById(item.id_soal)
          .then(res => ({ ...item, gambar_soal: res.data?.gambar_soal || null }))
          .catch(() => ({ ...item, gambar_soal: null }))
      )
    )

    questions.value = withGambar.sort((a, b) => (a.no_soal || a.no_urut || 0) - (b.no_soal || b.no_urut || 0))
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Gagal memuat detail jawaban peserta'
  } finally {
    isLoading.value = false
  }
})

const handleBack = () => {
  router.push({ name: 'nilai.list' })
}
</script>
