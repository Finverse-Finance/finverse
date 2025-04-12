"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "./data-table-pagination";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter by description..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                        className="h-8 w-[250px] lg:w-[300px]"
                    />
                    {table.getColumn("type") && (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className={`h-8 ${
                                    table.getColumn("type")?.getFilterValue() === undefined
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : ""
                                }`}
                                onClick={() => table.getColumn("type")?.setFilterValue(undefined)}
                            >
                                All
                            </Button>
                            <Button
                                variant="outline"
                                className={`h-8 ${
                                    table.getColumn("type")?.getFilterValue() === "Income"
                                        ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                                        : ""
                                }`}
                                onClick={() => table.getColumn("type")?.setFilterValue("Income")}
                            >
                                Income
                            </Button>
                            <Button
                                variant="outline"
                                className={`h-8 ${
                                    table.getColumn("type")?.getFilterValue() === "Expense"
                                        ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                                        : ""
                                }`}
                                onClick={() => table.getColumn("type")?.setFilterValue("Expense")}
                            >
                                Expense
                            </Button>
                        </div>
                    )}

                    {table.getColumn("category") && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-8">
                                    {table.getColumn("category")?.getFilterValue()
                                        ? `Category: ${String(table.getColumn("category")?.getFilterValue())}`
                                        : "Category"}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="z-[100] shadow-md bg-background border"
                                style={{ backgroundColor: "#fff5eb" }}
                            >
                                <DropdownMenuCheckboxItem
                                    checked={!table.getColumn("category")?.getFilterValue()}
                                    onCheckedChange={() => table.getColumn("category")?.setFilterValue(undefined)}
                                >
                                    All Categories
                                </DropdownMenuCheckboxItem>
                                {Array.from(new Set(data.map((item) => (item as any).category as string)))
                                    .sort()
                                    .map((category) => (
                                        <DropdownMenuCheckboxItem
                                            key={category}
                                            checked={table.getColumn("category")?.getFilterValue() === category}
                                            onCheckedChange={() =>
                                                table.getColumn("category")?.setFilterValue(category)
                                            }
                                        >
                                            {category}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto h-8">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="z-[100] shadow-md bg-background border"
                        style={{ backgroundColor: "#fff5eb" }}
                    >
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id === "name" ? "Description" : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={
                                                header.id === "select" || header.id === "actions"
                                                    ? "w-[60px]"
                                                    : header.id === "name"
                                                      ? "w-auto px-6"
                                                      : header.id === "amount"
                                                        ? "text-right"
                                                        : ""
                                            }
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === "select" || cell.column.id === "actions"
                                                    ? "w-[60px]"
                                                    : cell.column.id === "name"
                                                      ? "w-auto px-6"
                                                      : cell.column.id === "amount"
                                                        ? "text-right"
                                                        : ""
                                            }
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
