"use client";

import { useEffect, useState } from "react";

const Template = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default Template;
