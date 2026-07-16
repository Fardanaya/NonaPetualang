"use client";

import Navbar from "@/components/utils/Navbar";
import Footer from "@/components/utils/Footer";

const Template = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <Navbar />
      <div className="content-wrapper flex-1">
        <div id="content">
          {children}
        </div>
      </div> 
      <Footer />
    </main>
  );
};

export default Template;
