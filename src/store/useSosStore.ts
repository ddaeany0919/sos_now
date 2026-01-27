import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    distanceFilter: number | 'all';
    setDistanceFilter: (distance: number | 'all') => void;
    userLocation: { lat: number; lng: number; accuracy: number; isManual?: boolean } | null;
    setUserLocation: (location: { lat: number; lng: number; accuracy: number; isManual?: boolean } | null) => void;
    locationMode: 'auto' | 'manual';
    setLocationMode: (mode: 'auto' | 'manual') => void;
    manualLocation: { lat: number; lng: number } | null;
    setManualLocation: (location: { lat: number; lng: number } | null) => void;
    favorites: any[];
    toggleFavorite: (item: any) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useSosStore = create<SosStore>()(
    persist(
        (set) => ({
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
            distanceFilter: 5,
            setDistanceFilter: (distance) => set({ distanceFilter: distance }),
            userLocation: null,
            setUserLocation: (location) => set({ userLocation: location }),
            locationMode: 'auto',
            setLocationMode: (mode) => set({ locationMode: mode }),
            manualLocation: null,
            setManualLocation: (location) => set({ manualLocation: location }),
            favorites: [],
            toggleFavorite: (item) => set((state) => {
                const isFav = state.favorites.some(f =>
                    (item.hp_id && f.hp_id === item.hp_id) ||
                    (item.id && f.id === item.id)
                );
                if (isFav) {
                    return {
                        favorites: state.favorites.filter(f =>
                            !((item.hp_id && f.hp_id === item.hp_id) || (item.id && f.id === item.id))
                        )
                    };
                } else {
                    return { favorites: [...state.favorites, item] };
                }
            }),
            isLoading: false,
            setIsLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'sos-storage',
            partialize: (state) => ({
                favorites: state.favorites,
                locationMode: state.locationMode,
                manualLocation: state.manualLocation
            }),
        }
    )
);
