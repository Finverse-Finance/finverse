"use client";

import { useState, useEffect } from "react";
import { ReportForm } from "./components/report-form";
import { ReportDisplay } from "./components/report-display";
import { ReportCharts } from "./components/report-charts";
import { DailyReportsFormValues } from "./schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { HistoryIcon, LoaderIcon } from "lucide-react";

interface SavedReport {
    report: string;
    timeRange: string;
    categories: string[];
    generatedAt: string;
    transactions: number;
}

const LoadingOverlay = ({ message }: { message: string }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 loading-overlay">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl loading-container">
                <div className="flex flex-col items-center gap-3 min-w-[300px]">
                    <LoaderIcon className="animate-spin h-10 w-10 loading-spinner" />
                    <p className="text-center loading-message">{message}</p>
                    <p className="text-sm text-muted-foreground mt-2 loading-submessage">
                        This may take a few seconds...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function DailyReports() {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reportData, setReportData] = useState<{
        transactions: any[];
        accounts: any[];
        timeRange: string;
        categories: string[];
    } | null>(null);
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Fetch saved reports on component mount
    useEffect(() => {
        const fetchSavedReports = async () => {
            try {
                setIsLoadingSaved(true);
                const response = await fetch("/api/reports/history");
                const data = await response.json();

                if (response.ok && data.reports) {
                    setSavedReports(data.reports);
                }
            } catch (error) {
                console.error("Error fetching saved reports:", error);
                toast.error("Failed to load report history");
            } finally {
                setIsLoadingSaved(false);
            }
        };

        fetchSavedReports();
    }, []);

    const handleFormSubmit = async (formValues: DailyReportsFormValues) => {
        try {
            setIsLoading(true);
            setReport(null);
            setErrorMessage(null);

            // API request to generate report
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    timeRange: formValues.timeRange,
                    categories: formValues.categories || [],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setReport(data.report);
                setReportData(data.data);
                toast.success("Financial report generated successfully");

                // Add the new report to saved reports
                if (data.report) {
                    const newReport = {
                        report: data.report,
                        timeRange: formValues.timeRange,
                        categories: formValues.categories || [],
                        generatedAt: new Date().toISOString(),
                        transactions: data.data.transactions.length,
                    };

                    setSavedReports((prev) => [newReport, ...prev]);
                }
            } else {
                if (response.status === 404) {
                    // Handle no transactions found error
                    setErrorMessage(data.message);
                    setReportData(data.data);
                } else {
                    throw new Error(data.error || "Failed to generate report");
                }
            }
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSavedReport = (savedReport: SavedReport) => {
        setReport(savedReport.report);
        setErrorMessage(null);
        setReportData({
            transactions: [], // We don't have the transactions data in the saved report
            accounts: [], // We don't have the accounts data in the saved report
            timeRange: savedReport.timeRange,
            categories: savedReport.categories,
        });
        toast.info("Loaded saved report");
    };

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 daily-reports-page">
            {isLoading && <LoadingOverlay message="Generating Your Financial Report" />}

            <div className="flex flex-col space-y-2 mb-8">
                <h1 className="text-3xl font-bold">Daily Financial Reports</h1>
                <p className="text-muted-foreground">
                    Generate customized financial reports based on your transaction data
                </p>
            </div>

            <Card className="p-6 mb-6">
                <ReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </Card>

            <ReportDisplay
                report={report}
                isLoading={isLoading}
                timeRange={reportData?.timeRange}
                categories={reportData?.categories}
                errorMessage={errorMessage}
            />

            {reportData && report && <ReportCharts transactions={reportData.transactions} />}

            {/* Previous Reports Section */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5" />
                        Report History
                    </CardTitle>
                    <CardDescription>Your previously generated financial reports</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSaved ? (
                        <p className="text-muted-foreground">Loading saved reports...</p>
                    ) : savedReports.length === 0 ? (
                        <p className="text-muted-foreground">
                            No saved reports found. Generate your first report above!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {savedReports.map((savedReport, i) => (
                                <div
                                    key={i}
                                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                                    onClick={() => loadSavedReport(savedReport)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium">{savedReport.timeRange} Report</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {savedReport.generatedAt
                                                ? format(new Date(savedReport.generatedAt), "PPp")
                                                : "Unknown date"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {savedReport.categories && savedReport.categories.length > 0 ? (
                                            savedReport.categories.map((cat, j) => (
                                                <span
                                                    key={j}
                                                    className="text-xs bg-secondary/10 text-secondary-foreground py-1 px-2 rounded-full"
                                                >
                                                    {cat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">All categories</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Based on {savedReport.transactions} transactions
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
