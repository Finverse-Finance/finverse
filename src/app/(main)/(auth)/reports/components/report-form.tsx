"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dailyReportsFormSchema, DailyReportsFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ReportFormProps {
    onSubmit: (values: DailyReportsFormValues) => void;
    isLoading: boolean;
}

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    // Initialize the form with default values
    const form = useForm<DailyReportsFormValues>({
        resolver: zodResolver(dailyReportsFormSchema),
        defaultValues: {
            timeRange: "Daily",
            categories: [],
        },
    });

    // Fetch transaction categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/transactions/get-categories");
                const data = await response.json();

                if (data.categories) {
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="timeRange"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time Range</FormLabel>
                                <Select disabled={isLoading} value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select time range" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent
                                        className="relative z-50 overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-80"
                                        position="popper"
                                        sideOffset={5}
                                    >
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="All Time">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categories (Optional)</FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-full justify-between"
                                                disabled={isLoading}
                                            >
                                                {(field.value || []).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(field.value || []).length > 2 ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="rounded-sm px-1 font-normal"
                                                            >
                                                                {(field.value || []).length} selected
                                                            </Badge>
                                                        ) : (
                                                            (field.value || []).map((category) => (
                                                                <Badge
                                                                    key={category}
                                                                    variant="secondary"
                                                                    className="rounded-sm px-1 font-normal"
                                                                >
                                                                    {category}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                ) : (
                                                    "Select categories"
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="relative z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-white p-0 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                                        align="start"
                                        sideOffset={5}
                                    >
                                        <Command className="overflow-hidden rounded-md bg-white">
                                            <CommandInput placeholder="Search categories..." className="h-9" />
                                            <CommandList className="max-h-[300px] overflow-y-auto">
                                                <CommandEmpty>No categories found.</CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => {
                                                        const selectedCategories = field.value || [];
                                                        const isSelected = selectedCategories.includes(category);

                                                        return (
                                                            <CommandItem
                                                                key={category}
                                                                value={category}
                                                                onSelect={() => {
                                                                    const currentValue = field.value || [];
                                                                    const newValue = isSelected
                                                                        ? currentValue.filter(
                                                                              (item) => item !== category
                                                                          )
                                                                        : [...currentValue, category];

                                                                    form.setValue("categories", newValue);
                                                                }}
                                                                className="px-2 py-1.5 text-sm rounded-sm aria-selected:bg-accent aria-selected:text-accent-foreground flex items-center"
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                                                        isSelected
                                                                            ? "border-primary bg-primary text-primary-foreground"
                                                                            : "border-primary opacity-50"
                                                                    )}
                                                                >
                                                                    {isSelected && <CheckIcon className="h-3 w-3" />}
                                                                </div>
                                                                <span>{category}</span>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                    {isLoading ? "Generating Report..." : "Generate Report"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </form>
        </Form>
    );
}
