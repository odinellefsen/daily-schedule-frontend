import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Get Started</h1>
          <p className="text-muted-foreground mt-2">
            Create your Daily Scheduler account
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary text-primary-foreground hover:bg-primary/90",
              card: "bg-card border-border",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  );
} 