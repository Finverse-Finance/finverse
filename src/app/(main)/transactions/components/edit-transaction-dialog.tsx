"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Transaction } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Define the form schema
const formSchema = z.object({
    id: z.string(),
    type: z.enum(["Income", "Expense"]),
    category: z.string().min(1, "Category is required"),
    date: z.string().min(1, "Date is required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    name: z.string().min(1, "Description is required"),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTransactionUpdated: () => void; // Callback to refresh the transactions list
}

const categories = [
    "Food & Drink",
    "Shopping",
    "Housing",
    "Transportation",
    "Entertainment",
    "Healthcare",
    "Personal",
    "Education",
    "Travel",
    "Bills & Utilities",
    "Investments",
    "Income",
    "Savings",
    "Other",
];

export default function EditTransactionDialog({
    transaction,
    open,
    onOpenChange,
    onTransactionUpdated,
}: EditTransactionDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            type: "Expense",
            category: "",
            date: "",
            amount: "",
            name: "",
            notes: "",
        },
    });

    // Update form values when transaction changes
    useEffect(() => {
        if (transaction) {
            form.reset({
                id: transaction.id,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                amount: transaction.amount,
                name: transaction.name,
                notes: transaction.notes || "",
            });
        }
    }, [transaction, form]);

    const onSubmit = async (values: FormValues) => {
        if (!transaction) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/transactions/update-transaction", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: values.id,
                    type: values.type,
                    category: values.category,
                    date: values.date,
                    amount: values.amount,
                    name: values.name,
                    notes: values.notes,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Transaction updated successfully");
                onOpenChange(false);
                onTransactionUpdated();
            } else {
                toast.error(`Failed to update transaction: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            toast.error("An error occurred while updating the transaction");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#fff5eb] border-amber-200 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-amber-800 text-xl">Edit Transaction</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border border-amber-100">
                                            <SelectItem value="Income">Income</SelectItem>
                                            <SelectItem value="Expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border border-amber-100">
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="bg-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0.00" {...field} className="bg-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Transaction description" {...field} className="bg-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add additional notes..."
                                            {...field}
                                            className="bg-white"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
