export interface ITempShipping {
    expedition: any;
    resi: string;
    price: number;
}

export interface Addons {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface TransactionProps {
    type: "admin" | "user";
}

export interface ShippingSectionProps {
    type: "admin" | "user";
    model: any;
    tempShipping: ITempShipping;
    setTempShipping: (value: ITempShipping) => void;
    listExpedition: any[];
    loadingExpedition: boolean;
    onSubmit: () => void;
    loading: boolean;
    shippingData: any;
    trackingSteps: any[];
    label: string;
}

export interface PaymentSectionProps {
    type: "admin" | "user";
    model: any;
    paymentType: "full" | "dp";
    setPaymentType: (value: "full" | "dp") => void;
    onSubmitPayment: () => void;
    DPAmount: number;
    settlementAmount: number;
    setSettlementAmount: (value: number) => void;
}

export interface OrderDetailsProps {
    model: any;
    listAddon: any[];
    addonsSelected: Addons[];
    onOpenAddons: () => void;
    type: "admin" | "user";
    getSubtotalCostume: () => number;
    getSubtotalAdditionalDay: () => number;
    getSubtotalAddons: () => number;
    getSubtotalShipping: () => number;
    getSubtotalDiscount: () => number;
    getTotal: () => number;
}

export interface ModalsProps {
    isOpenReject: boolean;
    onOpenChangeReject: (open: boolean) => void;
    rejectReason: string;
    setRejectReason: (value: string) => void;
    onReject: () => void;
    isOpenCancel: boolean;
    onOpenChangeCancel: (open: boolean) => void;
    cancelReason: string;
    setCancelReason: (value: string) => void;
    onCancel: () => void;
}
