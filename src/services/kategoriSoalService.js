import api from './api'

export const kategoriSoalService = {
  getKategoriSoalList: async (page = 1, pageSize = 10) => {
    try {
      const response = await api.get('/kategori-soal', {
        params: { page, page_size: pageSize }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getKategoriSoalById: async (id) => {
    try {
      const response = await api.get(`/kategori-soal/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  createKategoriSoal: async (payload) => {
    try {
      const response = await api.post('/kategori-soal', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateKategoriSoal: async (id, payload) => {
    try {
      const response = await api.put(`/kategori-soal/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteKategoriSoal: async (id) => {
    try {
      const response = await api.delete(`/kategori-soal/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  restoreKategoriSoal: async (id) => {
    try {
      const response = await api.patch(`/kategori-soal/${id}/restore`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}
