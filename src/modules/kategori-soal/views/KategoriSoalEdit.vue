<template>
  <div class="bg-surface min-h-screen">
    <!-- Sidebar -->
    <SideBar />

    <!-- Top App Bar -->
    <TopAppBar />

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
      <div class="pt-24 pb-12 px-4 lg:px-8 max-w-2xl mx-auto">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">
          Edit Kategori Soal <span v-if="!isLoadingDetail" class="text-sky-600">{{ selectedKategoriSoal?.kategori }}</span>
        </h1>
        <p class="text-slate-500 mt-1">Perbarui informasi kategori soal</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
      </div>

      <!-- Loading State for Detail -->
      <div v-if="isLoadingDetail" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="inline-block w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p class="mt-3 text-slate-600">Memuat data kategori soal...</p>
        </div>
      </div>

      <!-- Form Section -->
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow border border-slate-200 p-6 space-y-6">
        <!-- Kategori Field -->
        <div>
          <label class="block text-sm font-semibold text-slate-900 mb-2">
            Nama Kategori <span class="text-red-600">*</span>
          </label>
          <input
            v-model="formData.kategori"
            @blur="validateKategori"
            type="text"
            placeholder="Contoh: Pilihan Ganda"
            maxlength="255"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            :class="{ 'border-red-500 focus:ring-red-500': errors.kategori }">
          <p v-if="errors.kategori" class="text-red-600 text-sm mt-1">{{ errors.kategori }}</p>
          <p class="text-slate-500 text-sm mt-1">{{ formData.kategori.length }} / 255 karakter</p>
        </div>

        <!-- Benar & Salah Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">
              Poin Benar <span class="text-red-600">*</span>
            </label>
            <input
              v-model.number="formData.benar"
              @blur="validateBenar"
              type="number"
              step="any"
              placeholder="Contoh: 0.5 atau -1"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              :class="{ 'border-red-500 focus:ring-red-500': errors.benar }">
            <p v-if="errors.benar" class="text-red-600 text-sm mt-1">{{ errors.benar }}</p>
            <p class="text-slate-500 text-sm mt-1">Poin untuk setiap jawaban benar (mendukung angka pecahan dan minus)</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-900 mb-2">
              Poin Salah <span class="text-red-600">*</span>
            </label>
            <input
              v-model.number="formData.salah"
              @blur="validateSalah"
              type="number"
              step="any"
              placeholder="Contoh: -0.5 atau -1"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              :class="{ 'border-red-500 focus:ring-red-500': errors.salah }">
            <p v-if="errors.salah" class="text-red-600 text-sm mt-1">{{ errors.salah }}</p>
            <p class="text-slate-500 text-sm mt-1">Poin untuk setiap jawaban salah (mendukung angka pecahan dan minus)</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            :disabled="isSubmitting">
            <span class="material-symbols-outlined">check</span>
            Simpan Perubahan
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg transition-colors">
            Batal
          </button>
        </div>
      </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import SideBar from '@/components/SideBar.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { useRoute, useRouter } from 'vue-router'
import { useKategoriSoalStore } from '@/stores/kategoriSoal'

const route = useRoute()
const router = useRouter()
const kategoriSoalStore = useKategoriSoalStore()
const kategoriSoalId = route.params.id
const isLoadingDetail = ref(true)
const isSubmitting = ref(false)
const error = ref(null)

const formData = reactive({
  kategori: '',
  benar: 0,
  salah: 0
})

const errors = reactive({
  kategori: '',
  benar: '',
  salah: ''
})

const selectedKategoriSoal = computed(() => kategoriSoalStore.selectedKategoriSoal)

onMounted(async () => {
  try {
    await kategoriSoalStore.fetchKategoriSoalById(kategoriSoalId)
    const kategoriSoal = kategoriSoalStore.selectedKategoriSoal

    if (kategoriSoal) {
      formData.kategori = kategoriSoal.kategori
      formData.benar = kategoriSoal.benar
      formData.salah = kategoriSoal.salah
    }
  } catch (err) {
    error.value = 'Kategori soal tidak ditemukan'
  } finally {
    isLoadingDetail.value = false
  }
})

const validateKategori = () => {
  errors.kategori = ''
  if (!formData.kategori || formData.kategori.trim().length === 0) {
    errors.kategori = 'Nama kategori wajib diisi'
  } else if (formData.kategori.length > 255) {
    errors.kategori = 'Nama kategori maksimal 255 karakter'
  }
}

const validateBenar = () => {
  errors.benar = ''
  if (formData.benar === '' || formData.benar === null || formData.benar === undefined) {
    errors.benar = 'Poin benar wajib diisi'
  } else if (isNaN(formData.benar)) {
    errors.benar = 'Poin benar harus berupa angka'
  }
}

const validateSalah = () => {
  errors.salah = ''
  if (formData.salah === '' || formData.salah === null || formData.salah === undefined) {
    errors.salah = 'Poin salah wajib diisi'
  } else if (isNaN(formData.salah)) {
    errors.salah = 'Poin salah harus berupa angka'
  }
}

const validateForm = () => {
  validateKategori()
  validateBenar()
  validateSalah()
  return !errors.kategori && !errors.benar && !errors.salah
}

const handleSubmit = async () => {
  error.value = null

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await kategoriSoalStore.updateKategoriSoal(kategoriSoalId, {
      kategori: formData.kategori.trim(),
      benar: formData.benar,
      salah: formData.salah
    })

    router.push({ name: 'kategoriSoal.list' })
  } catch (err) {
    error.value = kategoriSoalStore.error || 'Gagal mengupdate kategori soal'
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>
