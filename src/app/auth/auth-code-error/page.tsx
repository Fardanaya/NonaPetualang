"use client";

import Link from "next/link";
import { Button } from "@/components/ui/heroui";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Authentication Error
          </h1>
          <p className="text-muted-foreground mb-6">
            There was an issue with the authentication process. Please try
            logging in again.
          </p>
          <Button as={Link} href="/auth/login" color="primary">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
