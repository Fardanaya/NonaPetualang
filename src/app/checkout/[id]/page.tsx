"use client";

import React, { useEffect, useState, use, useMemo } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/components/ui/Section";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ICartItem } from "@/lib/types/schemas/cart";
import CartItem from "@/components/utils/Cart/CartItem";

import { displayToast } from "@/lib/utils";
import { fromDate } from "@internationalized/date";
import { CatalogCalendar } from "@/components/ui/Calendar";
import AddonCard from "@/components/ui/Card/AddOn";
import { Input, Modal, Chip, Autocomplete } from "@/components/ui/heroui";
import moment from "moment";
import {
  Accordion,
  AccordionItem,
  cn,
  Divider,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Radio,
  RadioGroup,
  ScrollShadow,
  useDisclosure,
  AutocompleteItem,
} from "@heroui/react";
import Image from "next/image";
import {
  FaUser,
  FaAngleRight,
  FaBox,
  FaCalendar,
  FaCalendarPlus,
  FaCalendarXmark,
  FaMinus,
  FaTent,
  FaTrash,
  FaPlus,
  FaWarehouse,
} from "react-icons/fa6";
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaShippingFast } from "react-icons/fa";
import { IoTicket } from "react-icons/io5";
import { LuMapPin } from "react-icons/lu";
import { createOrUpdateTransaction as createTransaction } from "@/lib/actions/transaction";
import { createTransactionItems } from "@/lib/actions/transaction-items";
import { removeFromCart as removeFromCartAction } from "@/lib/actions/cart";
import { sendNotification } from "@/lib/actions/notification";
import { supabaseClient } from "@/lib/supabase/client";
import { useBookedDatesForCatalogItems, useBookedDatesForAccessoryItems } from "@/hooks/react-query/transaction";
import { useCreateOrUpdateAddress } from "@/hooks/react-query/address";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, defaultAddress, IAddress } from "@/lib/types/schemas/address";
import { useDebounce } from "use-debounce";
import { fetchAddressSuggestions } from "@/lib/fetch";
import { IAccessory } from "@/lib/types/schemas/accessory";
import { useGenericAccessories, useAllAccessories } from "@/hooks/react-query/accessories";
import { useApplyVoucher } from "@/hooks/react-query/user_vouchers";
import { calcRentalPrice } from "@/lib/utils";

interface CheckoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Addons {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface SelectedAccessory {
  id: string;
  name: string;
  price: number;
  catalog_id: string | null;
  additional_day_price?: number;
  images?: string[];
  cart_id?: string; // Original cart item ID for removal after checkout
}

const AddressRadio = ({
  children,
  description,
  value = "",
  ...props
}: {
  children: React.ReactNode;
  description: React.ReactNode;
  value?: string;
  [key: string]: any;
}) => {
  return (
    <Radio
      {...props}
      value={value}
      classNames={{
        base: cn(
          "inline-flex max-w-full m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
        labelWrapper: "w-full",
        label: "font-semibold text-sm md:text-medium",
      }}
    >
      {children}
    </Radio>
  );
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ params }) => {
  const { id } = use(params);
  const router = useRouter();


  // States
  // checkout items untuk catalog dan accessories
  const [checkoutItems, setCheckoutItems] = useState<ICartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);
  const [addonsSelected, setAddonsSelected] = useState<Addons[]>([]);
  const [accessoriesSelected, setAccessoriesSelected] = useState<SelectedAccessory[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [availableAccessories, setAvailableAccessories] = useState<any[]>([]);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discount, setDiscount] = useState<any>(null);
  const [discountApplicableCatalogIds, setDiscountApplicableCatalogIds] = useState<string[] | null>(null); // null = apply to all
  const { data: genericAccessories } = useGenericAccessories();
  const { data: allAccessories } = useAllAccessories();
  const [dateRange, setDateRange] = useState<{
    start_rent: Date | null;
    end_rent: Date | null;
    additional_day: number;
  }>({
    start_rent: null,
    end_rent: null,
    additional_day: 0,
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add-ons modal disclosure
  const { isOpen: isAddonsOpen, onOpen: onAddonsOpen, onOpenChange: onAddonsOpenChange } = useDisclosure();

  // accessories modal disclosure
  const { isOpen: isAccessoriesOpen, onOpen: onAccessoriesOpen, onOpenChange: onAccessoriesOpenChange } = useDisclosure();

  // Address modal disclosure
  const { isOpen: isAddressOpen, onOpen: onAddressOpen, onOpenChange: onAddressOpenChange } = useDisclosure();

  // Address form state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newAddress, setNewAddress] = useState({
    lat: "",
    lng: "",
    address: "",
  });

  // Address mutation
  const createOrUpdateMutation = useCreateOrUpdateAddress();

  // Voucher mutation
  const applyVoucherMutation = useApplyVoucher();
  const isApplyingVoucher = applyVoucherMutation.isPending;

  // React Hook Form with Zod validation for address
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultAddress,
  });

  const [debouncedSearch] = useDebounce(async (query: string) => {
    if (query.length < 4) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const data = await fetchAddressSuggestions(query);
      if (data.data?.locations) {
        setSuggestions(data.data.locations);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, 1000);

  const formValues = watch();

  // Dynamic import for Map component
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/ui/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  // Handle address modal close
  const handleAddressClose = () => {
    reset(defaultAddress);
    setSuggestions([]);
    onAddressOpenChange();
  };

  // Handle address form submit
  const onAddressSubmit = async (formData: IAddress) => {
    const dataToSubmit = { ...formData, user_id: currentUser?.id };
    if (!dataToSubmit.id) {
      delete dataToSubmit.id;
    }
    try {
      await createOrUpdateMutation.mutateAsync(dataToSubmit);
      handleAddressClose();
      // Reload addresses after creating new one
      await reloadAddresses();
    } catch (error) {
      console.error("Failed to create/update address:", error);
    }
  };

  // Reload addresses function
  const reloadAddresses = async () => {
    const supabase = supabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false) as any;

      if (addressData && addressData.length > 0) {
        setAddresses(addressData);
        // Select the newly created address (first one since ordered by created_at desc)
        setSelectedAddressId(addressData[0].id);
      }
    }
  };

  // Get catalog IDs from checkout items for availability check
  const catalogIds = React.useMemo(() => {
    return checkoutItems
      .filter((item) => item.item_type === 'catalog' && item.item_id)
      .map((item) => item.item_id as string);
  }, [checkoutItems]);

  // Get catalog-specific accessories based on catalog items in checkout
  const catalogAccessories = React.useMemo(() => {
    return (allAccessories || []).filter((acc) =>
      acc.catalog_id && catalogIds.includes(acc.catalog_id)
    );
  }, [allAccessories, catalogIds]);

  // Get selected accessory IDs for availability check
  const selectedAccessoryIds = React.useMemo(() => {
    return accessoriesSelected.map((acc) => acc.id);
  }, [accessoriesSelected]);

  // Fetch booked dates for the catalog items
  const { data: bookedCatalogTransactions } = useBookedDatesForCatalogItems(catalogIds);

  // Fetch booked dates for selected accessories
  const { data: bookedAccessoryTransactions } = useBookedDatesForAccessoryItems(selectedAccessoryIds);

  // Build a list of unavailable dates from booked transactions (catalogs + accessories)
  const unavailableDates = React.useMemo(() => {
    const allBookedTransactions = [
      ...(bookedCatalogTransactions || []),
      ...(bookedAccessoryTransactions || []),
    ];

    if (allBookedTransactions.length === 0) return [];

    const datesSet = new Set<string>();
    const dates: Date[] = [];

    allBookedTransactions.forEach((transaction: any) => {
      const start = moment(transaction.start_rent).startOf('day');
      const end = moment(transaction.end_rent).startOf('day');

      // Add all dates in the range
      let current = start.clone();
      while (current.isSameOrBefore(end)) {
        const dateKey = current.format('YYYY-MM-DD');
        // Use Set to avoid duplicates
        if (!datesSet.has(dateKey)) {
          datesSet.add(dateKey);
          dates.push(current.toDate());
        }
        current.add(1, 'day');
      }
    });

    return dates;
  }, [bookedCatalogTransactions, bookedAccessoryTransactions]);

  // Check if a date is unavailable (booked or in the past)
  const isDateUnavailable = React.useCallback((date: any) => {
    const today = moment().startOf('day');
    const checkDate = moment(date.toDate("Asia/Jakarta")).startOf('day');

    // Past dates are unavailable
    if (checkDate.isBefore(today)) {
      return true;
    }

    // Check if date is in booked dates
    return unavailableDates.some((bookedDate) =>
      moment(bookedDate).isSame(checkDate, 'day')
    );
  }, [unavailableDates]);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const supabase = supabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single() as any;

        setCurrentUser(userData);

        // Load addresses
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', false) as any;

        if (addressData && addressData.length > 0) {
          setAddresses(addressData);
          setSelectedAddressId(addressData[0].id);
        }
      }
    };

    loadUser();
  }, []);

  // Load add-ons
  useEffect(() => {
    const loadAddons = async () => {
      const supabase = supabaseClient();
      const { data } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_deleted', false) as any;

      if (data) {
        setAvailableAddons(data);
      }
    };

    loadAddons();
  }, []);

  // Load checkout session
  useEffect(() => {
    const sessionData = sessionStorage.getItem(id);

    if (!sessionData) {
      displayToast({
        type: "danger",
        title: "Session Expired",
        description: "Checkout session not found or expired.",
      });
      router.push("/catalog");
      return;
    }

    try {
      const { items, timestamp, dateRange: sessionDateRange, accessoriesSelected: sessionAccessories } = JSON.parse(sessionData);

      // Check if session is expired (more than 1 hour old)
      const now = Date.now();
      if (now - timestamp > 3600000) {
        sessionStorage.removeItem(id);
        displayToast({
          type: "danger",
          title: "Session Expired",
          description: "Checkout session has expired.",
        });
        router.push("/catalog");
        return;
      }

      setCheckoutItems(items);

      // Detect if this is a direct checkout (item ID starts with "direct_")
      const isDirect = items.some((item: any) => item.id?.toString().startsWith("direct_"));
      setIsDirectCheckout(isDirect);

      // If date range was passed from direct checkout, apply it
      if (sessionDateRange && sessionDateRange.start_rent && sessionDateRange.end_rent) {
        setDateRange({
          start_rent: new Date(sessionDateRange.start_rent),
          end_rent: new Date(sessionDateRange.end_rent),
          additional_day: 0,
        });
      }

      // Separate accessories from items and move them to accessoriesSelected
      // This handles the case when checkout comes from cart or direct checkout
      const catalogItemIds = items
        .filter((item: any) => item.item_type === 'catalog')
        .map((item: any) => item.item_id || item.catalog?.id);

      // Find accessories with catalog_id that matches a catalog in checkout
      const accessoryItemsWithCatalogId = items.filter((item: any) =>
        item.item_type === 'accessory' &&
        item.accessory?.catalog_id &&
        catalogItemIds.includes(item.accessory.catalog_id)
      );

      // Find accessories without catalog_id (generic accessories / Aksesoris Umum)
      const genericAccessoryItems = items.filter((item: any) =>
        item.item_type === 'accessory' &&
        !item.accessory?.catalog_id
      );

      const allAccessoryItemsToMove = [...accessoryItemsWithCatalogId, ...genericAccessoryItems];

      // Convert accessory items from cart to SelectedAccessory format
      const convertedAccessories: SelectedAccessory[] = allAccessoryItemsToMove.map((item: any) => ({
        id: item.item_id || item.accessory?.id,
        name: item.accessory?.name || '',
        price: item.accessory?.price || 0,
        catalog_id: item.accessory?.catalog_id || null,
        additional_day_price: item.accessory?.additional_day_price || 0,
        images: item.accessory?.images || [],
        cart_id: item.id, // Store original cart ID for removal after checkout
      }));

      // Combine session accessories with converted accessories from cart items
      // Use a Map to deduplicate by id
      const accessoriesFromSession = (sessionAccessories || []) as SelectedAccessory[];
      const allAccessoriesToMerge = [...accessoriesFromSession, ...convertedAccessories];

      // Deduplicate by id using an object (safer typing than Map)
      const seenIds: Record<string, boolean> = {};
      const deduplicatedAccessories: SelectedAccessory[] = [];

      for (const acc of allAccessoriesToMerge) {
        if (acc.id && !seenIds[acc.id]) {
          seenIds[acc.id] = true;
          deduplicatedAccessories.push(acc);
        }
      }

      // Set deduplicated accessories (replace, don't append to avoid hot-reload duplication)
      setAccessoriesSelected(deduplicatedAccessories);

      // Remove all accessories from checkout items
      if (allAccessoryItemsToMove.length > 0) {
        const filteredItems = items.filter((item: any) => item.item_type !== 'accessory');
        setCheckoutItems(filteredItems);
      }

      console.log("Setting accessories from session:", accessoriesFromSession);
      console.log("Moved accessories from cart items:", convertedAccessories);
      console.log("Final deduplicated accessories:", deduplicatedAccessories);

      console.log("Checkout items loaded:", items);
      console.log("Accessories loaded:", sessionAccessories);
    } catch (error) {
      console.error("Failed to parse checkout session:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Failed to load checkout data.",
      });
      router.push("/catalog");
      return;
    }

    setIsLoading(false);
  }, [id, router]);

  // Cleanup on page unload
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem(id);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [id]);

  // Price calculation
  const getRentDays = () => {
    let diffDays = 1;
    if (dateRange.start_rent && dateRange.end_rent) {
      const startDate = moment(dateRange.start_rent).startOf("day");
      const endDate = moment(dateRange.end_rent).startOf("day");
      diffDays = endDate.diff(startDate, "days") + 1;
    }
    const additionalDays = Number(dateRange.additional_day) || 0;
    const totalDays = (diffDays > 0 ? diffDays : 1) + additionalDays;
    return totalDays > 0 ? totalDays : 1;
  };

  const getSubtotalItems = () => {
    const days = getRentDays();
    return checkoutItems.reduce((total, item) => {
      let itemPrice = 0;
      if (item.item_type === 'catalog' && item.catalog) {
        itemPrice = calcRentalPrice(
          item.catalog.price_per_day || (item.catalog as any).price || 0,
          item.catalog.prices,
          days
        );
      } else if (item.item_type === 'accessory' && item.accessory) {
        itemPrice = (item.accessory.price || 0) * days;
      }
      return total + itemPrice;
    }, 0);
  };

  const getSubtotalAdditionalDay = () => 0;

  const getSubtotalAddons = () =>
    addonsSelected.reduce(
      (sum, addon) =>
        sum + (Number(addon.price) || 0) * (Number(addon.quantity) || 1),
      0
    );

  const getSubtotalAccessories = () => {
    const days = getRentDays();
    return accessoriesSelected.reduce(
      (sum, acc) => sum + (Number(acc.price) || 0) * days,
      0
    );
  };

  const getSubtotalAccessoriesAdditionalDay = () => 0;

  const getSubtotalDiscount = () => {
    if (!discount) return 0;

    // Calculate subtotal for discount based on applicability
    let subtotalForDiscount = 0;

    if (discountApplicableCatalogIds === null) {
      // Global voucher - apply to all items
      subtotalForDiscount =
        getSubtotalItems() +
        getSubtotalAdditionalDay() +
        getSubtotalAddons() +
        getSubtotalAccessories() +
        getSubtotalAccessoriesAdditionalDay();
    } else {
      // Voucher only applies to specific catalog items
      // Calculate subtotal only for applicable catalog items
      const applicableItems = checkoutItems.filter(item => {
        const catalogId = item.item_id || item.catalog?.id;
        return item.item_type === 'catalog' && catalogId && discountApplicableCatalogIds.includes(catalogId);
      });

      const days = getRentDays();
      // Subtotal of applicable items (base price)
      const applicableItemsSubtotal = applicableItems.reduce((total, item) => {
        let itemPrice = 0;
        if (item.item_type === 'catalog' && item.catalog) {
           itemPrice = calcRentalPrice(
             item.catalog.price_per_day || (item.catalog as any).price || 0,
             item.catalog.prices,
             days
           );
        } else if (item.item_type === 'accessory' && item.accessory) {
           itemPrice = (item.accessory.price || 0) * days;
        }
        return total + itemPrice;
      }, 0);

      subtotalForDiscount = applicableItemsSubtotal;
    }

    if (subtotalForDiscount === 0) return 0;

    if (discount.discount_type === 'percentage') {
      return Math.floor((subtotalForDiscount * (discount.discount_value || 0)) / 100);
    } else {
      // Fixed amount
      return Math.min(discount.discount_value || 0, subtotalForDiscount);
    }
  };

  const getTotal = () =>
    getSubtotalItems() +
    getSubtotalAdditionalDay() +
    getSubtotalAddons() +
    getSubtotalAccessories() +
    getSubtotalAccessoriesAdditionalDay() -
    getSubtotalDiscount();

  // Handle checkout
  const handleCompleteCheckout = async () => {
    if (!dateRange.start_rent || !dateRange.end_rent) {
      displayToast({
        type: "danger",
        title: "Error",
        description: "Tanggal mulai dan tanggal selesai tidak boleh kosong",
      });
      return;
    }

    if (shippingMethod === "delivery" && !selectedAddressId) {
      displayToast({
        type: "danger",
        title: "Error",
        description: "Silakan pilih alamat pengiriman",
      });
      return;
    }

    setCheckoutCompleted(true);
    setIsLoading(true);

    try {
      const supabase = supabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Create transaction
      const transactionData = {
        user_id: user.id,
        address_id: shippingMethod === "delivery" ? selectedAddressId : null,
        vouchers_id: discount?.id || null,
        status: "pending",
        start_rent: dateRange.start_rent.toISOString(),
        end_rent: dateRange.end_rent.toISOString(),
        total_price: getTotal(),
        final_price: getTotal(),
      };

      const createdTransaction = await createTransaction(transactionData);

      if (!createdTransaction || !createdTransaction.id) {
        throw new Error("Failed to create transaction");
      }

      // Create transaction items for each cart item
      // rental_days is the base package days, additional_days is the extra days
      const additionalDays = dateRange.additional_day || 0;

      const catalogTransactionItems = checkoutItems.map((item) => {
        let price = 0;
        if (item.item_type === 'catalog' && item.catalog) {
           price = calcRentalPrice(item.catalog.price_per_day || 0, item.catalog.prices, item.rental_days)
             + (item.catalog.price_per_day || 0) * additionalDays;
        } else if (item.item_type === 'accessory' && item.accessory) {
           price = (item.accessory.price || 0) * (item.rental_days + additionalDays);
        }
        return {
          transaction_id: createdTransaction.id,
          item_type: item.item_type,
          item_id: item.item_id || item.catalog?.id || item.accessory?.id,
          selected_size: item.selected_size,
          rental_days: item.rental_days,
          additional_days: additionalDays,
          price: price,
        };
      });

      // Create transaction items for selected accessories
      const accessoryTransactionItems = accessoriesSelected.map((acc) => ({
        transaction_id: createdTransaction.id,
        item_type: 'accessory' as const,
        item_id: acc.id,
        selected_size: undefined,
        rental_days: checkoutItems[0]?.rental_days || 1,
        additional_days: additionalDays,
        price: acc.price,
      }));

      const transactionItems = [...catalogTransactionItems, ...accessoryTransactionItems];

      await createTransactionItems(transactionItems);

      // Handle add-ons if any
      if (addonsSelected.length > 0) {
        // Update addon stock
        for (const addon of addonsSelected) {
          const currentAddon = availableAddons.find(a => a.id === addon.id);
          if (currentAddon) {
            await (supabase
              .from('add_ons') as any)
              .update({ stock: currentAddon.stock - addon.quantity })
              .eq('id', addon.id);
          }

          // Create transaction addon record
          await (supabase
            .from('transaction_addons') as any)
            .insert({
              transaction_id: createdTransaction.id,
              add_on_id: addon.id,
              qty: addon.quantity,
              price: addon.price,
            });
        }
      }

      // Handle voucher/discount usage
      if (discount && discount.id) {
        await (supabase
          .from('user_vouchers') as any)
          .insert({
            user_id: user.id,
            vouchers_id: discount.id,
            usage_count: 1,
          });
      }

      // Remove items from cart (only for non-direct checkout items)
      const cartItemsToRemove = checkoutItems.filter(
        (item) => item.id && !item.id.toString().startsWith("direct_")
      );

      // Also collect cart IDs from accessories that came from cart
      const accessoryCartIdsToRemove = accessoriesSelected
        .filter((acc) => acc.cart_id && !acc.cart_id.toString().startsWith("direct_"))
        .map((acc) => acc.cart_id!);

      const allCartIdsToRemove = [
        ...cartItemsToRemove.map((item) => item.id!),
        ...accessoryCartIdsToRemove,
      ];

      if (allCartIdsToRemove.length > 0) {
        // Use Promise.allSettled to ensure all removals are attempted
        // even if some fail, and don't block the checkout redirect
        await Promise.allSettled(
          allCartIdsToRemove.map((cartId) =>
            removeFromCartAction(cartId)
          )
        );
      }

      // Clear session
      sessionStorage.removeItem(id);

      displayToast({
        type: "success",
        title: "Checkout Complete",
        description: "Pesanan berhasil dibuat!",
      });

      console.log("Transaction created successfully:", createdTransaction);

      // Send notification to admin about new order
      await sendNotification({
        data: {
          status: "pending",
          payload: {
            ...createdTransaction,
            user: currentUser,
            catalog: checkoutItems[0]?.catalog,
          },
        },
      });

      // Redirect to order page - use window.location for reliable redirect after server action
      window.location.href = `/order/${createdTransaction.id}`;
    } catch (error: any) {
      console.error("Checkout error:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: error.message || "Gagal membuat transaksi sewa",
      });
      setCheckoutCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCheckout = () => {
    sessionStorage.removeItem(id);
    router.push("/cart");
  };

  if (isLoading) {
    return (
      <Section className="px-4 py-3">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Section>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Section className="px-4 py-3">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Checkout Session Expired</h1>
          <p className="text-default-500 mb-4">
            The checkout session is no longer available.
          </p>
          <Button color="primary" onPress={() => router.push("/cart")}>
            Back to Cart
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <div className="py-4 px-4 md:px-8 lg:px-16 max-w-5xl mx-auto flex flex-col gap-3">
      {/* User Info & Shipping Section */}
      <Section className="px-4 py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaUser className="text-primary" />
            <p>Penyewa / Penerima</p>
          </div>
          <div className="pl-6">
            <p className="font-medium text-sm">
              {currentUser?.full_name || currentUser?.name || "-"}
            </p>
            <p className="text-xs text-default-500">
              {currentUser?.phone_whatsapp || "-"}
            </p>
          </div>
        </div>

        {/* Shipping Method Section */}
        <div className="flex flex-col gap-3 pt-3 border-t border-default-100">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaShippingFast className="text-primary" />
            <p>Metode Pengiriman</p>
          </div>
          <div className="flex gap-4 pl-6">
            <Button
              className={`flex-1 font-semibold text-xs md:text-sm h-9 md:h-10 rounded-lg transition-all ${shippingMethod === "delivery" ? "bg-primary text-white shadow-sm" : "bg-default-100 text-default-600 hover:bg-default-200"}`}
              onPress={() => setShippingMethod("delivery")}
            >
              Diantar ke Alamat
            </Button>
            <Button
              className={`flex-1 font-semibold text-xs md:text-sm h-9 md:h-10 rounded-lg transition-all ${shippingMethod === "pickup" ? "bg-primary text-white shadow-sm" : "bg-default-100 text-default-600 hover:bg-default-200"}`}
              onPress={() => setShippingMethod("pickup")}
            >
              Ambil Sendiri (Pickup)
            </Button>
          </div>
        </div>

        {/* Conditional Address or Pickup Location Section */}
        <div className="flex flex-col gap-3 pt-3 border-t border-default-100">
          {shippingMethod === "delivery" ? (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FaMapMarkerAlt className="text-primary" />
                <p>Alamat Pengiriman</p>
              </div>
              {addresses.length === 0 ? (
                <Button
                  onPress={() => {
                    reset(defaultAddress);
                    onAddressOpen();
                  }}
                  aria-label="Tambah Alamat"
                  variant="flat"
                  color="primary"
                  className="ml-6"
                >
                  <FaPlus /> Tambah Alamat
                </Button>
              ) : (
                <div className="pl-6">
                  <Accordion>
                    <AccordionItem
                      classNames={{ trigger: "py-0" }}
                      key="address"
                      aria-label="Address"
                      indicator={<FaAngleRight className="text-primary" />}
                      title={
                        <p className="font-semibold text-sm md:text-medium">
                          {addresses.find(a => a.id === selectedAddressId)?.label || "Pilih Alamat Pengiriman"}
                        </p>
                      }
                      subtitle={
                        selectedAddressId ? (
                          <div className="text-[0.6rem] md:text-xs">
                            <p className="font-semibold">
                              {addresses.find(a => a.id === selectedAddressId)?.address}
                            </p>
                            <p className="font-medium">
                              {addresses.find(a => a.id === selectedAddressId)?.address_details}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-danger font-medium">Alamat belum dipilih</p>
                        )
                      }
                    >
                      <RadioGroup
                        isRequired
                        value={selectedAddressId}
                        onValueChange={(value) => setSelectedAddressId(value)}
                      >
                        {addresses.map((address) => (
                          <AddressRadio
                            description={
                              <div className="text-[0.6rem] md:text-xs">
                                <p className="font-semibold">
                                  {address.address}
                                </p>
                                <p className="font-medium">
                                  {address.address_details}
                                </p>
                              </div>
                            }
                            value={address.id}
                            key={address.id}
                          >
                            {address.label}
                          </AddressRadio>
                        ))}
                      </RadioGroup>
                      <Button
                        className="mt-3"
                        fullWidth
                        variant="flat"
                        color="primary"
                        startContent={<LuMapPin size={16} />}
                        onPress={() => {
                          reset(defaultAddress);
                          onAddressOpen();
                        }}
                      >
                        Tambah Alamat Baru
                      </Button>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FaWarehouse className="text-primary" />
                <p>Lokasi Pengambilan (Pickup)</p>
              </div>
              <div className="pl-6 flex flex-col gap-1.5">
                <p className="font-semibold text-sm text-default-800">Gudang Utama Nona Petualang</p>
                <p className="text-xs text-default-600 leading-relaxed">
                  Jl. Veteran No. 123, Pasir Kaliki, Kec. Cicendo, Kota Bandung, Jawa Barat 40171
                </p>
                <p className="text-xs text-default-500 font-medium">
                  Jam Operasional: Senin - Minggu (08.00 - 20.00 WIB)
                </p>
                <div className="text-[10px] md:text-xs text-warning-700 bg-warning-50 border border-warning-100 rounded-lg p-2.5 mt-1 font-medium leading-relaxed">
                  <strong>Penting:</strong> Silakan ambil barang sewa Anda tepat waktu setelah status pesanan Anda dikonfirmasi oleh Admin. Bawa kartu identitas (KTP/SIM) asli saat pengambilan di gudang.
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Items Section */}
      <Section className="px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaTent className="text-primary" />
            <p>Item Rental</p>
          </div>
          <Chip size="sm" variant="flat" color="primary">
            {checkoutItems.length} item
          </Chip>
        </div>
        <div className="space-y-2">
          {checkoutItems.map((item) => {
            // Get selected accessories for this specific catalog item
            const catalogItemId = item.item_id || item.catalog?.id;
            const itemAccessories = accessoriesSelected.filter(
              (acc) => acc.catalog_id === catalogItemId
            );

            return (
              <div key={item.id} className="flex flex-col gap-2">
                <CartItem item={item} showRemoveButton={false} overrideRentalDays={getRentDays()} />

                {/* Accessories for this catalog item */}
                {itemAccessories.length > 0 && (
                  <div className="ml-4 flex flex-col gap-1">
                    {itemAccessories.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-primary-50 border border-primary-100"
                      >
                        {acc.images && acc.images.length > 0 && (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={acc.images[0]}
                              alt={acc.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{acc.name}</p>
                          <p className="text-xs text-primary font-semibold">
                            Rp {acc.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => {
                            setAccessoriesSelected((prev) =>
                              prev.filter((a) => a.id !== acc.id)
                            );
                          }}
                        >
                          <FaTrash className="text-xs" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </Section>

      {/* Calendar and Add-ons Section */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Calendar Section */}
        <Section className="px-4 py-4 flex flex-col gap-3 md:w-[45%]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaCalendar className="text-primary" />
            <p>Tanggal Pemakaian</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="mx-auto">
              <div className="flex flex-col items-center mb-2">
                <p className="font-semibold text-sm md:text-base text-primary">
                  Pilih Tanggal Rental
                </p>
              </div>
              <CatalogCalendar
                isDateUnavailable={isDateUnavailable}
                date={
                  dateRange.start_rent && dateRange.end_rent
                    ? {
                      start: fromDate(
                        new Date(dateRange.start_rent),
                        "Asia/Jakarta"
                      ),
                      end: fromDate(
                        new Date(dateRange.end_rent),
                        "Asia/Jakarta"
                      ),
                    }
                    : undefined
                }
                onRangeChange={(range) => {
                  if (range && range.start && range.end) {
                    const startDate = range.start.toDate("Asia/Jakarta");
                    const endDate = range.end.toDate("Asia/Jakarta");
                    setDateRange({
                      start_rent: startDate,
                      end_rent: endDate,
                      additional_day: 0,
                    });
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1 md:gap-2 w-full">
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                  <p className="font-semibold text-default-900">Start</p>
                  <p className="font-medium text-default-900">
                    {dateRange.start_rent
                      ? new Date(dateRange.start_rent).toDateString()
                      : "-"}
                  </p>
                </div>
                <FaCalendarAlt className="text-primary text-medium md:text-xl" />
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
                  <p className="font-semibold text-default-900">End</p>
                  <p className="font-medium text-default-900">
                    {dateRange.end_rent
                      ? new Date(dateRange.end_rent).toDateString()
                      : "-"}
                  </p>
                </div>
                <FaCalendarXmark className="text-primary text-medium md:text-xl" />
              </div>

            </div>
          </div>
        </Section>

      </div>





      {/* Voucher Section */}
      <Section className="px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <IoTicket className="text-primary" />
          <span>Kode Voucher</span>
        </div>
        <div className="flex flex-row gap-2 items-center">
          {!discount ? (
            <>
              <Input
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onValueChange={setVoucherCode}
                size="md"
              />
              <Button
                color="primary"
                className="font-semibold px-4 py-2 rounded-lg"
                isLoading={isApplyingVoucher}
                isDisabled={!voucherCode.trim()}
                onPress={async () => {
                  if (!voucherCode.trim()) {
                    displayToast({
                      type: "danger",
                      title: "Error",
                      description: "Masukkan kode voucher",
                    });
                    return;
                  }

                  const checkoutCatalogIds = checkoutItems
                    .filter(item => item.item_type === 'catalog')
                    .map(item => item.item_id || item.catalog?.id)
                    .filter(Boolean) as string[];

                  const result = await applyVoucherMutation.mutateAsync({
                    code: voucherCode,
                    userId: currentUser?.id,
                    catalogIds: checkoutCatalogIds,
                  });

                  if (result.success && result.voucher) {
                    setDiscount(result.voucher);
                    setDiscountApplicableCatalogIds(result.applicableCatalogIds ?? null);
                    setVoucherCode("");
                    displayToast({
                      type: "success",
                      title: "Voucher Diterapkan",
                      description: `Voucher ${result.voucher.code} berhasil diterapkan!`,
                    });
                  } else {
                    displayToast({
                      type: "danger",
                      title: "Voucher Tidak Valid",
                      description: result.error || "Gagal menerapkan voucher",
                    });
                  }
                }}
              >
                Terapkan
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <Chip color="success" variant="flat" size="sm">
                  {discount?.code}
                </Chip>
                <Chip color="primary" variant="flat" size="sm">
                  {discount?.discount_type === 'percentage'
                    ? `Diskon ${discount?.discount_value}%`
                    : `Potongan Rp ${(discount?.discount_value || 0).toLocaleString('id-ID')}`
                  }
                </Chip>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setDiscount(null);
                    setDiscountApplicableCatalogIds(null);
                  }}
                >
                  Batalkan
                </Button>
              </div>
              <p className="text-sm text-success font-medium">
                Hemat: Rp {getSubtotalDiscount().toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Payment Summary */}
      <Section className="px-4 py-4 flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <IoTicket className="text-primary" />
          <p>Rincian Pembayaran</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col text-default-800 gap-2">
            {getSubtotalItems() > 0 && (
              <div className="flex flex-col">
                <div className="flex flex-row justify-between text-sm md:text-medium font-medium">
                  <p>Subtotal Items</p>
                  <p>Rp {getSubtotalItems().toLocaleString("id-ID")}</p>
                </div>
                <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-primary/20">
                  {checkoutItems.map((item) => {
                    const days = getRentDays();
                    let itemPrice = 0;
                    let breakdownText = "";
                    const itemData = item.catalog || item.accessory;
                    const itemName = itemData?.name || "";

                    if (item.item_type === 'catalog' && item.catalog) {
                       const pricePerDay = item.catalog.price_per_day || 0;
                       const packages = item.catalog.prices;
                       
                       itemPrice = calcRentalPrice(pricePerDay, packages, days);

                       if (packages && packages.length > 0) {
                         const sorted = [...packages].sort((a, b) => a.days - b.days);
                         let bestPkg: { days: number; price: number } | null = null;
                         for (const pkg of sorted) {
                           if (pkg.days <= days) {
                             bestPkg = pkg;
                           }
                         }

                         if (bestPkg) {
                           const extraDays = days - bestPkg.days;
                           const pkgPrice = bestPkg.price;
                           const extraPrice = extraDays * pricePerDay;
                           if (extraDays > 0) {
                             breakdownText = `Paket ${bestPkg.days} Hari (Rp ${pkgPrice.toLocaleString("id-ID")}) + ${extraDays} Hari Tambahan (Rp ${extraPrice.toLocaleString("id-ID")})`;
                           } else {
                             breakdownText = `Paket ${bestPkg.days} Hari (Rp ${pkgPrice.toLocaleString("id-ID")})`;
                           }
                         } else {
                           breakdownText = `${days} Hari x Rp ${pricePerDay.toLocaleString("id-ID")}/hari`;
                         }
                       } else {
                         breakdownText = `${days} Hari x Rp ${pricePerDay.toLocaleString("id-ID")}/hari`;
                       }
                    } else if (item.item_type === 'accessory' && item.accessory) {
                       const price = item.accessory.price || 0;
                       itemPrice = price * days;
                       breakdownText = `${days} Hari x Rp ${price.toLocaleString("id-ID")}/hari`;
                    }

                    return (
                      <div key={item.id} className="flex flex-row justify-between text-xs text-default-500">
                        <div className="flex flex-col">
                          <p className="font-medium text-default-600 truncate max-w-[200px] md:max-w-[400px]">{itemName} ({days} Hari)</p>
                          <p className="text-[10px] text-default-400 italic font-normal">{breakdownText}</p>
                        </div>
                        <p className="font-semibold text-default-700">Rp {itemPrice.toLocaleString("id-ID")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Number(dateRange.additional_day) > 0 && (
              <div className="flex flex-row justify-between text-sm md:text-medium">
                <p>
                  Additional Days ({" "}
                  <span className="text-primary">
                    {dateRange.additional_day}
                  </span>{" "}
                  Hari
                  )
                </p>
                <p>
                  Rp {getSubtotalAdditionalDay().toLocaleString("id-ID")}
                </p>
              </div>
            )}

            {addonsSelected.length > 0 && (
              <div className="flex flex-row justify-between text-sm md:text-medium">
                <p>Subtotal Tambahan</p>
                <p>Rp {getSubtotalAddons().toLocaleString("id-ID")}</p>
              </div>
            )}

            {accessoriesSelected.length > 0 && (
              <div className="flex flex-col">
                <div className="flex flex-row justify-between text-sm md:text-medium font-medium">
                  <p>Subtotal Aksesoris</p>
                  <p>Rp {getSubtotalAccessories().toLocaleString("id-ID")}</p>
                </div>
                <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-primary/20">
                  {accessoriesSelected.map((acc) => {
                    const days = getRentDays();
                    const itemPrice = acc.price * days;
                    const breakdownText = `${days} Hari x Rp ${acc.price.toLocaleString("id-ID")}/hari`;
                    return (
                      <div key={acc.id} className="flex flex-row justify-between text-xs text-default-500">
                        <div className="flex flex-col">
                          <p className="font-medium text-default-600 truncate max-w-[200px] md:max-w-[400px]">{acc.name} ({days} Hari)</p>
                          <p className="text-[10px] text-default-400 italic font-normal">{breakdownText}</p>
                        </div>
                        <p className="font-semibold text-default-700">Rp {itemPrice.toLocaleString("id-ID")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {accessoriesSelected.length > 0 && Number(dateRange.additional_day) > 0 && (
              <div className="flex flex-row justify-between text-sm md:text-medium">
                <p>Aksesoris Additional Days</p>
                <p>Rp {getSubtotalAccessoriesAdditionalDay().toLocaleString("id-ID")}</p>
              </div>
            )}

            <div className="flex flex-row justify-between text-sm md:text-medium">
              <p>Subtotal Pengiriman</p>
              {shippingMethod === "pickup" ? (
                <p className="text-success font-semibold text-xs md:text-sm">Ambil Sendiri (Rp 0)</p>
              ) : (
                <p className="text-xs md:text-sm text-default-500">Tunggu Konfirmasi Admin</p>
              )}
            </div>

            {getSubtotalDiscount() > 0 && (
              <div className="flex flex-row justify-between text-sm md:text-medium">
                <p>Voucher Diskon Digunakan</p>
                <p>Rp -{getSubtotalDiscount().toLocaleString("id-ID")}</p>
              </div>
            )}

            <Divider className="my-2 bg-default-100" />

            {getTotal() > 0 && (
              <div className="flex justify-between text-medium md:text-lg text-foreground">
                <p>Total</p>
                <p className="font-semibold text-primary">
                  Rp {getTotal().toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2">
        <Button
          variant="bordered"
          onPress={handleCancelCheckout}
          className="flex-1"
          disabled={checkoutCompleted}
        >
          Batal
        </Button>
        <Button
          color="primary"
          onPress={handleCompleteCheckout}
          className="flex-1"
          disabled={checkoutCompleted}
          isLoading={isLoading}
        >
          {checkoutCompleted ? "Processing..." : "Buat Pesanan"}
        </Button>
      </div>

      {/* Address Modal */}
      <Modal isOpen={isAddressOpen} onOpenChange={handleAddressClose}>
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          {(onClose) => (
            <form onSubmit={handleSubmit(onAddressSubmit)}>
              <ModalHeader>Tambah Alamat Baru</ModalHeader>
              <ModalBody className="overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2">
                    <input type="hidden" {...register("id")} />

                    <Input
                      type="text"
                      label="Label"
                      {...register("label")}
                      errorMessage={errors.label?.message}
                      isInvalid={!!errors.label}
                    />

                    <Input
                      type="text"
                      label="Penerima"
                      {...register("receiver")}
                      errorMessage={errors.receiver?.message}
                      isInvalid={!!errors.receiver}
                    />
                  </div>

                  <Autocomplete
                    label="Cari Kelurahan/Kecamatan"
                    items={suggestions.map((loc) => ({
                      label: loc.name,
                      value: loc.name,
                      description: `${loc.district}, ${loc.city}`,
                    }))}
                    onInputChange={(value) => {
                      if (value.length >= 3) debouncedSearch(value);
                    }}
                    onSelectionChange={(selected) => {
                      const selectedLoc = suggestions.find(loc => loc.name === selected);
                      if (selectedLoc) {
                        setValue("sub_district_id", selectedLoc.sub_district_id);
                        setValue("province", selectedLoc.province);
                        setValue("city", selectedLoc.city);
                        setValue("district", selectedLoc.district);
                        setValue("sub_district", selectedLoc.sub_district);
                        setValue("postal_code", selectedLoc.postal_code);
                      }
                    }}
                    isLoading={loadingSuggestions}
                    startContent={
                      <FaSearch size={16} className="text-primary" />
                    }
                  >
                    {(item) => (
                      <AutocompleteItem key={(item as any).value} description={(item as any).description}>
                        {(item as any).label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  {/* Display auto-filled regional data */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-default-100 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-default-400 uppercase font-semibold">Provinsi</span>
                      <span className="text-sm font-medium">{formValues.province || "-"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-default-400 uppercase font-semibold">Kota/Kab</span>
                      <span className="text-sm font-medium">{formValues.city || "-"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-default-400 uppercase font-semibold">Kecamatan</span>
                      <span className="text-sm font-medium">{formValues.district || "-"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-default-400 uppercase font-semibold">Kelurahan</span>
                      <span className="text-sm font-medium">{formValues.sub_district || "-"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-default-400 uppercase font-semibold">Kode Pos</span>
                      <span className="text-sm font-medium">{formValues.postal_code || "-"}</span>
                    </div>
                  </div>

                  <Input
                    type="text"
                    label="Alamat"
                    placeholder="Jalan, Nomor, RT/RW"
                    {...register("address")}
                    errorMessage={errors.address?.message}
                    isInvalid={!!errors.address}
                  />

                  <Input
                    type="text"
                    label="Patokan"
                    {...register("address_details")}
                    errorMessage={errors.address_details?.message}
                    isInvalid={!!errors.address_details}
                  />

                  <Map
                    init={[
                      getValues("latitude") ?? 0,
                      getValues("longitude") ?? 0,
                    ]}
                    onAddressChange={(address) => {
                      setValue("latitude", parseFloat(address.lat));
                      setValue("longitude", parseFloat(address.lng));
                      setNewAddress(address);
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Batal</Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  Simpan Alamat
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
