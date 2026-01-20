import { create } from 'zustand';

export type CategoryType = 'EMERGENCY' | 'PHARMACY' | 'ANIMAL_HOSPITAL' | 'AED' | 'FAVORITES';

interface SosStore {
    selectedCategory: CategoryType;
    setSelectedCategory: (category: CategoryType) => void;
    selectedItem: any | null;
    setSelectedItem: (item: any | null) => void;
    isBottomSheetOpen: boolean;
    setBottomSheetOpen: (open: boolean) => void;
    items: any[];
    setItems: (items: any[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterOpenNow: boolean;
    setFilterOpenNow: (open: boolean) => void;
    favorites: any[];
    toggleFavorite: (item: any) => void;
}

export const useSosStore = create<SosStore>((set) => ({
    selectedCategory: 'EMERGENCY',
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    selectedItem: null,
    setSelectedItem: (item) => set({ selectedItem: item }),
    isBottomSheetOpen: false,
    setBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),
    items: [],
    setItems: (items) => set({ items }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    filterOpenNow: false,
    setFilterOpenNow: (open) => set({ filterOpenNow: open }),
    favorites: [],
    toggleFavorite: (item) => set((state) => {
        const isFav = state.favorites.some(f => f.hp_id === item.hp_id || f.id === item.id);
        if (isFav) {
            return { favorites: state.favorites.filter(f => !(f.hp_id === item.hp_id || f.id === item.id)) };
        } else {
            return { favorites: [...state.favorites, item] };
        }
    }),
}));
