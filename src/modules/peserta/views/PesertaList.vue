<template>
  <div class="bg-surface min-h-screen">
    <!-- Sidebar -->
    <SideBar />

    <!-- Top App Bar -->
    <TopAppBar />

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
      <div class="pt-24 pb-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <!-- Page Title & Create Button -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Manajemen Peserta Ujian</h1>
          <p class="text-slate-500 mt-1">Kelola semua peserta ujian dalam sistem</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="openImportModal"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            <span class="material-symbols-outlined">upload_file</span>
            Import Peserta
          </button>
          <button
            @click="handleCreate"
            class="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            <span class="material-symbols-outlined">add</span>
            Buat Peserta Baru
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        {{ success }}
      </div>

      <!-- Filter Section -->
      <div v-if="!isLoading" class="mb-6">
        <div class="flex items-center gap-4">
          <select
            v-model="filterKelasId"
            @change="handleFilter"
            class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Semua Kelas</option>
            <option v-for="kelas in kelasStore.kelass" :key="kelas.id" :value="kelas.id">
              {{ kelas.nama_kelas }}
            </option>
          </select>
          <span class="text-slate-500 text-sm">Pilih kelas untuk memfilter data</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p class="mt-3 text-slate-600">Memuat data peserta...</p>
        </div>
      </div>

      <!-- Table Section -->
      <div v-else class="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div v-if="!isLoading && pesertas.length === 0" class="text-center py-12">
          <span class="material-symbols-outlined text-6xl text-slate-300">inbox</span>
          <p class="text-slate-600 mt-4">Belum ada peserta yang dibuat</p>
          <button
            @click="handleCreate"
            class="mt-4 text-sky-600 hover:text-sky-700 font-semibold">
            Buat peserta pertama Anda
          </button>
        </div>

        <table v-else class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No.</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kelas</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Username</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="(peserta, index) in pesertas" :key="peserta.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-slate-900">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-6 py-4 text-slate-900 font-medium">{{ peserta.nama }}</td>
              <td class="px-6 py-4 text-slate-900">{{ peserta.nama_kelas }}</td>
              <td class="px-6 py-4 text-slate-900">{{ peserta.username }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="handleView(peserta.id)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Lihat detail">
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    @click="handleEdit(peserta.id)"
                    class="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    title="Edit">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="handleDelete(peserta.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && pesertas.length > 0" class="flex items-center justify-between mt-6">
        <p class="text-slate-600">
          Menampilkan {{ (currentPage - 1) * pageSize + 1 }} hingga
          {{ Math.min(currentPage * pageSize, totalPeserta) }} dari {{ totalPeserta }} peserta
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
    </main>

    <!-- Modal Import Peserta -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showImportModal"
          class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="closeImportModal">
          <div class="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-h3 text-h3 text-on-surface">Import Peserta dari Excel</h3>
              <button
                @click="closeImportModal"
                :disabled="isImporting"
                class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Form Import -->
            <div v-if="!importResult" class="space-y-5">
              <p class="text-sm text-slate-600">
                Tambahkan banyak peserta sekaligus ke satu kelas lewat file Excel (.xlsx/.xls, maksimal 10MB).
              </p>

              <a
                href="/templates/template_import_peserta.xlsx"
                download
                class="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-semibold">
                <span class="material-symbols-outlined text-[18px]">download</span>
                Unduh Template Excel
              </a>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Kelas Tujuan</label>
                <select
                  v-model="importKelasId"
                  :disabled="isImporting"
                  class="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50">
                  <option value="">-- Pilih Kelas --</option>
                  <option v-for="kelas in kelasStore.kelass" :key="kelas.id" :value="kelas.id">
                    {{ kelas.nama_kelas }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">File Excel</label>
                <input
                  ref="importFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  :disabled="isImporting"
                  @change="handleImportFileChange"
                  class="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 disabled:opacity-50" />
              </div>

              <div v-if="importErrorMsg" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ importErrorMsg }}
              </div>

              <p class="text-xs text-slate-500">
                Catatan keamanan: file berisi password peserta dalam bentuk teks biasa. Hapus file dari perangkat/email setelah import selesai.
              </p>

              <div class="flex gap-3">
                <button
                  @click="closeImportModal"
                  :disabled="isImporting"
                  class="flex-1 px-5 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
                  Batal
                </button>
                <button
                  @click="handleImportSubmit"
                  :disabled="isImporting || !importKelasId || !importFile"
                  class="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {{ isImporting ? 'Mengimport...' : 'Import Peserta' }}
                </button>
              </div>
            </div>

            <!-- Hasil Import -->
            <div v-else class="space-y-5">
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-slate-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-slate-900">{{ importResult.total_processed }}</p>
                  <p class="text-xs text-slate-500 mt-1">Diproses</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ importResult.total_success }}</p>
                  <p class="text-xs text-green-600 mt-1">Berhasil</p>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-red-700">{{ importResult.total_failed }}</p>
                  <p class="text-xs text-red-600 mt-1">Gagal</p>
                </div>
              </div>

              <div v-if="importResult.errors?.length > 0">
                <p class="text-sm font-semibold text-slate-700 mb-2">Detail baris gagal:</p>
                <div class="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Baris</th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                      <tr v-for="(err, idx) in importResult.errors" :key="idx">
                        <td class="px-4 py-2 text-slate-900 font-medium whitespace-nowrap">{{ err.row }}</td>
                        <td class="px-4 py-2 text-red-700">{{ err.error }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p class="text-xs text-slate-500 mt-2">
                  Perbaiki baris di atas pada file Excel lalu upload ulang untuk melengkapi data yang gagal.
                </p>
              </div>

              <div class="flex gap-3">
                <button
                  @click="resetImportForm"
                  class="flex-1 px-5 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                  Import File Lain
                </button>
                <button
                  @click="closeImportModal"
                  class="flex-1 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { usePesertaStore } from '@/stores/peserta'
import { useDialog } from '@/composables/useDialog'
import { useKelasStore } from '@/stores/kelas'
import { useRouter } from 'vue-router'
import { pesertaService } from '@/services/pesertaService'

const pesertaStore = usePesertaStore()
const kelasStore = useKelasStore()
const router = useRouter()
const { $confirm } = useDialog()
const currentPage = ref(1)
const filterKelasId = ref('')

const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024
const showImportModal = ref(false)
const importKelasId = ref('')
const importFile = ref(null)
const importFileInput = ref(null)
const isImporting = ref(false)
const importErrorMsg = ref('')
const importResult = ref(null)

onMounted(async () => {
  try {
    await kelasStore.fetchKelasList(1, 100)
  } catch (err) {
    console.error('Error loading kelas:', err)
  }
  await pesertaStore.fetchPesertaList(1)
})

const pesertas = computed(() => pesertaStore.pesertas)
const isLoading = computed(() => pesertaStore.isLoading)
const error = computed(() => pesertaStore.error)
const success = computed(() => pesertaStore.success)
const pageSize = computed(() => pesertaStore.pageSize)
const totalPeserta = computed(() => pesertaStore.totalPeserta)
const totalPages = computed(() => pesertaStore.totalPages)

watch(success, (newVal) => {
  if (newVal) {
    setTimeout(() => pesertaStore.clearSuccess(), 3000)
  }
})

watch(error, (newVal) => {
  if (newVal) {
    setTimeout(() => pesertaStore.clearError(), 3000)
  }
})

const handleCreate = () => {
  router.push({ name: 'peserta.create' })
}

const handleView = (id) => {
  router.push({ name: 'peserta.detail', params: { id } })
}

const handleEdit = (id) => {
  router.push({ name: 'peserta.edit', params: { id } })
}

const handleDelete = async (id) => {
  if (await $confirm('Yakin ingin menghapus peserta ini?', { title: 'Konfirmasi Hapus' })) {
    try {
      await pesertaStore.deletePeserta(id)
      await pesertaStore.fetchPesertaList(currentPage.value, pageSize.value, { id_kelas: filterKelasId.value })
    } catch (err) {
      console.error('Error deleting peserta:', err)
    }
  }
}

const handlePageChange = async (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await pesertaStore.fetchPesertaList(page, pageSize.value, { id_kelas: filterKelasId.value })
  }
}

const handleFilter = async () => {
  currentPage.value = 1
  await pesertaStore.fetchPesertaList(1, pageSize.value, { id_kelas: filterKelasId.value })
}

const openImportModal = () => {
  resetImportForm()
  showImportModal.value = true
}

const closeImportModal = () => {
  if (isImporting.value) return
  showImportModal.value = false
  resetImportForm()
}

const resetImportForm = () => {
  importKelasId.value = ''
  importFile.value = null
  importErrorMsg.value = ''
  importResult.value = null
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
}

const handleImportFileChange = (event) => {
  const file = event.target.files?.[0]
  importErrorMsg.value = ''
  importFile.value = null

  if (!file) return

  const validExtension = /\.(xlsx|xls)$/i.test(file.name)
  if (!validExtension) {
    importErrorMsg.value = 'Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)'
    event.target.value = ''
    return
  }

  if (file.size > MAX_IMPORT_FILE_SIZE) {
    importErrorMsg.value = 'Ukuran file terlalu besar. Maksimal 10MB'
    event.target.value = ''
    return
  }

  importFile.value = file
}

const handleImportSubmit = async () => {
  if (!importKelasId.value || !importFile.value) return

  isImporting.value = true
  importErrorMsg.value = ''

  try {
    const response = await pesertaService.importPesertaFromExcel(importKelasId.value, importFile.value)
    importResult.value = response.data
    await pesertaStore.fetchPesertaList(currentPage.value, pageSize.value, { id_kelas: filterKelasId.value })
  } catch (err) {
    importErrorMsg.value = err.response?.data?.message || 'Gagal mengimport peserta dari Excel'
    console.error('Error importing peserta:', err)
  } finally {
    isImporting.value = false
  }
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
