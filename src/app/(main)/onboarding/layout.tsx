import { auth } from "@clerk/nextjs/server";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await auth();

    // Client-side redirection will handle navigation based on onboarding status
    // This layout simply renders the children
    console.log("Onboarding Layout - Rendering onboarding page");
    return <div className="flex min-h-screen flex-col items-center justify-center bg-background">{children}</div>;
}
