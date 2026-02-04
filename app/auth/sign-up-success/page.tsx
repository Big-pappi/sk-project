import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Check your email
      </h2>
      
      <p className="text-muted-foreground mb-6">
        We've sent you a confirmation link. Please check your email and click the 
        link to verify your account.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Didn't receive the email?</strong>
          <br />
          Check your spam folder or try signing up again with a different email address.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>
    </div>
  );
}
