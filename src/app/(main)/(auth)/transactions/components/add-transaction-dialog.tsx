"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
    type: z.enum(["Income", "Expense"]),
    category: z.string().min(1, "Category is required"),
    date: z.date({
        required_error: "Date is required",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    name: z.string().min(1, "Description is required"),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTransactionAdded: () => void; // Callback to refresh the transactions list
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

export default function AddTransactionDialog({ open, onOpenChange, onTransactionAdded }: AddTransactionDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "Expense",
            category: "",
            date: new Date(),
            amount: "",
            name: "",
            notes: "",
        },
    });

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Keep the current type value when closing
            const currentType = form.getValues().type;
            form.reset({
                type: currentType,
                category: "",
                date: new Date(),
                amount: "",
                name: "",
                notes: "",
            });
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (values: FormValues) => {
        setIsSaving(true);
        try {
            // Format amount - API needs the proper sign based on transaction type
            let formattedAmount = Number(Number(values.amount).toFixed(2));
            if (values.type === "Income") {
                formattedAmount = Math.abs(formattedAmount); // Make positive for income
            } else {
                formattedAmount = -Math.abs(formattedAmount); // Make negative for expense
            }

            const response = await fetch("/api/transactions/add-transaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: values.type,
                    category: values.category,
                    date: format(values.date, "yyyy-MM-dd"),
                    amount: formattedAmount.toString(),
                    name: values.name,
                    notes: values.notes,
                    isIncome: values.type === "Income", // Add this flag for the API
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Transaction added successfully");
                form.reset({
                    type: values.type,
                    category: "",
                    date: new Date(),
                    amount: "",
                    name: "",
                    notes: "",
                });
                onOpenChange(false);
                onTransactionAdded();
            } else {
                toast.error(`Failed to add transaction: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            toast.error("An error occurred while adding the transaction");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#fff5eb] border-amber-200 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-amber-800 text-xl">Add New Transaction</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal bg-white",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0 bg-white border border-amber-100"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-500" />
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
                                    <FormMessage className="text-red-500" />
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
                                    <FormMessage className="text-red-500" />
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
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {isSaving ? "Adding..." : "Add Transaction"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
