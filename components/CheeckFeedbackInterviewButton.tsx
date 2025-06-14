"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface Props {
  hasFeedback: boolean;
  interviewId: string;
}

const CheckFeedbackInterviewButton = ({ hasFeedback, interviewId }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    const url = hasFeedback
      ? `/interview/${interviewId}/feedback`
      : `/interview/${interviewId}`;
    router.push(url);
  };

  return (
    <Button onClick={handleClick} className="btn-primary">
      <p className="text-black">
        {hasFeedback ? "Check Feedback" : "View Interview"}
      </p>
    </Button>
  );
};

export default CheckFeedbackInterviewButton;
