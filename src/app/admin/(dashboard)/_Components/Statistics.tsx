"use client";

import { useState, useMemo } from "react";
import { Section } from "@/components/ui/Section";
import { Select } from "@/components/ui/heroui";
import { SelectItem, Skeleton, Chip } from "@heroui/react";
import { XAxis, CartesianGrid, AreaChart, Area, BarChart, Bar, Cell } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useTransactions } from "@/hooks/react-query/transaction";
import { FaMoneyBillWave, FaReceipt, FaChartLine, FaTrophy } from "react-icons/fa6";
import Image from "next/image";

const incomeChartConfig = {
    income: {
        label: "Pendapatan",
        color: "hsl(var(--heroui-primary))",
    },
} satisfies ChartConfig;

const topCostumeChartConfig = {
    count: {
        label: "Jumlah Sewa",
        color: "hsl(var(--heroui-primary))",
    },
} satisfies ChartConfig;

const Statistics = () => {
    const [timeRange, setTimeRange] = useState("monthly");
    const { data: transactions = [], isLoading } = useTransactions();

    // Calculate income data from completed transactions
    const incomeStats = useMemo(() => {
        const now = new Date();
        const monthlyData: { [key: string]: number } = {};
        const yearlyData: { [key: string]: number } = {};
        let totalIncome = 0;
        let totalTransactions = 0;
        let currentMonthIncome = 0;

        transactions.forEach((transaction: any) => {
            if (transaction.status === "done" && transaction.final_price) {
                const transactionDate = new Date(
                    transaction.start_rent || transaction.xata_createdat || now
                );

                totalIncome += transaction.final_price;
                totalTransactions++;

                // Check if transaction is in current month
                if (
                    transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getFullYear() === now.getFullYear()
                ) {
                    currentMonthIncome += transaction.final_price;
                }

                // Monthly data (last 6 months)
                const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.final_price;

                // Yearly data
                const yearKey = transactionDate.getFullYear().toString();
                yearlyData[yearKey] = (yearlyData[yearKey] || 0) + transaction.final_price;
            }
        });

        // Format monthly data for chart (last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const monthlyChartData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyChartData.push({
                name: monthNames[date.getMonth()],
                income: monthlyData[key] || 0,
            });
        }

        // Format yearly data for chart
        const yearlyChartData = Object.entries(yearlyData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-4)
            .map(([year, income]) => ({ name: year, income }));

        const avgIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

        return {
            totalIncome,
            totalTransactions,
            currentMonthIncome,
            avgIncome,
            monthlyChartData,
            yearlyChartData,
        };
    }, [transactions]);

    // Calculate top rented equipment
    const topCostumes = useMemo(() => {
        const costumeCount: { [key: string]: { count: number; catalog: any } } = {};

        transactions.forEach((transaction: any) => {
            if (transaction.catalogs && Array.isArray(transaction.catalogs)) {
                transaction.catalogs.forEach((catalog: any) => {
                    if (catalog?.id) {
                        if (!costumeCount[catalog.id]) {
                            costumeCount[catalog.id] = { count: 0, catalog };
                        }
                        costumeCount[catalog.id].count++;
                    }
                });
            }
        });

        return Object.values(costumeCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [transactions]);

    const chartData = timeRange === "monthly"
        ? incomeStats.monthlyChartData
        : incomeStats.yearlyChartData;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Section className="px-4 py-3 flex flex-row items-center gap-3">
                    <div className="p-3 bg-success/20 rounded-lg">
                        <FaMoneyBillWave className="text-success text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-medium text-default-600">
                            Pendapatan Bulan Ini
                        </p>
                        {isLoading ? (
                            <Skeleton className="w-24 h-6" />
                        ) : (
                            <p className="text-lg md:text-xl font-semibold text-success">
                                {formatCurrency(incomeStats.currentMonthIncome)}
                            </p>
                        )}
                    </div>
                </Section>

                <Section className="px-4 py-3 flex flex-row items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <FaReceipt className="text-primary text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-medium text-default-600">
                            Total Transaksi Selesai
                        </p>
                        {isLoading ? (
                            <Skeleton className="w-16 h-6" />
                        ) : (
                            <p className="text-lg md:text-xl font-semibold">
                                {incomeStats.totalTransactions}
                            </p>
                        )}
                    </div>
                </Section>

                <Section className="px-4 py-3 flex flex-row items-center gap-3">
                    <div className="p-3 bg-warning/20 rounded-lg">
                        <FaChartLine className="text-warning text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-medium text-default-600">
                            Rata-rata Transaksi
                        </p>
                        {isLoading ? (
                            <Skeleton className="w-24 h-6" />
                        ) : (
                            <p className="text-lg md:text-xl font-semibold">
                                {formatCurrency(incomeStats.avgIncome)}
                            </p>
                        )}
                    </div>
                </Section>

                <Section className="px-4 py-3 flex flex-row items-center gap-3">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                        <FaMoneyBillWave className="text-secondary text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-medium text-default-600">
                            Total Pendapatan
                        </p>
                        {isLoading ? (
                            <Skeleton className="w-24 h-6" />
                        ) : (
                            <p className="text-lg md:text-xl font-semibold">
                                {formatCurrency(incomeStats.totalIncome)}
                            </p>
                        )}
                    </div>
                </Section>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Income Chart */}
                <Section className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Statistik Pendapatan</h3>
                        <Select
                            className="max-w-[150px]"
                            disallowEmptySelection
                            defaultSelectedKeys={["monthly"]}
                            onChange={(e) => setTimeRange(e.target.value)}
                            aria-label="Time range"
                        >
                            <SelectItem key="monthly">Bulanan</SelectItem>
                            <SelectItem key="yearly">Tahunan</SelectItem>
                        </Select>
                    </div>
                    {isLoading ? (
                        <Skeleton className="w-full h-[250px]" />
                    ) : (
                        <ChartContainer
                            className="h-[250px] w-full"
                            config={incomeChartConfig}
                        >
                            <AreaChart data={chartData}>
                                <CartesianGrid vertical={false} opacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(var(--heroui-primary))"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(var(--heroui-primary))"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <Area
                                    dataKey="income"
                                    type="monotone"
                                    fill="url(#incomeGradient)"
                                    fillOpacity={0.4}
                                    stroke="hsl(var(--heroui-primary))"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </Section>

                {/* Top Rented Costumes */}
                <Section className="w-full md:w-[400px] p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FaTrophy className="text-warning text-lg" />
                        <h3 className="text-lg font-semibold">Alat Terlaris</h3>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-14 rounded-lg" />
                            ))}
                        </div>
                    ) : topCostumes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[250px] text-default-400">
                            <p>Belum ada data alat terlaris</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {topCostumes.map((item, idx) => (
                                <div
                                    key={item.catalog?.id || idx}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
                                >
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                                        {idx + 1}
                                    </div>
                                    {item.catalog?.images?.[0] ? (
                                        <Image
                                            src={item.catalog.images[0]}
                                            alt={item.catalog.name || "Alat"}
                                            width={40}
                                            height={40}
                                            className="rounded-lg object-cover w-10 h-10"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-default-300" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {item.catalog?.name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-default-500">
                                            {item.catalog?.category?.name || "-"}
                                        </p>
                                    </div>
                                    <Chip size="sm" color="primary" variant="flat">
                                        {item.count}x
                                    </Chip>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
};

export default Statistics;
