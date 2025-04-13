"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "../types";
import { Calendar, DollarSign, Tag, ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { useState } from "react";
import EditTransactionDialog from "./edit-transaction-dialog";
import DeleteTransactionDialog from "./delete-transaction-dialog";

// State management for edit/delete dialogs
interface ActionCellProps {
    transaction: Transaction;
    onTransactionUpdated: () => void;
}

const ActionCell = ({ transaction, onTransactionUpdated }: ActionCellProps) => {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[100] shadow-md bg-white border border-amber-200">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="hover:bg-amber-50">
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 hover:bg-red-50"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditTransactionDialog
                transaction={showEditDialog ? transaction : null}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onTransactionUpdated={onTransactionUpdated}
            />

            <DeleteTransactionDialog
                transaction={showDeleteDialog ? transaction : null}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onTransactionDeleted={onTransactionUpdated}
            />
        </>
    );
};

export const createColumns = (onTransactionUpdated: () => void): ColumnDef<Transaction>[] => [
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
                            <span className="flex items-center">Income</span>
                        ) : (
                            <span className="flex items-center">Expense</span>
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
        filterFn: (row, id, value) => {
            return value === row.getValue(id);
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
                <div className="max-w-[600px] truncate font-medium px-4" title={row.getValue("name")}>
                    {row.getValue("name")}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <div className="text-left">
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
                <div className="text-left w-full pl-4">
                    <div className="inline-flex items-center gap-1 justify-start w-[100px]">
                        <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className={`font-medium ${type === "Income" ? "text-green-600" : "text-red-600"}`}>
                            {amount.toFixed(2)}
                        </span>
                    </div>
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
                    <span>{date}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original;
            return <ActionCell transaction={transaction} onTransactionUpdated={onTransactionUpdated} />;
        },
    },
];
