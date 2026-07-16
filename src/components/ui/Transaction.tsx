"use client";

// Re-export Transaction component from the new modular structure
// This file is kept for backwards compatibility
import Transaction from "./Transaction/TransactionMain";

export default Transaction;
export { AddressRadio } from "./Transaction/components/AddressRadio";
