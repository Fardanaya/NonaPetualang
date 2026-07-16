// import { useState, useEffect, useMemo } from "react";
// import { Section } from "@/components/ui/Section";
// import { XAxis, CartesianGrid, AreaChart, Area, PieChart, Pie } from "recharts";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartLegend,
//   ChartLegendContent,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { Select } from "@/components/ui/heroui";
// import { SelectItem } from "@heroui/react";
// import { FaRepeat, FaUser } from "react-icons/fa6";
// import { MdFiberNew } from "react-icons/md";
// import { useTransactions } from "@/hooks/react-query/transaction";
// import { useCatalog } from "@/hooks/store/catalog";
// import { useAllTransactionAddons } from "@/hooks/react-query/transaction-addon";
// import { useAddOn } from "@/stores/useAddOn";
// import { isSingleCatalog } from "@/lib/types/schemas/catalog";

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--heroui-primary))",
//   },
// } satisfies ChartConfig;

// const orderChartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--heroui-primary))",
//   },
// } satisfies ChartConfig;

// const addonsConfig = {
//   "Wig Cap": {
//     label: "Wig Cap",
//   },
//   Polymer: {
//     label: "Polymer",
//   },
// } satisfies ChartConfig;

// const genderConfig = {
//   Male: {
//     label: "Male",
//   },
//   Female: {
//     label: "Female",
//   },
// } satisfies ChartConfig;

// const Stats = () => {
//   const [timeRange, setTimeRange] = useState("monthly");

//   // Import stores
//   const { data: transactions = [] } = useTransactions();
//   const { list: catalogs, getAll: getAllCatalogs } = useCatalog();
//   const { data: transactionAddons = [] } = useAllTransactionAddons();
//   const { list: addons, getAll: getAllAddons } = useAddOn();

//   // Fetch data on component mount
//   useEffect(() => {
//     getAllCatalogs();
//     getAllAddons();
//   }, []);

//   // Calculate income data from transactions
//   const incomeData = useMemo(() => {
//     const now = new Date();
//     const monthly = [0, 0, 0, 0];
//     const sixMonthly = [0, 0, 0, 0, 0, 0];
//     const yearly = [0, 0, 0, 0];

//     transactions.forEach((transaction) => {
//       if (transaction.status === "done" && transaction.final_price) {
//         const transactionDate = new Date(
//           transaction.start_rent || transaction.xata_createdat || now
//         );

//         // Monthly data (last 4 months)
//         const monthDiff =
//           now.getMonth() -
//           transactionDate.getMonth() +
//           (now.getFullYear() - transactionDate.getFullYear()) * 12;
//         if (monthDiff >= 0 && monthDiff < 4) {
//           monthly[3 - monthDiff] += transaction.final_price;
//         }

//         // 6 Monthly data (last 6 months)
//         if (monthDiff >= 0 && monthDiff < 6) {
//           sixMonthly[5 - monthDiff] += transaction.final_price;
//         }

//         // Yearly data (last 4 quarters)
//         const quarterDiff = Math.floor(monthDiff / 3);
//         if (quarterDiff >= 0 && quarterDiff < 4) {
//           yearly[3 - quarterDiff] += transaction.final_price;
//         }
//       }
//     });

//     return { monthly, "6monthly": sixMonthly, yearly };
//   }, [transactions]);

//   // Calculate order data from transactions
//   const orderData = useMemo(() => {
//     const now = new Date();
//     const monthly = [0, 0, 0, 0];
//     const sixMonthly = [0, 0, 0, 0, 0, 0];
//     const yearly = [0, 0, 0, 0];

//     transactions.forEach((transaction) => {
//       const transactionDate = new Date(
//         transaction.start_rent || transaction.xata_createdat || now
//       );

//       // Monthly data (last 4 months)
//       const monthDiff =
//         now.getMonth() -
//         transactionDate.getMonth() +
//         (now.getFullYear() - transactionDate.getFullYear()) * 12;
//       if (monthDiff >= 0 && monthDiff < 4) {
//         monthly[3 - monthDiff]++;
//       }

//       // 6 Monthly data (last 6 months)
//       if (monthDiff >= 0 && monthDiff < 6) {
//         sixMonthly[5 - monthDiff]++;
//       }

//       // Yearly data (last 4 quarters)
//       const quarterDiff = Math.floor(monthDiff / 3);
//       if (quarterDiff >= 0 && quarterDiff < 4) {
//         yearly[3 - quarterDiff]++;
//       }
//     });

//     return { monthly, "6monthly": sixMonthly, yearly };
//   }, [transactions]);

//   const incomeChartData = incomeData[timeRange as keyof typeof incomeData]?.map(
//     (value, index) => ({
//       name:
//         timeRange === "monthly"
//           ? ["1", "2", "3", "4"][index]
//           : timeRange === "6monthly"
//           ? ["1", "2", "3", "4", "5", "6"][index]
//           : ["1", "2", "3", "4"][index],
//       income: value,
//     })
//   );

//   const timeRangeOptions = ["monthly", "6monthly", "yearly"];

//   // Calculate addons data from transaction addons
//   const addonsData = useMemo(() => {
//     const addonCounts: Record<string, number> = {};

//     // Debug: Log the data to see what we have
//     console.log("Transaction Addons:", transactionAddons);

//     transactionAddons.forEach((ta) => {
//       // Check if addon data is included in the transaction addon
//       if (ta.add_on && typeof ta.add_on === "object" && "name" in ta.add_on) {
//         // Addon data is included in the transaction addon
//         const addonName = (ta.add_on as any).name;
//         addonCounts[addonName] = (addonCounts[addonName] || 0) + (ta.qty || 0);
//       } else {
//         // Try to find addon by ID from the separate addons list
//         const addon = addons.find(
//           (a) => a.id === ta.add_on || a.xata_id === ta.add_on
//         );
//         if (addon) {
//           addonCounts[addon.name] =
//             (addonCounts[addon.name] || 0) + (ta.qty || 0);
//         } else {
//           // If addon not found, use a generic name
//           addonCounts[`Addon ${ta.add_on}`] =
//             (addonCounts[`Addon ${ta.add_on}`] || 0) + (ta.qty || 0);
//         }
//       }
//     });

//     const total = Object.values(addonCounts).reduce(
//       (sum, count) => sum + count,
//       0
//     );

//     // If no addon data, show a default message
//     if (total === 0) {
//       return [
//         {
//           name: "No Addons Sold",
//           value: 1,
//           fill: "hsl(var(--heroui-secondary))",
//         },
//       ];
//     }

//     return Object.entries(addonCounts).map(([name, count], index) => ({
//       name: `${name} (${count})`,
//       value: count,
//       fill:
//         index === 0
//           ? "hsl(var(--heroui-primary))"
//           : "hsl(var(--heroui-secondary))",
//     }));
//   }, [transactionAddons, addons]);

//   // Calculate gender data from catalogs
//   const genderData = useMemo(() => {
//     const genderCounts: { [key: string]: number } = {};

//     catalogs.forEach((catalog) => {
//       if (isSingleCatalog(catalog) && catalog.gender) {
//         genderCounts[catalog.gender] = (genderCounts[catalog.gender] || 0) + 1;
//       }
//     });

//     const total = Object.values(genderCounts).reduce(
//       (sum, count) => sum + count,
//       0
//     );

//     // If no gender data, show a default message
//     if (total === 0) {
//       return [
//         { name: "No Data", value: 1, fill: "hsl(var(--heroui-secondary))" },
//       ];
//     }

//     return Object.entries(genderCounts).map(([gender, count], index) => ({
//       name: `${gender.charAt(0).toUpperCase() + gender.slice(1)} (${count})`,
//       value: count,
//       fill: index === 0 ? "hsl(var(--chart-1))" : "hsl(var(--heroui-primary))",
//     }));
//   }, [catalogs]);

//   // Calculate user statistics
//   const userStats = useMemo(() => {
//     const uniqueUsers = new Set(transactions.map((t) => t.user?.id || t.user));
//     const totalUsers = uniqueUsers.size;

//     // Count new users (first transaction in current month)
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     const userFirstTransaction: { [key: string]: Date } = {};
//     transactions.forEach((transaction) => {
//       const userId = transaction.user?.id || transaction.user;
//       const transactionDate = new Date(
//         transaction.start_rent || transaction.xata_createdat || now
//       );

//       if (
//         !userFirstTransaction[userId] ||
//         transactionDate < userFirstTransaction[userId]
//       ) {
//         userFirstTransaction[userId] = transactionDate;
//       }
//     });

//     const newUsers = Object.values(userFirstTransaction).filter(
//       (date) =>
//         date.getMonth() === currentMonth && date.getFullYear() === currentYear
//     ).length;

//     const repetitiveUsers = totalUsers - newUsers;

//     return { new: newUsers, repetitive: repetitiveUsers, total: totalUsers };
//   }, [transactions]);

//   return (
//     <div className="flex flex-col md:flex-row gap-4">
//       <div className="flex flex-col gap-4 w-full md:w-[70%]">
//         <Section className="p-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Income Statistics</h3>
//             <Select
//               className="max-w-xs"
//               disallowEmptySelection
//               defaultSelectedKeys={["monthly"]}
//               onChange={(e) => setTimeRange(e.target.value)}
//             >
//               {timeRangeOptions.map((time) => (
//                 <SelectItem key={time} className="capitalize">
//                   {time}
//                 </SelectItem>
//               ))}
//             </Select>
//           </div>
//           <ChartContainer
//             className="max-h-[40vh] w-full"
//             config={orderChartConfig}
//           >
//             <AreaChart data={incomeChartData || []}>
//               <CartesianGrid vertical={false} opacity={0.1} />
//               <XAxis
//                 dataKey="name"
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//                 tickFormatter={(value) => value.slice(0, 3)}
//               />
//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="line" />}
//               />
//               <defs>
//                 <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="hsl(var(--heroui-primary))"
//                     stopOpacity={0.8}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="hsl(var(--heroui-primary))"
//                     stopOpacity={0.1}
//                   />
//                 </linearGradient>
//               </defs>
//               <Area
//                 dataKey="income"
//                 type="natural"
//                 fill="url(#fillColor)"
//                 fillOpacity={0.4}
//                 stroke="hsl(var(--heroui-primary))"
//                 strokeWidth={2}
//               />
//             </AreaChart>
//           </ChartContainer>
//         </Section>
//         <Section className="p-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Order Statistics</h3>
//             <Select
//               className="max-w-xs"
//               disallowEmptySelection
//               defaultSelectedKeys={["monthly"]}
//               onChange={(e) => setTimeRange(e.target.value)}
//             >
//               {timeRangeOptions.map((time) => (
//                 <SelectItem key={time} className="capitalize">
//                   {time}
//                 </SelectItem>
//               ))}
//             </Select>
//           </div>
//           <ChartContainer className="max-h-[40vh] w-full" config={chartConfig}>
//             <AreaChart
//               data={
//                 orderData[timeRange as keyof typeof orderData]?.map(
//                   (value, index) => ({
//                     name:
//                       timeRange === "monthly"
//                         ? ["1", "2", "3", "4"][index]
//                         : timeRange === "6monthly"
//                         ? ["1", "2", "3", "4", "5", "6"][index]
//                         : ["1", "2", "3", "4"][index],
//                     orders: value,
//                   })
//                 ) || []
//               }
//             >
//               <CartesianGrid vertical={false} opacity={0.1} />
//               <XAxis
//                 dataKey="name"
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//                 tickFormatter={(value) => value.slice(0, 3)}
//               />
//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="line" />}
//               />
//               <defs>
//                 <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="hsl(var(--heroui-primary))"
//                     stopOpacity={0.8}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="hsl(var(--heroui-primary))"
//                     stopOpacity={0.1}
//                   />
//                 </linearGradient>
//               </defs>
//               <Area
//                 dataKey="orders"
//                 type="natural"
//                 fill="url(#fillColor)"
//                 fillOpacity={0.4}
//                 stroke="hsl(var(--heroui-primary))"
//                 strokeWidth={2}
//               />
//             </AreaChart>
//           </ChartContainer>
//         </Section>
//       </div>
//       <div className="flex flex-col gap-4 w-full md:w-[30%]">
//         <Section className="p-4">
//           <h3 className="text-lg font-semibold mb-4">Addons Sold</h3>
//           <ChartContainer
//             className="mx-auto aspect-square max-h-[300px]"
//             config={addonsConfig}
//           >
//             <PieChart>
//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="line" />}
//               />
//               <Pie
//                 data={addonsData}
//                 dataKey="value"
//                 nameKey="name"
//                 innerRadius={60}
//               />
//               <ChartLegend
//                 content={<ChartLegendContent nameKey="name" />}
//                 className="mt-4 flex justify-center gap-4"
//               />
//             </PieChart>
//           </ChartContainer>
//         </Section>
//         <Section className="p-4">
//           <h3 className="text-lg font-semibold mb-4">Gender</h3>
//           <ChartContainer
//             className="mx-auto aspect-square max-h-[300px]"
//             config={genderConfig}
//           >
//             <PieChart>
//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="line" />}
//               />
//               <Pie
//                 data={genderData}
//                 dataKey="value"
//                 nameKey="name"
//                 innerRadius={60}
//               />
//               <ChartLegend
//                 content={<ChartLegendContent nameKey="name" />}
//                 className="mt-4 flex justify-center gap-4"
//               />
//             </PieChart>
//           </ChartContainer>
//         </Section>
//         <div className="flex flex-col gap-4">
//           <Section className="flex flex-row gap-4 p-4">
//             <div className="flex justify-center items-center bg-primary rounded-lg p-4 aspect-square">
//               <MdFiberNew size={25} />
//             </div>
//             <div className="flex flex-col gap-2">
//               <p className="text-xs md:text-sm font-medium text-default-800">
//                 New
//               </p>
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {userStats.new}
//               </p>
//             </div>
//           </Section>
//           <Section className="flex flex-row gap-4 p-4">
//             <div className="flex justify-center items-center bg-primary rounded-lg p-4 aspect-square">
//               <FaRepeat size={25} />
//             </div>
//             <div className="flex flex-col gap-2">
//               <p className="text-xs md:text-sm font-medium text-default-800">
//                 Repetitive
//               </p>
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {userStats.repetitive}
//               </p>
//             </div>
//           </Section>
//           <Section className="flex flex-row gap-4 p-4">
//             <div className="flex justify-center items-center bg-primary rounded-lg p-4 aspect-square">
//               <FaUser size={25} />
//             </div>
//             <div className="flex flex-col gap-2">
//               <p className="text-xs md:text-sm font-medium text-default-800">
//                 Total
//               </p>
//               <p className="text-2xl md:text-3xl font-semibold tracking-wide">
//                 {userStats.total}
//               </p>
//             </div>
//           </Section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Stats;
