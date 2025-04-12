// app/components/ui/OverviewCards.tsx
"use client";

export function OverviewCards() {
    const stats = [
        { label: "Total Balance", value: "$3,248.53" },
        { label: "This Month’s Income", value: "$1,800.00" },
        { label: "This Month’s Expenses", value: "$1,265.50" },
        { label: "Spending vs Avg", value: "112%" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white shadow rounded p-4">
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
