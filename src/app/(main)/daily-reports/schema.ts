import { z } from "zod";

// Daily Reports form schema
export const dailyReportsFormSchema = z.object({
    timeRange: z.enum(["Daily", "Weekly", "Monthly", "All Time"], {
        required_error: "Please select a time range.",
    }),
    categories: z.array(z.string()).optional(),
});

// Typescript type derived from the schema
export type DailyReportsFormValues = z.infer<typeof dailyReportsFormSchema>;
