"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Type definitions
interface MonthlySpending {
  month: string;
  amount: number;
}

interface ChartData {
  name: string;
  amount: number;
}

interface ExpenseSummaryProps {
  monthlySpending: MonthlySpending[] | undefined;
  totalSpent: number | undefined;
}

export function ExpenseSummary({
  monthlySpending,
  totalSpent,
}: ExpenseSummaryProps): React.JSX.Element {
  // Format monthly data for chart
  const monthNames: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData: ChartData[] =
    monthlySpending?.map((item: MonthlySpending) => {
      const date = new Date(item.month);
      return {
        name: monthNames[date.getMonth()],
        amount: item.amount,
      };
    }) || [];

  // Get current year
  const currentYear: number = new Date().getFullYear();
  const currentMonth: number = new Date().getMonth();

  // Find current month's spending
  const currentMonthSpending = monthlySpending?.find((item) => {
    const date = new Date(item.month);
    return date.getMonth() === currentMonth;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total this month</p>
            <h3 className="text-2xl font-bold mt-1">
              ${currentMonthSpending?.amount.toFixed(2) || "0.00"}
            </h3>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total this year</p>
            <h3 className="text-2xl font-bold mt-1">
              ${totalSpent?.toFixed(2) || "0.00"}
            </h3>
          </div>
        </div>

        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number | string) => [
                  `$${typeof value === "number" ? value.toFixed(2) : value}`,
                  "Amount",
                ]}
                labelFormatter={() => "Spending"}
              />
              <Bar dataKey="amount" fill="#36d7b7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Monthly spending for {currentYear}
        </p>
      </CardContent>
    </Card>
  );
}
