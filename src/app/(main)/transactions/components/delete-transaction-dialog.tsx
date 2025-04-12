"use client";

import { useState } from "react";
import { Transaction } from "../types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTransactionDeleted: () => void; // Callback to refresh the transactions list
}

export default function DeleteTransactionDialog({
    transaction,
    open,
    onOpenChange,
    onTransactionDeleted,
}: DeleteTransactionDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!transaction) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/transactions/delete-transaction?id=${transaction.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Transaction deleted successfully");
                onOpenChange(false);
                onTransactionDeleted();
            } else {
                toast.error(`Failed to delete transaction: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the transaction");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-red-50 border-red-200 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-red-600 text-xl">Delete Transaction</DialogTitle>
                    <DialogDescription className="text-red-500 font-medium">
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {transaction && (
                    <div className="py-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Type:</div>
                            <div>{transaction.type}</div>

                            <div className="font-medium">Description:</div>
                            <div>{transaction.name}</div>

                            <div className="font-medium">Amount:</div>
                            <div>${transaction.amount}</div>

                            <div className="font-medium">Date:</div>
                            <div>{new Date(transaction.date).toLocaleDateString()}</div>

                            <div className="font-medium">Category:</div>
                            <div>{transaction.category}</div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
