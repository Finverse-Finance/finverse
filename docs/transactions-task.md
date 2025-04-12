**Next Feature: Transactions Page (@transactions)**

### Overview:

- This page will display a **table of all user transactions**.
- Users can **search, filter, and categorize** their transactions (both income and expenses).
- Users will also be able to **add**, **edit**, and **delete** transactions.

---

### 1. Transaction Table Component

- Use the **Data Table component** from Dice UI: https://www.diceui.com/docs/components/data-table
    - Reference live example: https://table.sadmn.com/
- The table should display:
    - Transaction Type (Income or Expense)
    - Category
    - Date
    - Amount
- Include **search**, **filter**, and **category selection** features.
- Add a `⋮` (three-dot) menu for each row with options to **Edit** or **Delete** a transaction.
- All logic is already made. You just need to:
    - Add existing components
    - Tweak minor settings
    - Import the data
    - The table should work with minimal setup

---

### 2. Add Transaction Form (Top of Page)

- A **"New Transaction"** button should open a form
- Use `shadcn/ui` Form component + `zod` for validation
- Fields:
    - Transaction Type (Dropdown: Income / Expense)
    - Category (Dropdown with default options)
    - Date (Date Picker)
    - Amount (Number input – assume USD)

---

### 3. Data Processing

- When a transaction is **added**, **edited**, or **deleted**, trigger the formatter script to update:
    - `formattedData` (used in dashboard)
    - `financials` field (if affected)

---

### Summary of Planned Steps

1. Setup Table Layout

    - Integrate Dice UI table component
    - Display transactions with necessary columns
    - Add filter/search/category tools

2. Add Row-Level Controls

    - Implement 3-dot menu with Edit/Delete actions

3. Build Transaction Form

    - Create modal using shadcn form components
    - Use `zod` schema for validation

4. Hook Up Form Logic

    - On submit: call backend API to add transaction
    - After response: trigger formatter script

5. Implement Edit/Delete

    - On edit/delete: update backend
    - Trigger formatter script on success

6. Ensure Database Consistency
    - Always update `formattedData` and `financials` after any CRUD operation

---

### Additional Notes

- The full Dice UI table is installed
- Most shadcn/ui components are installed
- Do **not** overwrite the onboarding flow
    - Users should only access `@transactions` manually for now
    - Don’t force this page on login
- Revisit the formatting API in `@api` to make sure transactions are labeled correctly:
    - Expense = negative amount
    - Income = positive amount
- Don’t touch anything inside `@ui` directly
- Always use `shadcn/ui` to install new components if needed

---

### Starting Instructions (Frontend Only)

We’ll begin with just the frontend.

**Step 1**: Build an empty data table using the Dice UI table component.

- No data yet, but include:
    - Columns
    - Search
    - Filter
    - Category controls
    - 3-dot menu for future edit/delete

We’ll load data, CRUD logic, and backend later.

GO!
