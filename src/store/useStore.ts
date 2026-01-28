import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Restaurant, Photo, Memory, ViewMode, FilterType, User } from '../types';

interface AppState {
  // User
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Restaurants
  restaurants: Restaurant[];
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'memories'>) => Restaurant;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;

  // Photos
  addPhoto: (restaurantId: string, photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  deletePhoto: (restaurantId: string, photoId: string) => void;

  // Memories
  addMemory: (restaurantId: string, content: string) => void;
  deleteMemory: (restaurantId: string, memoryId: string) => void;

  // UI State
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;

  // Share
  generateShareData: () => string;
  importShareData: (data: string) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      currentUser: {
        id: uuidv4(),
        name: 'あなた',
      },
      setCurrentUser: (user) => set({ currentUser: user }),

      // Restaurants
      restaurants: [],

      addRestaurant: (restaurantData) => {
        const newRestaurant: Restaurant = {
          ...restaurantData,
          id: uuidv4(),
          photos: [],
          memories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          restaurants: [...state.restaurants, newRestaurant],
        }));
        return newRestaurant;
      },

      updateRestaurant: (id, updates) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
        }));
      },

      deleteRestaurant: (id) => {
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r.id !== id),
          selectedRestaurant: state.selectedRestaurant?.id === id ? null : state.selectedRestaurant,
        }));
      },

      // Photos
      addPhoto: (restaurantId, photoData) => {
        const newPhoto: Photo = {
          ...photoData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === restaurantId
              ? { ...r, photos: [...r.photos, newPhoto], updatedAt: new Date() }
              : r
          ),
        }));
      },

      deletePhoto: (restaurantId, photoId) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === restaurantId
              ? { ...r, photos: r.photos.filter((p) => p.id !== photoId), updatedAt: new Date() }
              : r
          ),
        }));
      },

      // Memories
      addMemory: (restaurantId, content) => {
        const { currentUser } = get();
        const newMemory: Memory = {
          id: uuidv4(),
          content,
          author: currentUser.name,
          createdAt: new Date(),
        };
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === restaurantId
              ? { ...r, memories: [...r.memories, newMemory], updatedAt: new Date() }
              : r
          ),
        }));
      },

      deleteMemory: (restaurantId, memoryId) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === restaurantId
              ? { ...r, memories: r.memories.filter((m) => m.id !== memoryId), updatedAt: new Date() }
              : r
          ),
        }));
      },

      // UI State
      viewMode: 'map',
      setViewMode: (mode) => set({ viewMode: mode }),
      filter: 'all',
      setFilter: (filter) => set({ filter }),
      selectedRestaurant: null,
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

      // Share
      generateShareData: () => {
        const { restaurants, currentUser } = get();
        const shareData = {
          restaurants,
          sharedBy: currentUser.name,
          sharedAt: new Date(),
        };
        return btoa(encodeURIComponent(JSON.stringify(shareData)));
      },

      importShareData: (data) => {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(data)));
          if (decoded.restaurants && Array.isArray(decoded.restaurants)) {
            const existingIds = new Set(get().restaurants.map((r) => r.id));
            const newRestaurants = decoded.restaurants
              .filter((r: Restaurant) => !existingIds.has(r.id))
              .map((r: Restaurant) => ({
                ...r,
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt),
                visitedDate: r.visitedDate ? new Date(r.visitedDate) : undefined,
                photos: r.photos.map((p: Photo) => ({
                  ...p,
                  createdAt: new Date(p.createdAt),
                })),
                memories: r.memories.map((m: Memory) => ({
                  ...m,
                  createdAt: new Date(m.createdAt),
                })),
              }));

            set((state) => ({
              restaurants: [...state.restaurants, ...newRestaurants],
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'delicious-mapshare-storage',
      partialize: (state) => ({
        restaurants: state.restaurants,
        currentUser: state.currentUser,
      }),
    }
  )
);
