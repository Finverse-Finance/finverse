# Next Feature: Transactions Page (`@transactions`)

## 🧾 Overview

- This page will display a **table of all user transactions**.
- Users can **search, filter, and categorize** their transactions (both income and expenses).
- Users will be able to **add**, **edit**, and **delete** transactions.

---

## 1. 📊 Transaction Table Component

- **Component:** Use the **Data Table** from Dice UI
    - Docs: [https://www.diceui.com/docs/components/data-table](https://www.diceui.com/docs/components/data-table)
    - Live Example: [https://table.sadmn.com](https://table.sadmn.com)
- **Displayed Columns:**
    - Transaction type (Income / Expense)
    - Category
    - Date
    - Amount
- **Required Features:**
    - Search bar, filter functionality, and category dropdown
    - Row actions menu (⋮) with **Edit** and **Delete**
- **Note:** Most of the logic already exists. Just import components, tweak settings, wire up the data, and the table should work.

---

## 2. ➕ Add Transaction Form (Top of Page)

- A **"New Transaction"** button should open a modal form.
- **Use:** `shadcn/ui` Form component + `zod` for validation.
- **Form Fields:**
    - Transaction Type (Dropdown: Income / Expense)
    - Category (Dropdown with defaults)
    - Date (Date picker)
    - Amount (Number input, assume USD)

---

## 3. ⚙️ Data Processing Logic

- On any **Add/Edit/Delete** of a transaction:
    - Trigger the formatter script to update:
        - `formattedData` (for dashboard)
        - `financials` field (if relevant)
- Reference the `@api` formatting endpoint:
    - **Expense:** negative value
    - **Income:** positive value

---

## ✅ Summary of Steps

1. **Setup Table Layout**

    - Integrate Dice UI table
    - Display transactions
    - Add search/filter/category tools

2. **Add Row-Level Controls**

    - Implement 3-dot menu with Edit/Delete

3. **Build Transaction Form**

    - Create modal with `shadcn` form + `zod` validation

4. **Hook Up Form Logic**

    - On submit, call backend API
    - On success, trigger formatter script

5. **Edit/Delete Implementation**

    - Handle backend updates
    - Run formatter script after changes

6. **Ensure Data Consistency**
    - Keep `formattedData` and `financials` updated after every CRUD action

---

## 📝 Important Notes

- **Dice UI**: All relevant components are already installed  
  → Refer to [Dice UI Docs](https://www.diceui.com/docs/components/data-table) when needed.
- **shadcn/ui**: Use this for all UI components moving forward.
- **Clerk** is used for auth  
  → Look at existing files for how to retrieve the current user/session info.
- **Do not override onboarding flow.**  
  Users must complete onboarding first. The Transactions page should only be manually accessible for now—don’t force it on login.

---

## 🔨 Let's Start: Step 1

- Begin by getting the **default Dice UI table component working**.
- Then, **load transaction data from MongoDB**:
    - Create a simple API route under `/api/transactions` to fetch data.
    - Use that API to populate the Dice UI table.
- Once that’s working, we’ll fine-tune the UI, then add Edit/Delete buttons, followed by the form and data processing.

✅ Do **only frontend** for now — no backend logic outside of basic data loading.

> Let’s get Step 1 done, verify that the table renders properly with transaction data, then continue!
