import { create } from 'zustand'

type FilterStatus = 'all' | 'active' | 'completed'

interface TodosUiState {
  filterStatus: FilterStatus
  searchQuery: string
  setFilterStatus: (status: FilterStatus) => void
  setSearchQuery: (query: string) => void
}

export const useTodosUiStore = create<TodosUiState>((set) => ({
  filterStatus: 'all',
  searchQuery: '',
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
