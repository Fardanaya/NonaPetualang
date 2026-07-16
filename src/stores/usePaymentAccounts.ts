import { create } from 'zustand'
import { fetchServer } from '@/lib/fetch'
import { displayToast } from "@/lib/utils";

const tags = ['payment_accounts'];

interface IPaymentAccounts {
    id?: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    [key: string]: any;
}

interface IPaymentAccountsStore {
    loading: boolean
    default: IPaymentAccounts
    model: IPaymentAccounts
    list: IPaymentAccounts[]
    setModel: (model?: any) => void
    getAll: () => void
    getById: (id: string) => void
    create: () => void
    remove: (id: string) => void
}

export const usePaymentAccounts = create<IPaymentAccountsStore>((set, get) => ({
    loading: false,
    default: {
        bank_name: '',
        account_number: '',
        account_name: '',
    },
    model: {
        bank_name: '',
        account_number: '',
        account_name: '',
    },
    list: [],
    setModel: (model) => set({ model: (m => (delete m.xata, m))(!model ? { ...get().default } : Object.keys(model).length === 1 ? { ...get().model, ...model } : { ...model }) }),
    getAll: async () => {
        set({ loading: false, list: [] });
    },
    getById: async (id) => {
        set({ loading: false });
    },
    create: async () => {
        set({ loading: false });
        displayToast({ type: 'warning', title: 'Deprecated', description: 'Manual payment accounts are deprecated. Use Midtrans.' });
    },
    remove: async (id) => {
        set({ loading: false });
    },
}));
