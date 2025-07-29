import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your Daily Scheduler account
          </p>
        </div>
        <SignIn 
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