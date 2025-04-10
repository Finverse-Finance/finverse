# 2. App Flow Document

The application opens at the homepage ("/"). This is a public-facing landing page with a dark theme and a clean modern layout. The main headline clearly explains what the app does: help students manage their finances. It includes a top navigation bar with links to “Log In” or “Sign Up.” Authentication is powered by Clerk and allows users to log in via Google or email. No passwords are stored locally—Clerk handles everything securely.

After logging in, users are redirected to the onboarding screen at “/onboarding.” This page presents two clear options:

1. Link bank accounts using Plaid to auto-import real transactions.
2. Skip Plaid and proceed with manual transaction entry.

Regardless of the choice, all transactions can be manually added, edited, or deleted later. The user’s choice, along with their Clerk user ID and onboarding status, is stored in MongoDB.

Once onboarding is completed, the user is redirected to the dashboard at “/dashboard.” This is the main financial overview page and it includes a persistent sidebar navigation (visible on every page except “/”).

The dashboard displays:

- Total balance across all accounts
- Income and expenses summary for the current month
- An interactive chart showing income vs. expenses
- A list of the latest 5 transactions, including date, amount, and category
- A “View All” hyperlink under the transactions list that routes to “/transactions” and opens the full transaction manager

The dashboard also shows Shadcn toast alerts if:

- The user exceeds 120% of their average monthly spending
- Their total balance drops below $50 (or local currency equivalent)
- They update or delete a transaction

From here, users can click any link in the sidebar to navigate between sections.

The Transactions page ("/transactions") is a full-featured transaction manager. It includes:

- A table showing all transactions (Plaid-imported and manually added)
- Filters to narrow results by category, date range, amount range, or keyword (from the notes field)
- Columns for: Date, Amount, Category, Notes, Source (Plaid or Manual)
- Ability to sort any column (e.g. sort by date descending)
- Inline editing: users can click a row to edit the entry
- Delete buttons to remove entries
- “Add Transaction” form for manual users (fields: Date, Amount, Category, Notes)
- All edits sync to MongoDB instantly
- For Plaid-linked users, auto-imported transactions appear with a badge or label; they can still be tweaked or deleted

This page fully meets all rubric criteria:

- Allows tracking of balances, income, and expenses
- Lets users input amount, category, and date
- Categorizes transactions to show patterns
- Supports update and delete
- Offers complete search and filtering tools

The Daily Reports page ("/daily-reports") shows a feed of AI-generated summaries. Each time a user logs in or adds new transactions, a new daily financial report is created using Gemini API. On this page, the user sees:

- A highlighted card at the top showing the latest summary (based on today’s or most recent transaction changes)
- A scrollable list of past daily summaries in reverse chronological order
- A search box to filter reports by date, keyword, or category
- Clicking any summary expands it into a detailed view, showing trends, insights, and spending breakdowns for that day

The Q/A Assistant page ("/assistant") provides a full-screen chat interface. It features:

- A persistent chat window powered by the Gemini API
- Full context of the user’s financial history (accounts, transactions, summaries)
- Users can ask free-form questions like:
    - “How much did I spend on groceries in March?”
    - “Show me my top 3 spending categories this month”
    - “Compare this month’s income to last month’s”
- The assistant responds in plain English with accurate data pulled from MongoDB
- It also supports search queries and can retrieve records, summaries, or comparisons

Every page except the homepage includes a fixed sidebar for navigation. This sidebar contains links to:

- Dashboard (/dashboard)
- Transactions (/transactions)
- Daily Reports (/daily-reports)
- Assistant (/assistant)
- Wallet (/wallet)
- Settings (/settings)
- Log Out (via Clerk)

The homepage (“/”) uses a top navbar instead of the sidebar and includes only public navigation (e.g. “Sign Up” or “Log In”).

The Settings page ("/settings") includes:

- Currency toggle (USD, EUR, GBP, CAD) with conversions:
    - 1 USD = 0.89 EUR
    - 1 USD = 1.40 CAD
    - 1 USD = 0.77 GBP
- Currency selection is stored in localStorage as { currency: "USD" }
- Toggle to enable/disable Shadcn toast notifications

The Wallet page ("/wallet") allows users to view and manage accounts:

- Manual users can add/edit/delete accounts
- Plaid-linked accounts are read-only but synced with live balances
- All accounts show account type (bank, credit, cash), name, and current balance

All features and flows are designed to hit every rubric requirement:
✅ Code Quality (modular, readable, well-commented)
✅ User Experience (clear instructions, easy navigation, helpful validation)
✅ Functionality (complete coverage of prompt with real-time updates)
✅ Reporting (custom reports, filters, summaries, exportable visualizations)
✅ Presentation (logical structure, clearly explainable, AI enhancements, intuitive flow)

This flow ensures the app is intuitive, modular, AI-integrated, and competition ready.
