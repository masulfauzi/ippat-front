<template>
  <div class="bg-surface min-h-screen">
    <!-- Sidebar -->
    <SideBar />

    <!-- Top App Bar -->
    <TopAppBar />

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
      <div class="pt-24 pb-12 px-4 lg:px-8 max-w-7xl mx-auto">
        <!-- Page Title -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900">Manajemen Nilai</h1>
          <p class="text-slate-500 mt-1">Lihat dan ekspor nilai peserta ujian</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ errorMsg }}
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Pilih Jadwal</label>
              <select
                v-model="selectedJadwalId"
                @change="loadNilai()"
                :disabled="isLoadingJadwal"
                class="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">-- Pilih Jadwal --</option>
                <option v-for="jadwal in jadwalList" :key="jadwal.id" :value="jadwal.id">
                  {{ jadwal.nama_ujian }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingNilai" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p class="mt-3 text-slate-600">Memuat data nilai...</p>
          </div>
        </div>

        <!-- Export Button & Data Section -->
        <div v-else-if="selectedJadwalId">
          <!-- Export Button -->
          <div class="mb-6 flex gap-3">
            <button
              v-if="nilaiList.length > 0"
              @click="handleExport"
              :disabled="isExporting"
              class="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              <span class="material-symbols-outlined">download</span>
              {{ isExporting ? 'Mengunduh...' : 'Export Nilai' }}
            </button>
          </div>

          <!-- Table Section -->
          <div class="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <div v-if="nilaiList.length === 0" class="text-center py-12">
              <span class="material-symbols-outlined text-6xl text-slate-300">inbox</span>
              <p class="text-slate-600 mt-4">Belum ada data nilai untuk jadwal ini</p>
            </div>

            <table v-else class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No.</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama Peserta</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nilai</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Waktu Mulai</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Waktu Selesai</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="(nilai, index) in nilaiList" :key="nilai.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-slate-900 font-medium">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td class="px-6 py-4 text-slate-900">{{ nilai.nama_peserta }}</td>
                  <td class="px-6 py-4 text-slate-900 font-medium">{{ nilai.nilai }}</td>
                  <td class="px-6 py-4 text-slate-600 text-sm">{{ formatDateTime(nilai.wkt_mulai) }}</td>
                  <td class="px-6 py-4 text-slate-600 text-sm">{{ formatDateTime(nilai.wkt_selesai) }}</td>
                  <td class="px-6 py-4 text-center">
                    <span
                      :class="isLulus(nilai.status_kelulusan) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">
                        {{ isLulus(nilai.status_kelulusan) ? 'check_circle' : 'cancel' }}
                      </span>
                      {{ formatStatusKelulusan(nilai.status_kelulusan) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openTambahWaktuModal(nilai)"
                        :disabled="!nilai.wkt_mulai"
                        :title="!nilai.wkt_mulai ? 'Peserta belum memulai ujian' : 'Tambah waktu pengerjaan'"
                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <span class="material-symbols-outlined text-[15px]">more_time</span>
                        Tambah Waktu
                      </button>
                      <button
                        @click="handleLihatJawaban(nilai)"
                        :disabled="!nilai.wkt_mulai"
                        :title="!nilai.wkt_mulai ? 'Peserta belum memulai ujian' : 'Lihat detail jawaban'"
                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <span class="material-symbols-outlined text-[15px]">visibility</span>
                        Lihat Jawaban
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="nilaiList.length > 0" class="flex items-center justify-between mt-6">
            <p class="text-slate-600">
              Menampilkan {{ (currentPage - 1) * pageSize + 1 }} hingga
              {{ Math.min(currentPage * pageSize, totalNilai) }} dari {{ totalNilai }} data nilai
            </p>
            <div class="flex gap-2">
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Sebelumnya
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="handlePageChange(page)"
                  :class="[
                    'px-3 py-2 rounded-lg font-medium transition-colors',
                    page === currentPage
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  ]">
                  {{ page }}
                </button>
              </div>
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Berikutnya
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <span class="material-symbols-outlined text-7xl text-slate-300">event</span>
          <p class="text-slate-600 mt-4 text-lg">Pilih jadwal untuk melihat data nilai</p>
        </div>
      </div>
    </main>

    <!-- Modal Tambah Waktu -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showTambahWaktuModal"
          class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="closeTambahWaktuModal">
          <div class="bg-white rounded-2xl p-8 w-full max-w-[32rem] shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-h3 text-h3 text-on-surface">Tambah Waktu Ujian</h3>
              <button
                @click="closeTambahWaktuModal"
                :disabled="isSubmittingTambahWaktu"
                class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <p class="text-base text-slate-600 mb-6">
              Tambahkan waktu pengerjaan untuk
              <span class="font-semibold text-slate-900">{{ targetNilai?.nama_peserta }}</span>.
              Peserta akan otomatis dapat melanjutkan ujian.
            </p>

            <div class="grid grid-cols-3 gap-4">
              <button
                v-for="menit in durasiOptions"
                :key="menit"
                @click="handleTambahWaktu(menit)"
                :disabled="isSubmittingTambahWaktu"
                class="py-4 px-3 rounded-lg border border-slate-300 text-slate-700 text-base font-semibold whitespace-nowrap hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                +{{ menit }} menit
              </button>
            </div>

            <p v-if="isSubmittingTambahWaktu" class="text-center text-sm text-slate-500 mt-4">Memproses...</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { jadwalService } from '@/services/jadwalService'
import { nilaiService } from '@/services/nilaiService'
import { useDialog } from '@/composables/useDialog'

const router = useRouter()
const { $alert } = useDialog()

const jadwalList = ref([])
const selectedJadwalId = ref('')
const nilaiList = ref([])
const totalNilai = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoadingJadwal = ref(false)
const isLoadingNilai = ref(false)
const isExporting = ref(false)
const errorMsg = ref('')

const durasiOptions = [5, 10, 15, 20, 25, 30]
const showTambahWaktuModal = ref(false)
const targetNilai = ref(null)
const isSubmittingTambahWaktu = ref(false)

const totalPages = computed(() => Math.ceil(totalNilai.value / pageSize.value))

onMounted(async () => {
  isLoadingJadwal.value = true
  try {
    const res = await jadwalService.getJadwalList(1, 100)
    jadwalList.value = res.data?.data || []
  } catch (err) {
    errorMsg.value = 'Gagal memuat daftar jadwal'
    console.error('Error loading jadwal:', err)
  } finally {
    isLoadingJadwal.value = false
  }
})

const loadNilai = async (page = 1) => {
  if (!selectedJadwalId.value) {
    nilaiList.value = []
    totalNilai.value = 0
    currentPage.value = 1
    return
  }
  isLoadingNilai.value = true
  errorMsg.value = ''
  try {
    const res = await nilaiService.getNilaiByJadwal(selectedJadwalId.value, page, pageSize.value)
    nilaiList.value = res.data?.data || []
    totalNilai.value = res.data?.total || 0
    currentPage.value = page
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat nilai'
    nilaiList.value = []
    totalNilai.value = 0
    console.error('Error loading nilai:', err)
  } finally {
    isLoadingNilai.value = false
  }
}

const handlePageChange = async (page) => {
  if (page >= 1 && page <= totalPages.value) {
    await loadNilai(page)
  }
}

const handleExport = async () => {
  if (!selectedJadwalId.value) return
  isExporting.value = true
  try {
    const response = await nilaiService.exportNilai(selectedJadwalId.value)
    const blob = new Blob([response.data], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const filename =
      response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'export_nilai.zip'
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal mengekspor nilai'
    console.error('Error exporting nilai:', err)
  } finally {
    isExporting.value = false
  }
}

const handleLihatJawaban = (nilai) => {
  router.push({ name: 'nilai.jawabanDetail', params: { id: nilai.id } })
}

const openTambahWaktuModal = (nilai) => {
  targetNilai.value = nilai
  showTambahWaktuModal.value = true
}

const closeTambahWaktuModal = () => {
  if (isSubmittingTambahWaktu.value) return
  showTambahWaktuModal.value = false
  targetNilai.value = null
}

const formatDateTimeForApi = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

const handleTambahWaktu = async (menit) => {
  if (!targetNilai.value?.wkt_mulai) return
  isSubmittingTambahWaktu.value = true
  try {
    const wktMulaiBaru = new Date(new Date(targetNilai.value.wkt_mulai).getTime() + menit * 60 * 1000)
    await nilaiService.selesaiUjian(targetNilai.value.id, {
      wkt_mulai: formatDateTimeForApi(wktMulaiBaru),
      wkt_selesai: '',
    })
    showTambahWaktuModal.value = false
    targetNilai.value = null
    await loadNilai(currentPage.value)
    await $alert(`Berhasil menambah waktu ${menit} menit dan melanjutkan ujian peserta.`, {
      title: 'Berhasil',
      type: 'success',
    })
  } catch (err) {
    await $alert(err.response?.data?.message || 'Gagal menambah waktu ujian', {
      title: 'Gagal',
      type: 'error',
    })
    console.error('Error menambah waktu ujian:', err)
  } finally {
    isSubmittingTambahWaktu.value = false
  }
}

const isLulus = (statusKelulusan) => statusKelulusan?.toUpperCase() === 'LULUS'

const formatStatusKelulusan = (statusKelulusan) => {
  if (!statusKelulusan) return '-'
  return isLulus(statusKelulusan) ? 'Lulus' : 'Tidak Lulus'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from > div,
.modal-fade-leave-to > div {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
