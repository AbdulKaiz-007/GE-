import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedBounty {
    id: string | number;
    title: string;
    company: string;
    location: string;
    type: string;
    url: string;
    savedAt: string;
}

interface BountyStore {
    savedBounties: SavedBounty[];
    saveBounty: (bounty: SavedBounty) => void;
    removeBounty: (id: string | number) => void;
    isSaved: (id: string | number) => boolean;
}

export const useBountyStore = create<BountyStore>()(
    persist(
        (set, get) => ({
            savedBounties: [],
            saveBounty: (bounty) => {
                const { savedBounties } = get()
                if (!savedBounties.find(b => b.id === bounty.id)) {
                    set({ savedBounties: [...savedBounties, bounty] })
                }
            },
            removeBounty: (id) => {
                const { savedBounties } = get()
                set({ savedBounties: savedBounties.filter(b => b.id !== id) })
            },
            isSaved: (id) => {
                return get().savedBounties.some(b => b.id === id)
            }
        }),
        {
            name: 'bounty-storage',
        }
    )
)
