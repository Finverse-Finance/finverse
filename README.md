# Finverse

<p align="center">
  <img src="https://i.ibb.co/8Lk6sx5S/logo-transparent.png" alt="Finverse Logo" width="150" />
  <br>
  <em>💰 Finverse: Personal Finance Management 📊</em>
</p>

Finverse is a comprehensive personal finance web application designed to help students manage their finances by tracking account balances, income, and expenses. With Finverse, users can monitor their financial health, get AI-powered insights, and take control of their financial future.

---

## ✨ Features

- 💼 **Transaction Tracking:** Create, update, delete, search, and filter transactions
- 🏦 **Account Management:** Support for manual account entry and Plaid-linked bank accounts
- 📊 **Dashboard Overview:** Visual summaries of your financial status with interactive charts
- 📝 **Daily Financial Reports:** AI-generated insights about your spending patterns and trends
- 🤖 **Interactive Q/A Assistant:** Ask questions about your finances and get data-driven answers
- 💱 **Multi-Currency Support:** Toggle between USD, EUR, GBP, and CAD

## 🚀 Tech Stack

- ✅ **Bootstrapping**: [create-t3-app](https://create.t3.gg)
- ✅ **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- ✅ **Styling**: [Tailwind CSS](https://tailwindcss.com)
- ✅ **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- ✅ **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- ✅ **User Authentication**: [Clerk](https://clerk.com/)
- ✅ **Bank Integration**: [Plaid](https://plaid.com/)
- ✅ **AI Integration**: [Gemini API](https://ai.google.dev/)
- ✅ **Data Visualization**: [Recharts](https://recharts.org/en-US/)
- ✅ **Schema Validation**: [Zod](https://zod.dev/)
- ✅ **Icons**: [Lucide](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Clerk account for authentication
- Plaid account (for bank integration)
- Gemini API key (for AI features)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/finverse.git
    cd finverse
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

    ```
    # Environment
    NODE_ENV=development

    # Database
    MONGODB_URI=your_mongodb_connection_string

    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

    # Plaid
    PLAID_CLIENT_ID=your_plaid_client_id
    PLAID_SECRET=your_plaid_secret
    PLAID_ENV=sandbox

    # Gemini API
    GEMINI_API_KEY=your_gemini_api_key
    ```

4. Run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🙌 Contributors

<a href="https://github.com/PartnerFind/partnerfind.tech/graphs/contributors"> <img height="128" src="https://avatars.githubusercontent.com/u/67123306?v=4"/></a>
<a href="https://github.com/PartnerFind/partnerfind.tech/graphs/contributors"> <img height="128" src="https://avatars.githubusercontent.com/u/86448548?v=4"/></a>
<a href="https://github.com/PartnerFind/partnerfind.tech/graphs/contributors"> <img height="128" src="https://avatars.githubusercontent.com/u/67066931?v=4"/></a>

---

<p align="center">Built with ❤️ for FBLA Coding & Programming 2024-25</p>
