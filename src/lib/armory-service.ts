
export interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string; // emoji or url
    type: 'Book' | 'Gadget' | 'Gear' | 'Notes' | 'Artifact';
    seller: string; // 'System' or Student Name
    condition?: 'New' | 'Used' | 'Battle-worn';
}

export interface UserState {
    coins: number;
    inventory: Item[];
}

const INITIAL_BALANCE = 500;

const MOCK_MARKET: Item[] = [
    {
        id: '1',
        name: 'Calculus: Early Transcendentals',
        description: 'The legendary tome of integration. Slight tear on page 54.',
        price: 150,
        image: '📚',
        type: 'Book',
        seller: 'System',
        condition: 'Used'
    },
    {
        id: '2',
        name: 'Scientific Calculator fx-991EX',
        description: 'Solar powered. Solves equations faster than light.',
        price: 300,
        image: 'r/ScientificCalculator',
        type: 'Gadget',
        seller: 'System',
        condition: 'New'
    },
    {
        id: '3',
        name: 'Lab Coat (stained)',
        description: 'Has mysterious chemical burns. Adds +5 to Chemistry.',
        price: 80,
        image: '🥼',
        type: 'Gear',
        seller: 'Alex (Senior)',
        condition: 'Battle-worn'
    },
    {
        id: '4',
        name: 'Physics I - Final Exam Notes',
        description: 'Handwritten notes from the top scorer of 2024.',
        price: 50,
        image: '📝',
        type: 'Notes',
        seller: 'Sarah J.',
        condition: 'Used'
    },
    {
        id: '5',
        name: 'Noise Cancelling Headphones',
        description: 'Crucial for studying in the dorms.',
        price: 450,
        image: '🎧',
        type: 'Gadget',
        seller: 'System',
        condition: 'New'
    },
    {
        id: '6',
        name: 'Drafter & Geometry Box',
        description: 'Complete set for Engineering Drawing.',
        price: 120,
        image: '📐',
        type: 'Gear',
        seller: 'System',
        condition: 'New'
    }
];

// Helper to get state
export function getArmoryState(): UserState {
    if (typeof window === 'undefined') return { coins: INITIAL_BALANCE, inventory: [] };

    const stored = localStorage.getItem('armory_user_state');
    if (stored) {
        return JSON.parse(stored);
    }
    return { coins: INITIAL_BALANCE, inventory: [] };
}

// Helper to get market items
export function getMarketItems(): Item[] {
    if (typeof window === 'undefined') return MOCK_MARKET;

    const stored = localStorage.getItem('armory_market_items');
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize mock market if empty
    localStorage.setItem('armory_market_items', JSON.stringify(MOCK_MARKET));
    return MOCK_MARKET;
}

// Buy Item
export function buyItem(item: Item): { success: boolean; message: string; newState?: UserState } {
    const state = getArmoryState();

    if (state.coins < item.price) {
        return { success: false, message: "Not enough coins!" };
    }

    const newState = {
        coins: state.coins - item.price,
        inventory: [...state.inventory, item]
    };

    // Remove from market
    const market = getMarketItems();
    const newMarket = market.filter(i => i.id !== item.id);

    localStorage.setItem('armory_user_state', JSON.stringify(newState));
    localStorage.setItem('armory_market_items', JSON.stringify(newMarket));

    return { success: true, message: `Bought ${item.name}!`, newState };
}

// Sell Item (List on market)
export function sellItem(item: Item): { success: boolean; message: string; newState?: UserState } {
    const state = getArmoryState();

    // Remove from inventory
    const newInventory = state.inventory.filter(i => i.id !== item.id);

    const newState = {
        coins: state.coins + Math.floor(item.price * 0.8), // Immediate sell back for 80% value to system for simplicity, OR list it?
        // Let's go with "Sell back to system" for instant gratification for now, 
        // OR "List" implies waiting. Use "Quick Sell" for now.
        inventory: newInventory
    };

    // Actually, "Marketplace" usually implies peer-to-peer.
    // Let's make "Sell" just return it to the market and give coins.

    const market = getMarketItems();
    const newMarket = [...market, { ...item, seller: 'You', id: Math.random().toString() }]; // re-list

    localStorage.setItem('armory_user_state', JSON.stringify(newState));
    localStorage.setItem('armory_market_items', JSON.stringify(newMarket));

    return { success: true, message: `Sold ${item.name} for ${Math.floor(item.price * 0.8)} coins`, newState };
}

export function resetArmory() {
    localStorage.removeItem('armory_user_state');
    localStorage.removeItem('armory_market_items');
}
