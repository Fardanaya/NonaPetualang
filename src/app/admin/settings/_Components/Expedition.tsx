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
// import { useExpedition } from "@/stores/useExpedition";
// import usePagination from "@/stores/usePagination";
// import { presetPagination } from "@/lib/types/pagination";
// import {
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
//   Checkbox,
//   Spinner,
// } from "@heroui/react";
// import React, { useEffect, useState } from "react";
// import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
// import { useDebounce } from "use-debounce";
// import { validateFileSize } from "@/lib/utils";
// import Image from "next/image";
// import { LuImagePlus, LuImageUp } from "react-icons/lu";
// import { Progress } from "@heroui/react";

// const ExpeditionPage = () => {
//   const { isOpen, onOpen, onOpenChange } = useDisclosure();
//   const [loadPage, setLoadPage] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const { list, model, setModel, create, remove, getAll, loading } =
//     useExpedition();

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
//     setList(list);
//   }, []);

//   useEffect(() => {
//     if (debouncedSearch) {
//       filter((item) =>
//         item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
//       );
//     } else {
//       setList(list);
//     }
//   }, [debouncedSearch, list]);

//   useEffect(() => {
//     if (loadPage) {
//       getAll();
//     }
//   }, [loadPage, getAll]);

//   const handleImageUpload = async (file: File) => {
//     if (!model) return;
//     if (!validateFileSize(file, 2)) return;
//     setUploading(true);
//     if (model.icon) {
//       await handleImageDelete(model.icon, true);
//     }
//     try {
//       const formData = new FormData();
//       formData.append("files", file);
//       formData.append("type", "expedition");
//       formData.append("id", model?.id || "");

//       const uploadResponse = await fetch("/api/tools/image", {
//         method: "POST",
//         credentials: "include",
//         body: formData,
//       }).then(async (response) => {
//         if (!response.ok) {
//           throw new Error("Upload failed");
//         }
//         try {
//           return await response.json();
//         } catch (error) {
//           throw new Error("Invalid response format");
//         }
//       });

//       if (!uploadResponse.success) {
//         throw new Error("Image upload failed");
//       }

//       setModel({ icon: uploadResponse.results[0].url });
//     } catch (error) {
//       console.error("Upload error:", error);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleImageDelete = async (url: string, surpress = false) => {
//     try {
//       const publicId = url.split("/").pop()?.split(".")[0];
//       if (!publicId) return;

//       const response = await fetch("/api/tools/image", {
//         method: "DELETE",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           publicId,
//           type: "expedition",
//           id: model?.id || "",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to delete image: ${response.statusText}`);
//       } else {
//         if (!surpress) setModel({ icon: "" });
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         if (error.name === "AbortError") {
//           console.error("Image deletion timed out");
//         } else {
//           console.error("Error deleting image:", error.message);
//         }
//       } else {
//         console.error("Unknown error occurred during image deletion");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <Section className="px-4 py-3 space-y-4">
//         <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
//           <TableTitle title="Expedition" description="List of Expedition" />
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
//                 setModel();
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
//               &nbsp;Expedition
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
//             <Table aria-label="Expedition table" color="primary">
//               <TableHeader>
//                 <TableColumn>Name</TableColumn>
//                 <TableColumn>Code</TableColumn>
//                 <TableColumn>Icon</TableColumn>
//                 <TableColumn className="flex justify-center items-center">
//                   Action
//                 </TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loading}
//                 // items={filteredList.slice(
//                 //   (page - 1) * pageSize,
//                 //   page * pageSize
//                 // )}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loading ? (
//                   filteredList.map((item) => (
//                     <TableRow key={item.id}>
//                       <TableCell>{item.name}</TableCell>
//                       <TableCell>{item.code}</TableCell>
//                       <TableCell>
//                         {item.icon && (
//                           <Image
//                             src={item.icon}
//                             alt={item.name}
//                             width={40}
//                             height={40}
//                             className="object-cover rounded-md"
//                           />
//                         )}
//                       </TableCell>
//                       <TableCell className="flex flex-row justify-center items-center gap-2">
//                         <TableAction
//                           onUpdate={() => {
//                             setModel(item);
//                             onOpen();
//                           }}
//                           onDelete={() => remove(item.id)}
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <></>
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
//               <ModalHeader>Add Expedition</ModalHeader>
//               <ModalBody>
//                 <Input
//                   label="Name"
//                   type="text"
//                   value={model?.name}
//                   onValueChange={(e) => setModel({ ...model, name: e })}
//                 />
//                 <Input
//                   label="Code"
//                   type="text"
//                   value={model?.code}
//                   onValueChange={(e) => setModel({ ...model, code: e })}
//                 />
//                 <div>
//                   <p className="text-sm font-medium">Icon</p>
//                   {model?.icon ? (
//                     <div className="relative aspect-square h-[120px] w-[120px]">
//                       <Image
//                         src={model.icon}
//                         alt={`Preview Icon`}
//                         fill
//                         className="object-cover rounded-md"
//                       />
//                       <Button
//                         isIconOnly
//                         size="sm"
//                         variant="faded"
//                         onPress={() => {
//                           if (model?.icon) handleImageDelete(model.icon);
//                         }}
//                         className="absolute top-1 right-1"
//                       >
//                         <FaTrash className="text-primary" />
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="relative flex justify-center items-center h-[120px] w-[120px] rounded-lg bg-default-200 hover:bg-primary/10 transition border-dashed border-2 border-primary">
//                       <div className="absolute flex flex-col justify-center items-center gap-2 w-full h-full top-0 left-0">
//                         {uploading ? (
//                           <div className="flex flex-col justify-center items-center gap-2 w-1/2">
//                             <LuImageUp className="text-primary" size={43} />
//                             <Progress
//                               color="primary"
//                               radius="sm"
//                               size="sm"
//                               isIndeterminate
//                             />
//                           </div>
//                         ) : (
//                           <LuImagePlus className="text-primary" size={43} />
//                         )}
//                       </div>
//                       <input
//                         type="file"
//                         name="images"
//                         accept="image/*"
//                         disabled={uploading}
//                         onChange={(e) => {
//                           const file = e.target.files?.[0];
//                           if (file) {
//                             handleImageUpload(file);
//                             e.target.value = "";
//                           }
//                         }}
//                         className={`h-full w-full opacity-0 cursor-pointer ${
//                           uploading ? "cursor-not-allowed" : ""
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </div>
//                 <Input
//                   label="Track URL"
//                   type="text"
//                   value={model?.track_url}
//                   onValueChange={(e) => setModel({ ...model, track_url: e })}
//                 />
//               </ModalBody>
//               <ModalFooter>
//                 <Button onPress={onClose}>Close</Button>
//                 <Button
//                   type="submit"
//                   color="primary"
//                   onPress={() => {
//                     create();
//                     onClose();
//                   }}
//                 >
//                   {model?.id ? "Update" : "Create"}
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// };

// export default ExpeditionPage;
