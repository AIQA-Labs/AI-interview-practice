"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  END = "END",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  userAvatar,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  // Add question tracking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = questions?.length || 0;

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = async () => {
      try {
        // Wait for final messages to flush
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCallStatus(CallStatus.END);
      } catch (error) {
        console.error("Error handling call end:", error);
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        // Track question progress - only increment counter when AI asks a MAIN question
        // We'll use a more sophisticated approach to identify main questions
        if (
          message.role === "assistant" &&
          totalQuestions > 0 &&
          currentQuestionIndex < totalQuestions
        ) {
          // Check if this message contains a question that matches one of our prepared questions
          if (message.transcript.includes("?") && questions) {
            // Try to match this message with one of our prepared questions
            const isMainQuestion = questions.some((question) => {
              // Create a simplified version of both texts for comparison (lowercase, no punctuation)
              const simplifiedTranscript = message.transcript
                .toLowerCase()
                .replace(/[^\w\s]/g, "");
              const simplifiedQuestion = question
                .toLowerCase()
                .replace(/[^\w\s]/g, "");

              // Check if the transcript contains a significant portion of the question
              // This helps match even if the AI rephrases slightly
              return simplifiedTranscript.includes(
                simplifiedQuestion.substring(
                  0,
                  Math.min(30, simplifiedQuestion.length)
                )
              );
            });

            if (isMainQuestion) {
              setCurrentQuestionIndex((prev) => prev + 1);
              console.log(
                `Question ${
                  currentQuestionIndex + 1
                }/${totalQuestions} asked (matched with prepared question)`
              );
            }
          }
        }
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);

      // More robust error handling for meeting ended errors
      if (
        typeof error === "object" &&
        error !== null &&
        // Check various possible error message formats
        ((error.message && error.message.includes("Meeting has ended")) ||
          error.toString().includes("Meeting has ended") ||
          JSON.stringify(error).includes("Meeting has ended"))
      ) {
        console.log("Detected meeting end, transitioning to FINISHED state");
        setCallStatus(CallStatus.END);
        vapi.stop(); // Ensure VAPI is properly stopped
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [currentQuestionIndex, totalQuestions, questions]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.END) {
      if (type === "generate") {
        toast.success("Interview saved - Redirecting to dashboard...", {
          duration: 3000,
          id: "generate-toast",
        });
        // Wait for Firestore persistence and refresh dashboard
        setTimeout(() => {
          router.refresh();
          router.push("/dashboard");
        }, 2500);
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };
  function handleDisconnect(): void {
    vapi.stop();
    setCallStatus(CallStatus.END);
  }

  return (
    <>
      {/* Add margin-bottom to the cards for space below */}
      <div className="call-view flex gap-x-10 mb-10 px-4">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/logo_2.png"
              alt="profile-image"
              width={114}
              height={65}
              className="object-cover rounded-full"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src={userAvatar || "/user-avatar.png"}
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Add margin-top to the button for space above */}
      <div className="flex justify-center mt-10">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "END"
                ? "Call"
                : ". . .Calling"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
