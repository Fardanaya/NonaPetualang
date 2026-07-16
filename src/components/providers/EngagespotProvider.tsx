"use client";

import { EngagespotProvider } from "@engagespot/react-hooks";
import { useSession } from "@/components/providers/SessionProvider";

export default function EngagespotContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSession();

  // Only initialize if user is logged in
  if (!user?.email) {
    return <>{children}</>;
  }

  return (
    <EngagespotProvider
      options={{
        apiKey: "x93la0kbu0a5vrt0qpaht6",
        userId: user.email,
      }}
    >
      {children}
    </EngagespotProvider>
  );
}
