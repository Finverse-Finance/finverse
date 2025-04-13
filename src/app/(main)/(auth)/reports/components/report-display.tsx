"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportDisplayProps {
    report: string | null;
    isLoading: boolean;
    timeRange?: string;
    categories?: string[];
}

export function ReportDisplay({ report, isLoading, timeRange, categories }: ReportDisplayProps) {
    // Format the markdown report from Gemini for display
    const formatReport = (text: string) => {
        // First replace bold text (**text**)
        const processedText = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // Then replace italic text (*text*)
            .replace(/\*([^*]+)\*/g, "<em>$1</em>");

        return processedText.split("\n").map((line, i) => {
            // Format headings
            if (line.startsWith("# ")) {
                return (
                    <h1 key={i} className="text-2xl font-bold mb-4 mt-6">
                        <span dangerouslySetInnerHTML={{ __html: line.replace("# ", "") }} />
                    </h1>
                );
            } else if (line.startsWith("## ")) {
                return (
                    <h2 key={i} className="text-xl font-bold mb-3 mt-5">
                        <span dangerouslySetInnerHTML={{ __html: line.replace("## ", "") }} />
                    </h2>
                );
            } else if (line.startsWith("### ")) {
                return (
                    <h3 key={i} className="text-lg font-semibold mb-2 mt-4">
                        <span dangerouslySetInnerHTML={{ __html: line.replace("### ", "") }} />
                    </h3>
                );
            } else if (line.startsWith("- ")) {
                // Format lists
                return (
                    <li key={i} className="ml-6 mb-1 list-disc">
                        <span dangerouslySetInnerHTML={{ __html: line.replace("- ", "") }} />
                    </li>
                );
            } else if (line.startsWith("* ")) {
                // Format lists with * instead of -
                return (
                    <li key={i} className="ml-6 mb-1 list-disc">
                        <span dangerouslySetInnerHTML={{ __html: line.replace("* ", "") }} />
                    </li>
                );
            } else if (line.startsWith("1. ") || /^\d+\.\s/.test(line)) {
                // Format numbered lists
                return (
                    <li key={i} className="ml-6 mb-1 list-decimal">
                        <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "") }} />
                    </li>
                );
            } else if (line.trim() === "") {
                // Handle empty lines
                return <br key={i} />;
            } else {
                // Regular paragraphs
                return (
                    <p key={i} className="mb-2">
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                    </p>
                );
            }
        });
    };

    // Display loading skeleton with animation
    if (isLoading) {
        return (
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <h3 className="text-lg font-medium">Generating Financial Report</h3>
                    </div>
                    <CardDescription>
                        Our AI is analyzing your financial data. This may take a few moments...
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex flex-col space-y-2 mt-6">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="ml-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 mt-4">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="ml-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If no report is available yet
    if (!report) {
        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>No Report Generated Yet</CardTitle>
                    <CardDescription>
                        Select a time range and categories, then click &quot;Generate Report&quot; to create your
                        financial summary.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm italic">
                        Your personalized financial report will appear here after generation.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Display the generated report
    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Financial Summary</CardTitle>
                        <CardDescription>Analysis of your financial data for the selected period</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                            {timeRange ?? "Daily"}
                        </Badge>
                        {categories &&
                            categories.length > 0 &&
                            categories.map((cat, i) => (
                                <Badge key={i} variant="secondary" className="bg-secondary/10">
                                    {cat}
                                </Badge>
                            ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="markdown-content">
                <div>{formatReport(report)}</div>
            </CardContent>
        </Card>
    );
}
