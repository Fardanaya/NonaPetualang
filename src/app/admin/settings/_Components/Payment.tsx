// import {
//   Button,
//   Input,
//   Modal,
//   Pagination,
//   Select,
//   Table,
// } from "@/components/ui/heroui";
// import { Section } from "@/components/ui/Section";
// import TableAction from "@/components/ui/Table/Action";
// import TableTitle from "@/components/ui/Table/Title";
// import { useCatalog } from "@/hooks/store/catalog";
// import { useDiscount } from "@/stores/useDiscount";
// import usePagination from "@/stores/usePagination";
// import { usePaymentAccounts } from "@/stores/usePaymentAccounts";
// import { presetPagination } from "@/lib/types/pagination";
// import {
//   Autocomplete,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   SelectItem,
//   TableBody,
//   TableCell,
//   TableColumn,
//   TableHeader,
//   TableRow,
//   useDisclosure,
//   AutocompleteItem,
//   Checkbox,
//   RadioGroup,
//   Radio,
//   Spinner,
// } from "@heroui/react";
// import React, { use, useEffect, useState } from "react";
// import { FaPlus, FaSearch } from "react-icons/fa";
// import { useDebounce } from "use-debounce";

// const PaymentAccountPage = () => {
//   const { isOpen, onOpen, onOpenChange } = useDisclosure();
//   const [loadPage, setLoadPage] = useState(true);

//   const {
//     list: listPaymentAccount,
//     model: modelPaymentAccount,
//     setModel: setModelPaymentAccount,
//     create: createPaymentAccount,
//     remove: removePaymentAccount,
//     getAll: getAllPaymentAccount,
//     loading: loadingPaymentAccount,
//   } = usePaymentAccounts();

//   const {
//     search,
//     setSearch,
//     page,
//     setPage,
//     totalData,
//     setList,
//     filteredList,
//     filter,
//     setPageSize,
//     pageSize,
//   } = usePagination();
//   const [debouncedSearch] = useDebounce(search, 500);

//   useEffect(() => {
//     setLoadPage(false);
//     setList(listPaymentAccount);
//   }, []);

//   useEffect(() => {
//     if (debouncedSearch) {
//       filter((item) =>
//         item.bank_name.toLowerCase().includes(debouncedSearch.toLowerCase())
//       );
//     } else {
//       setList(listPaymentAccount);
//     }
//   }, [debouncedSearch, listPaymentAccount]);

//   useEffect(() => {
//     if (loadPage) {
//       getAllPaymentAccount();
//     }
//   }, [loadPage, getAllPaymentAccount]);

//   return (
//     <div className="flex flex-col gap-4">
//       <Section className="px-4 py-3 space-y-4">
//         <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
//           <TableTitle
//             title="Payment Method"
//             description="List of Payment Method"
//           />
//           <div className="flex flex-row items-center gap-2">
//             <Input
//               type="text"
//               placeholder="Search"
//               startContent={<FaSearch className="text-primary" />}
//               value={search}
//               onValueChange={(e) => setSearch(e)}
//             />
//             <Button
//               onPress={() => {
//                 setModelPaymentAccount({
//                   bank_name: "",
//                   account_name: "",
//                   account_number: "",
//                 });
//                 onOpen();
//               }}
//               color="primary"
//               startContent={<FaPlus />}
//             >
//               Add
//             </Button>
//           </div>
//         </div>
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-row justify-between items-center">
//             <p className="text-xs">
//               Total&nbsp;<span className="font-semibold">{totalData}</span>
//               &nbsp;Payment Method
//             </p>
//             <div className="flex items-center gap-2">
//               <span className="text-xs">Showing</span>
//               <Select
//                 disallowEmptySelection
//                 size="xs"
//                 variant="bordered"
//                 classNames={{ trigger: "bg-default-50" }}
//                 className="w-20"
//                 selectedKeys={[pageSize.toString()]}
//                 onSelectionChange={(keys) => {
//                   const size = Number(Array.from(keys)[0]);
//                   setPageSize(size);
//                 }}
//                 items={presetPagination}
//               >
//                 {(item: any) => (
//                   <SelectItem key={item.key}>{item.label}</SelectItem>
//                 )}
//               </Select>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-2 md:gap-4">
//             <Table aria-label="Payment Method table" color="primary">
//               <TableHeader>
//                 <TableColumn>Nama Bank</TableColumn>
//                 <TableColumn>Nama Akun</TableColumn>
//                 <TableColumn>Nomer Rekening</TableColumn>
//                 <TableColumn className="flex justify-center items-center">
//                   Action
//                 </TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loadingPaymentAccount}
//                 // items={filteredList.slice(
//                 //   (page - 1) * pageSize,
//                 //   page * pageSize
//                 // )}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loadingPaymentAccount ? (
//                   filteredList
//                     .slice((page - 1) * pageSize, page * pageSize)
//                     .map((item) => (
//                       <TableRow key={item.id}>
//                         <TableCell>{item.bank_name}</TableCell>
//                         <TableCell>{item.account_name}</TableCell>
//                         <TableCell>{item.account_number}</TableCell>
//                         <TableCell className="flex flex-row justify-center items-center gap-2">
//                           <TableAction
//                             onUpdate={() => {
//                               setModelPaymentAccount(item);
//                               onOpen();
//                             }}
//                             onDelete={() => removePaymentAccount(item.id)}
//                           />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 ) : (
//                   <> </>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//         <div className="flex items-center justify-end gap-2">
//           <Pagination
//             loop
//             showControls
//             initialPage={1}
//             page={page}
//             total={Math.ceil(totalData / pageSize)}
//             onChange={(newPage) => setPage(newPage)}
//           />
//         </div>
//       </Section>
//       <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader>Add Payment</ModalHeader>
//               <ModalBody>
//                 <Input
//                   label="Nama Bank"
//                   type="text"
//                   value={modelPaymentAccount?.bank_name}
//                   onValueChange={(e) =>
//                     setModelPaymentAccount({
//                       ...modelPaymentAccount,
//                       bank_name: e,
//                     })
//                   }
//                 />
//                 <Input
//                   label="Nama Akun"
//                   type="text"
//                   value={modelPaymentAccount?.account_name}
//                   onValueChange={(e) =>
//                     setModelPaymentAccount({
//                       ...modelPaymentAccount,
//                       account_name: e,
//                     })
//                   }
//                 />
//                 <Input
//                   label="Nomor Rekening"
//                   type="text"
//                   value={modelPaymentAccount?.account_number}
//                   onValueChange={(e) =>
//                     setModelPaymentAccount({
//                       ...modelPaymentAccount,
//                       account_number: e,
//                     })
//                   }
//                 />
//               </ModalBody>
//               <ModalFooter>
//                 <Button onPress={onClose}>Close</Button>
//                 <Button
//                   type="submit"
//                   color="primary"
//                   onPress={() => {
//                     createPaymentAccount();
//                     onClose();
//                   }}
//                 >
//                   {modelPaymentAccount?.id ? "Update" : "Create"}
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default PaymentAccountPage;
