export interface Transaction {
    id: string;
    type: "Income" | "Expense";
    category: string;
    date: string;
    amount: string;
    name: string;
    notes?: string;
    source?: string;
    pending?: boolean;
    original?: any;
}
