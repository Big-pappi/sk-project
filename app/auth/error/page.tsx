import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Authentication Error
      </h2>
      
      <p className="text-muted-foreground mb-6">
        Something went wrong during authentication. This could be because the 
        link has expired or was already used.
      </p>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/auth/sign-up">Try Again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
