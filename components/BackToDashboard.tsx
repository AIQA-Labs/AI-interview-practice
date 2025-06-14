"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const BackToDashboardButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard");
  };

  return (
    <Button onClick={handleClick} className="btn-secondary px-4 py-2">
      <p className="text-xs font-semibold text-primary-200 text-center">
        Back to dashboard
      </p>
    </Button>
  );
};

export default BackToDashboardButton;
