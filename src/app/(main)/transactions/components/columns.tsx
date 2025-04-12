"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "../types";
import { Calendar, DollarSign, Tag, ArrowUpDown, MoreHorizontal, Check, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<Transaction>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium"
                    >
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <div className="flex w-[100px] items-center">
                    <Badge
                        variant={type === "Income" ? "outline" : "outline"}
                        className={
                            type === "Income"
                                ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                        }
                    >
                        {type === "Income" ? (
                            <span className="flex items-center gap-1">
                                <Check className="h-3.5 w-3.5 text-green-600" />
                                Income
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Filter className="h-3.5 w-3.5 rotate-180 text-red-600" />
                                Expense
                            </span>
                        )}
                    </Badge>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value === row.getValue(id);
        },
        enableHiding: false,
    },
    {
        accessorKey: "category",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("category")}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as string;
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(date), "MMM dd, yyyy")}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount") as string);
            const type = row.getValue("type") as string;

            return (
                <div className="text-right flex justify-end items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-medium ${type === "Income" ? "text-green-600" : "text-red-600"}`}>
                        ${amount.toFixed(2)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] truncate font-medium" title={row.getValue("name")}>
                    {row.getValue("name")}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                // Will implement edit functionality later
                                console.log("Edit", transaction);
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                // Will implement delete functionality later
                                console.log("Delete", transaction);
                            }}
                            className="text-red-600"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
