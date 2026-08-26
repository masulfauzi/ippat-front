import { defineStore } from 'pinia'
import { bankSoalService } from '@/services/bankSoalService'
import { pesertaService } from '@/services/pesertaService'
import { jadwalService } from '@/services/jadwalService'
import { nilaiService } from '@/services/nilaiService'

function getInitials(name) {
    if (!name) return '?'
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
}

function parseApiDate(dateStr) {
    return new Date(dateStr.replace(' ', 'T'))
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '-'
    const date = parseApiDate(dateStr)
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Baru saja'
    if (diffMin < 60) return `${diffMin} menit lalu`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} jam lalu`
    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay} hari lalu`
}

export const useAdminStore = defineStore('admin', {
    state: () => ({
        stats: {
            totalQuestions: 0,
            activeExams: 0,
            totalStudents: 0,
            averageGrade: 0,
        },
        recentSubmissions: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        hasStats: (state) => Object.values(state.stats).length > 0,
        submissionCount: (state) => state.recentSubmissions.length,
        lulusCount: (state) => state.recentSubmissions.filter(s => s.status === 'lulus').length,
        tidakLulusCount: (state) => state.recentSubmissions.filter(s => s.status === 'tidak_lulus').length,
    },

    actions: {
        async fetchStats() {
            this.isLoading = true
            this.error = null

            try {
                const [bankSoalRes, pesertaRes, jadwalCountRes, nilaiCountRes] = await Promise.all([
                    bankSoalService.getBankSoalList(1, 1),
                    pesertaService.getPesertaList(1, 1),
                    jadwalService.getJadwalList(1, 1),
                    nilaiService.getNilaiList(1, 1),
                ])

                const totalQuestions = bankSoalRes?.data?.total ?? 0
                const totalStudents = pesertaRes?.data?.total ?? 0

                let activeExams = 0
                const totalJadwal = jadwalCountRes?.data?.total ?? 0
                if (totalJadwal > 0) {
                    const allJadwalRes = await jadwalService.getJadwalList(1, totalJadwal)
                    const jadwalList = allJadwalRes?.data?.data ?? []
                    const now = Date.now()
                    activeExams = jadwalList.filter((j) => {
                        if (!j.wkt_mulai || !j.wkt_selesai) return false
                        const mulai = parseApiDate(j.wkt_mulai).getTime()
                        const selesai = parseApiDate(j.wkt_selesai).getTime()
                        return now >= mulai && now <= selesai
                    }).length
                }

                let averageGrade = 0
                const totalNilai = nilaiCountRes?.data?.total ?? 0
                if (totalNilai > 0) {
                    const allNilaiRes = await nilaiService.getNilaiList(1, totalNilai)
                    const selesai = (allNilaiRes?.data?.data ?? []).filter((n) => !!n.wkt_selesai)
                    if (selesai.length > 0) {
                        const sum = selesai.reduce((acc, n) => acc + (n.nilai || 0), 0)
                        averageGrade = Math.round((sum / selesai.length) * 10) / 10
                    }
                }

                this.stats = { totalQuestions, activeExams, totalStudents, averageGrade }
                return this.stats
            } catch (err) {
                this.error = err.message || 'Failed to fetch stats'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchRecentSubmissions(limit = 5) {
            this.isLoading = true
            this.error = null

            try {
                const firstPage = await nilaiService.getNilaiList(1, 1)
                const total = firstPage?.data?.total ?? 0

                if (total === 0) {
                    this.recentSubmissions = []
                    return this.recentSubmissions
                }

                const allNilaiRes = await nilaiService.getNilaiList(1, total)
                const nilaiList = allNilaiRes?.data?.data ?? []

                this.recentSubmissions = nilaiList
                    .filter((n) => !!n.wkt_selesai)
                    .sort((a, b) => parseApiDate(b.wkt_selesai) - parseApiDate(a.wkt_selesai))
                    .slice(0, limit)
                    .map((n) => ({
                        id: n.id,
                        studentName: n.nama_peserta,
                        studentInitials: getInitials(n.nama_peserta),
                        examName: n.nama_ujian,
                        submittedAt: formatRelativeTime(n.wkt_selesai),
                        status: n.status_kelulusan?.toUpperCase() === 'LULUS' ? 'lulus' : 'tidak_lulus',
                    }))

                return this.recentSubmissions
            } catch (err) {
                this.error = err.message || 'Failed to fetch submissions'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        clearError() {
            this.error = null
        },
    },
})
