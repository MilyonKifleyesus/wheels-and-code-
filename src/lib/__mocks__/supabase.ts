import { vi } from 'vitest';

const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
const mockSelect = vi.fn(() => ({
  order: mockOrder,
}));

const mockSupabase = {
  from: vi.fn(() => ({
    select: mockSelect,
    insert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
    update: vi.fn().mockResolvedValue({ data: [{}], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [{}], error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
    })),
  },
};

export const supabase = mockSupabase;
export const isSupabaseConfigured = vi.fn(() => true);
export const testSupabaseConnection = vi.fn();
export const getConfigurationStatus = vi.fn(() => ({
    hasUrl: true,
    hasKey: true,
    hasClient: true,
    isConfigured: true,
}));
export const safeSupabaseCall = vi.fn(async (operation) => operation());
