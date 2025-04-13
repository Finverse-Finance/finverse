import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo_transparent.png" alt="Finverse Logo" width={40} height={40} />
                        <span className="text-2xl font-bold text-orange-500 hover:text-orange-600">Finverse</span>
                    </Link>
                    <div className="hidden md:flex space-x-6">
                        <Link href="/dashboard" className="text-gray-700 hover:text-orange-500 font-medium">
                            Dashboard
                        </Link>
                        <Link href="/transactions" className="text-gray-700 hover:text-orange-500 font-medium">
                            Transactions
                        </Link>
                        <Link href="/reports" className="text-gray-700 hover:text-orange-500 font-medium">
                            Reports
                        </Link>
                        <Link href="/assistant" className="text-gray-700 hover:text-orange-500 font-medium">
                            Assistant
                        </Link>
                    </div>
                    <div>
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-orange-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Manage Your Finances with <span className="text-orange-500">Finverse</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10">
                            Track your accounts, manage transactions, and get AI-powered insights to take control of
                            your financial future.
                        </p>
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors inline-block">
                                    Get Started
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors inline-block"
                            >
                                Go to Dashboard
                            </Link>
                        </SignedIn>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How to use Finverse</h2>

                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-semibold">
                                    Track Your Finances
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600">
                                    Easily manage all your transactions in one place. Add, edit, and categorize expenses
                                    and income. Link your bank accounts through Plaid for automatic imports, or manually
                                    enter transactions—it's your choice.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-semibold">
                                    Dashboard Overview
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600">
                                    Get a complete picture of your finances at a glance. View your total balance,
                                    interactive charts of income and expenses, and see your most recent transactions—all
                                    from your personalized dashboard.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-semibold">
                                    Daily Financial Reports
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600">
                                    Receive AI-generated daily summaries of your financial activity. Get insights about
                                    your spending patterns, savings opportunities, and financial trends without having
                                    to crunch the numbers yourself.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-semibold">
                                    Financial Assistant
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600">
                                    Ask questions about your finances and get instant, data-driven answers. Our AI
                                    assistant understands your financial context and can provide personalized insights
                                    like "What did I spend on dining last month?" or "How does my spending compare to
                                    last month?"
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>
        </div>
    );
}
