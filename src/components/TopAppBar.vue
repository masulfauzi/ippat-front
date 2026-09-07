<template>
    <!-- TopAppBar -->
    <header
        class="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center h-16 px-4 lg:px-8">
        <!-- Mobile Menu Toggle (mobile only) -->
        <button
            @click="uiStore.toggleSidebar()"
            class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <!-- Title -->
        <span class="text-lg font-semibold text-slate-800 font-h3 whitespace-nowrap">{{ pageTitle }}</span>

        <!-- Right Section: User Profile -->
        <div class="flex items-center gap-6">
            <!-- User Profile with Dropdown -->
            <div class="relative">
                <button
                    @click="isDropdownOpen = !isDropdownOpen"
                    class="flex items-center gap-3 pl-2 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors">
                    <div class="text-right">
                        <p class="font-label-md text-label-md text-on-surface">{{ userName }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ userRole }}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full border-2 border-sky-100 p-0.5">
                        <div class="w-full h-full rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">
                            {{ userInitials }}
                        </div>
                    </div>
                </button>

                <!-- Dropdown Menu -->
                <div
                    v-if="isDropdownOpen"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    <!-- User Info -->
                    <div class="px-4 py-3 border-b border-slate-100">
                        <p class="text-sm font-semibold text-on-surface">{{ userName }}</p>
                        <p class="text-xs text-slate-500">{{ userEmail }}</p>
                    </div>

                    <!-- Menu Items -->
                    <div class="py-2">
                        <button
                            class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-base">account_circle</span>
                            Profile
                        </button>
                        <button
                            class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-base">settings</span>
                            Settings
                        </button>
                        <div class="border-t border-slate-100 my-1"></div>
                        <button
                            @click="handleLogout"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-base">logout</span>
                            Logout
                        </button>
                    </div>
                </div>

                <!-- Backdrop -->
                <div
                    v-if="isDropdownOpen"
                    @click="isDropdownOpen = false"
                    class="fixed inset-0 z-40"></div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const isDropdownOpen = ref(false)

const isAdmin = computed(() => authStore.currentUser?.role === 'admin')
const userName = computed(() => authStore.displayName)
const userEmail = computed(() => authStore.currentUser?.email || '')
const userRole = computed(() => isAdmin.value ? 'Administrator' : 'Peserta')
const userInitials = computed(() => {
    const name = userName.value?.trim()
    if (!name || name === 'User') return '?'
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
})

const pageTitle = computed(() => {
    return isAdmin.value ? 'Exam Management' : 'Dashboard Peserta'
})

const handleLogout = () => {
    isDropdownOpen.value = false
    authStore.logout()
    router.push('/login')
}
</script>
