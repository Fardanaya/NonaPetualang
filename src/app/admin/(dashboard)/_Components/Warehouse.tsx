// import { Skeleton, Table } from "@/components/ui/heroui";
// import { Section } from "@/components/ui/Section";
// import { useAddOn } from "@/hooks/store/addon";
// import { useBrand } from "@/hooks/store/brand";
// import { useCatalog } from "@/hooks/store/catalog";

// import {
//   TableBody,
//   TableColumn,
//   TableHeader,
//   TableRow,
//   TableCell,
//   listbox,
//   Spinner,
// } from "@heroui/react";
// import { FaShoppingCart, FaTools, FaTshirt } from "react-icons/fa";
// import {
//   FaFilm,
//   FaGlasses,
//   FaTags,
//   FaTruck,
//   FaUserNinja,
// } from "react-icons/fa6";

// const Warehouse = () => {
//   const { loading: loadingAddOn, list: listAddOn } = useAddOn();
//   const { loading: loadingBrand, list: listBrand } = useBrand();
//   const { loading: loadingCatalog, list: listCatalog } = useCatalog();

//   const getBrandTotals = () => {
//     const map = new Map<string, number>();
//     listCatalog.forEach((item) => {
//       const brand = item.brand?.name || "No Brand";
//       map.set(brand, (map.get(brand) || 0) + 1);
//     });
//     return Array.from(map.entries())
//       .map(([brand, total]) => ({ brand, total }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 8);
//   };

//   const getSeriesTotals = () => {
//     const map = new Map<string, number>();
//     listCatalog.forEach((item) => {
//       const series = item.character?.series?.name || "No series";
//       map.set(series, (map.get(series) || 0) + 1);
//     });
//     return Array.from(map.entries())
//       .map(([series, total]) => ({ series, total }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 8);
//   };

//   const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
//   const getSizeTotals = () => {
//     // Count sizes (case-insensitive)
//     const sizeCounts = listCatalog.reduce((size, item) => {
//       if (item.size) {
//         const normalizedSize = item.size.toUpperCase();
//         size[normalizedSize] = (size[normalizedSize] || 0) + 1;
//       }
//       return size;
//     }, {} as Record<string, number>);

//     return allSizes.map((size) => [size, sizeCounts[size] || 0]).slice(0, 8);
//   };

//   const getCharacterTotals = () => {
//     const map = new Map<string, number>();
//     listCatalog.forEach((item) => {
//       const character = item.character?.name || "No Character";
//       map.set(character, (map.get(character) || 0) + 1);
//     });
//     return Array.from(map.entries())
//       .map(([character, total]) => ({ character, total }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 8);
//   };

//   const stats = {
//     rented: 56,
//     maintenance: 12,
//     comingSoon: 8,
//     accessories: 42,
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaTent className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Total Alat
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {
//                   new Set(
//                     listCatalog
//                       .filter((item) => !item.is_bundle)
//                       .map((item) => item.name || "0")
//                   ).size
//                 }
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaShoppingCart className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Rented
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {stats.rented}
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaTools className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Maintenance
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {stats.maintenance}
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaTruck className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Coming Soon
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {stats.comingSoon}
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaGlasses className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Accessories
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {stats.accessories}
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaFilm className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Series
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {
//                   new Set(
//                     listCatalog.map(
//                       (item) => item.character?.series?.name || "0"
//                     )
//                   ).size
//                 }
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaUserNinja className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Character
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {
//                   new Set(
//                     listCatalog.map((item) => item.character?.name || "0")
//                   ).size
//                 }
//               </p>
//             )}
//           </div>
//         </Section>
//         <Section className="px-4 py-3 flex flex-row items-center gap-2">
//           <div className="p-4 bg-primary rounded-lg">
//             <FaTags className="text-white" />
//           </div>
//           <div className="flex flex-col">
//             <p className="text-xs md:text-sm font-medium text-default-800">
//               Brand
//             </p>
//             {loadingCatalog ? (
//               <Skeleton className="w-16 h-8" />
//             ) : (
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {
//                   new Set(listCatalog.map((item) => item.brand?.name || "0"))
//                     .size
//                 }
//               </p>
//             )}
//           </div>
//         </Section>
//       </div>
//       <div className="flex flex-col md:flex-row gap-4">
//         <Section className="w-full md:w-[40%]  px-4 py-3">
//           <Table removeWrapper aria-label="Size table" color="primary">
//             <TableHeader>
//               <TableColumn className="w-1/2">Add On</TableColumn>
//               <TableColumn className="w-1/2 text-center">Stock</TableColumn>
//             </TableHeader>
//             <TableBody
//               isLoading={loadingAddOn}
//               loadingContent={<Spinner label="Loading..." />}
//             >
//               {!loadingAddOn ? (
//                 [...listAddOn]
//                   .sort((a, b) => b.stock - a.stock)
//                   .slice(0, 18)
//                   .map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item.name}</TableCell>
//                       <TableCell className="text-center">
//                         {item.stock}
//                       </TableCell>
//                     </TableRow>
//                   ))
//               ) : (
//                 <></>
//               )}
//             </TableBody>
//           </Table>
//         </Section>
//         <div className="w-full md:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Section className="px-4 py-3">
//             <Table removeWrapper aria-label="Size table" color="primary">
//               <TableHeader>
//                 <TableColumn className="w-1/2">Size</TableColumn>
//                 <TableColumn className="w-1/2 text-center">Total</TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loadingCatalog}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loadingCatalog ? (
//                   getSizeTotals().map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item[0]}</TableCell>
//                       <TableCell className="text-center">{item[1]}</TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <></>
//                 )}
//               </TableBody>
//             </Table>
//           </Section>
//           <Section className="px-4 py-3">
//             <Table removeWrapper aria-label="Brand table" color="primary">
//               <TableHeader>
//                 <TableColumn className="w-1/2">Brand</TableColumn>
//                 <TableColumn className="w-1/2 text-center">Total</TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loadingBrand}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loadingCatalog ? (
//                   getBrandTotals().map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item.brand}</TableCell>
//                       <TableCell className="text-center">
//                         {item.total}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <></>
//                 )}
//               </TableBody>
//             </Table>
//           </Section>
//           <Section className="px-4 py-3">
//             <Table removeWrapper aria-label="Series table" color="primary">
//               <TableHeader>
//                 <TableColumn className="w-1/2">Series</TableColumn>
//                 <TableColumn className="w-1/2 text-center">Total</TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loadingCatalog}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loadingCatalog ? (
//                   getSeriesTotals().map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item.series}</TableCell>
//                       <TableCell className="text-center">
//                         {item.total}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <></>
//                 )}
//               </TableBody>
//             </Table>
//           </Section>
//           <Section className="px-4 py-3">
//             <Table removeWrapper aria-label="Character table" color="primary">
//               <TableHeader>
//                 <TableColumn className="w-1/2">Character</TableColumn>
//                 <TableColumn className="w-1/2 text-center">Total</TableColumn>
//               </TableHeader>
//               <TableBody
//                 isLoading={loadingCatalog}
//                 loadingContent={<Spinner label="Loading..." />}
//               >
//                 {!loadingCatalog ? (
//                   getCharacterTotals().map((item, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{item.character}</TableCell>
//                       <TableCell className="text-center">
//                         {item.total}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <></>
//                 )}
//               </TableBody>
//             </Table>
//           </Section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Warehouse;
