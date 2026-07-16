import { createOrUpdate, getAll, getById, remove } from '../lib/actions/payment'
import { create } from 'zustand'
import { displayToast } from "@/lib/utils";
import { IPayment } from "@/lib/types/schemas/payment";

interface IPaymentStore {
    loading: boolean
    default: IPayment
    model: IPayment
    list: IPayment[]
    setModel: (model?: any) => void
    getAll: () => void
    getById: (id: string) => void
    create: (silent?: boolean) => any
    remove: (id: string) => void
}

export const usePayment = create<IPaymentStore>((set, get) => ({
    loading: false,
    default: {
        nominal: 0,
        payment_method: undefined,
        proof: ''
    },
    model: {
        nominal: 0,
        payment_method: undefined,
        proof: ''
    },
    list: [],
    setModel: (model) => set({ model: (m => (delete m.xata, m))(!model ? { ...get().default } : Object.keys(model).length === 1 ? { ...get().model, ...model } : { ...model }) }),
    getAll: async () => {
        set({ loading: true });
        try {
            const data = await getAll();
            set({ list: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    getById: async (id) => {
        set({ loading: true });
        try {
            const data = await getById(id);
            set({ model: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    create: async (silent?: boolean) => {
        set({ loading: true });
        try {
            const data = await createOrUpdate(get().model);
            get().getAll();
            get().setModel();
            return data;
        } catch (error) {
            console.error(error);
            if (!silent) {
                displayToast({ type: 'danger', title: 'Error', description: `Gagal ${get().model.id ? 'mengupdate' : 'membuat'} Pembayaran` });
            }
            return null;
        } finally {
            set({ loading: false });
        }
    },
    remove: async (id) => {
        set({ loading: true });
        try {
            await remove(id);
            get().getAll();
            get().setModel();
            displayToast({ type: 'success', title: 'Success', description: 'Berhasil menghapus Pembayaran' });
        } catch (error) {
            console.error(error);
            displayToast({ type: 'danger', title: 'Error', description: 'Gagal menghapus Pembayaran' });
        } finally {
            set({ loading: false });
        }
    }
}))
