"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dailyReportsFormSchema, DailyReportsFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Faceted, FacetedTrigger, FacetedContent, FacetedBadgeList, FacetedItem } from "@/components/ui/faceted";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ReportFormProps {
    onSubmit: (values: DailyReportsFormValues) => void;
    isLoading: boolean;
}

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
    const [categories, setCategories] = useState<string[]>([]);

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
                                <FormControl>
                                    <Select disabled={isLoading} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700">
                                            <SelectValue placeholder="Select time range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 z-50">
                                            <SelectItem value="Daily">Daily</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="All Time">All Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
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
                                <FormControl>
                                    <Faceted value={field.value} onValueChange={field.onChange} multiple={true}>
                                        <FacetedTrigger className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700">
                                            <FacetedBadgeList
                                                options={categories.map((cat) => ({ label: cat, value: cat }))}
                                                placeholder="Select categories"
                                            />
                                        </FacetedTrigger>
                                        <FacetedContent className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 max-h-60 overflow-y-auto z-50 text-sm">
                                            {categories.map((cat) => (
                                                <FacetedItem
                                                    key={cat}
                                                    value={cat}
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                                                >
                                                    {cat}
                                                </FacetedItem>
                                            ))}
                                        </FacetedContent>
                                    </Faceted>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full md:w-auto bg-black hover:bg-gray-800 dark:bg-black dark:hover:bg-gray-900 text-white text-sm font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? "Generating Report..." : "Generate Report"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </form>
        </Form>
    );
}
