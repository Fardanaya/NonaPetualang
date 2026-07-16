"use client";

// Main entry point for Transaction module
// Re-exports the main Transaction component and related utilities

import Transaction from "./TransactionMain";

export default Transaction;
export { AddressRadio } from "./components/AddressRadio";
export { TransactionHeader } from "./components/TransactionHeader";
export { RejectModal, CancelModal } from "./components/Modals";
export { useTransactionLogic } from "./hooks/useTransactionLogic";
export * from "./types";
