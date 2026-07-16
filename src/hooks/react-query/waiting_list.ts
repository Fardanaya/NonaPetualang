import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrUpdate, getAll, getByCatalog, getById, deleteWaitingList } from '@/lib/actions/waiting_list';
import { displayToast } from "@/lib/utils";

export const useWaitingList = () => {
    return useQuery({
        queryKey: ['waiting_list'],
        queryFn: getAll
    });
};

export const useWaitingListItem = (id: string) => {
    return useQuery({
        queryKey: ['waiting_list', id],
        queryFn: () => getById(id),
        enabled: !!id
    });
};

export const useCatalogWaitingList = (catalogId: string) => {
    return useQuery({
        queryKey: ['waiting_list', 'catalog', catalogId],
        queryFn: () => getByCatalog(catalogId),
        enabled: !!catalogId
    });
};

export const useCreateWaitingList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdate,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['waiting_list'] });
            displayToast({ type: 'success', title: 'Success', description: `Waiting List ${data.name || ''} ${data.id ? 'created' : 'updated'} successfully` });
        },
        onError: (error) => {
            console.error(error);
            displayToast({ type: 'danger', title: 'Error', description: 'Failed add to Waiting List' });
        }
    });
};

export const useDeleteWaitingList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWaitingList,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waiting_list'] });
            displayToast({ type: 'success', title: 'Success', description: 'Waiting List deleted successfully' });
        },
        onError: (error) => {
            console.error(error);
            displayToast({ type: 'danger', title: 'Error', description: 'Failed to delete data Waiting List' });
        }
    });
};
