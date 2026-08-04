import { defineStore } from 'pinia'
import { kategoriSoalService } from '@/services/kategoriSoalService'

export const useKategoriSoalStore = defineStore('kategoriSoal', {
  state: () => ({
    kategoriSoals: [],
    totalKategoriSoals: 0,
    currentPage: 1,
    pageSize: 10,
    selectedKategoriSoal: null,
    isLoading: false,
    error: null,
    success: null,
  }),

  getters: {
    hasKategoriSoals: (state) => state.kategoriSoals.length > 0,
    kategoriSoalCount: (state) => state.kategoriSoals.length,
    totalPages: (state) => Math.ceil(state.totalKategoriSoals / state.pageSize),
    kategoriSoalById: (state) => (id) => state.kategoriSoals.find(k => k.id === id),
  },

  actions: {
    async fetchKategoriSoalList(page = 1, pageSize = 10) {
      this.isLoading = true
      this.error = null

      try {
        const response = await kategoriSoalService.getKategoriSoalList(page, pageSize)
        this.kategoriSoals = response.data.data
        this.totalKategoriSoals = response.data.total
        this.currentPage = page
        this.pageSize = pageSize
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch kategori soal list'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchKategoriSoalById(id) {
      this.isLoading = true
      this.error = null

      try {
        const response = await kategoriSoalService.getKategoriSoalById(id)
        this.selectedKategoriSoal = response.data
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch kategori soal detail'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async createKategoriSoal(payload) {
      this.isLoading = true
      this.error = null
      this.success = null

      try {
        const response = await kategoriSoalService.createKategoriSoal(payload)
        this.success = 'Kategori soal berhasil dibuat'
        this.kategoriSoals.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to create kategori soal'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateKategoriSoal(id, payload) {
      this.isLoading = true
      this.error = null
      this.success = null

      try {
        const response = await kategoriSoalService.updateKategoriSoal(id, payload)
        this.success = 'Kategori soal berhasil diupdate'

        const index = this.kategoriSoals.findIndex(k => k.id === id)
        if (index !== -1) {
          this.kategoriSoals[index] = response.data
        }
        this.selectedKategoriSoal = response.data
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to update kategori soal'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteKategoriSoal(id) {
      this.isLoading = true
      this.error = null
      this.success = null

      try {
        await kategoriSoalService.deleteKategoriSoal(id)
        this.success = 'Kategori soal berhasil dihapus'
        this.kategoriSoals = this.kategoriSoals.filter(k => k.id !== id)
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to delete kategori soal'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async restoreKategoriSoal(id) {
      this.isLoading = true
      this.error = null
      this.success = null

      try {
        await kategoriSoalService.restoreKategoriSoal(id)
        this.success = 'Kategori soal berhasil di-restore'
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to restore kategori soal'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    clearSuccess() {
      this.success = null
    },
  },
})
