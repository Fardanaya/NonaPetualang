import { createOrUpdate, getAll, getById, remove } from '../lib/actions/shipping'
import { create } from 'zustand'
import { displayToast } from "@/lib/utils";
import { IShipping } from "@/lib/types/schemas/shipping";

interface IShippingStore {
    loading: boolean
    default: IShipping
    model: IShipping
    list: IShipping[]
    setModel: (model?: any) => void
    getAll: () => void
    getById: (id: string) => void
    create: (silent?: boolean, data?: any) => any
    remove: (id: string) => void
}

export const useShipping = create<IShippingStore>((set, get) => ({
    loading: false,
    default: {
        expedition: null,
        resi: '',
        price: 0

    },
    model: {
        expedition: null,
        resi: '',
        price: 0
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
    create: async (silent?: boolean, data?: any) => {
        set({ loading: true });
        try {
            const modelToUse = data || get().model;
            const result = await createOrUpdate(modelToUse);
            get().getAll();
            get().setModel();
            return result;
        } catch (error) {
            console.error(error);
            if (!silent) {
                displayToast({ type: 'danger', title: 'Error', description: `Gagal ${get().model.id ? 'mengupdate' : 'membuat'} Pengiriman` });
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
            displayToast({ type: 'success', title: 'Success', description: 'Pengiriman berhasil di hapus' });
        } catch (error) {
            console.error(error);
            displayToast({ type: 'danger', title: 'Error', description: 'Gagal menghapus Pengiriman' });
        } finally {
            set({ loading: false });
        }
    }
}))
