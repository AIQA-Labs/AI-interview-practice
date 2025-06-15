"use client";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface GetInterviewProps {
  userName: string;
  userId: string;
  type: string;
  interviewId?: string;
  questions?: string[];
}

const GetInterview = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: GetInterviewProps) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  // const callStatus = CallStatus.ACTIVE;
  //const isSpeaking = true;
  //const messages = [
  //   'Whats your name?',
  //   'My name is John Doe, nice to meet you!'
  //];

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error", error);
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
  }, []);
  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log("Generate feedback here.");
    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
      setIsRedirecting(true); // Start loading before route change
    } else {
      console.log("Error saving feedback");
      router.push("/dashboard");
    }
  };
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  });

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
        metadata: {
          user: {
            name: userName,
            id: userId,
          },
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
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        {isRedirecting && <div></div>}
        <div className="card-interviewer">
          <div className="avatar size-[130px]">
            <Image
              src="/avatars/interviewer-default.png"
              alt="Interviewer"
              width={128}
              height={128}
              className="object-cover rounded-full w-full h-full"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Chloe</h3>
          <h4>Virtual Interviewer</h4>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              width={543}
              height={540}
              className="rounded-full object-cover size-[120px]"
              alt="user"
            />{" "}
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="bg-dark-600 rounded-lg p-4 mx-4">
          <div className="flex items-center gap-2 mb-2 text-primary-500">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live transcript</span>
          </div>
          <p
            key={latestMessage}
            className="text-light-100 text-lg animate-fadeIn"
          >
            {latestMessage}
          </p>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className={cn(
              "relative px-6 py-3 rounded-full font-medium",
              "bg-primary-500 hover:bg-primary-600 text-dark-900",
              "transition-colors duration-200",
              callStatus === "CONNECTING" && "opacity-75 cursor-wait"
            )}
            onClick={handleCall}
            disabled={callStatus === "CONNECTING"}
          >
            {callStatus === "CONNECTING" && (
              <span className="absolute top-0 left-0 w-full h-full bg-primary-500 rounded-full opacity-50 animate-ping" />
            )}
            <span className="relative">
              {isCallInactiveOrFinished ? "Start Interview" : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default GetInterview;
