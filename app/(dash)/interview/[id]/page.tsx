import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { cn, getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id ?? "",
  });

  const imageSrc =
    typeof interview.coverImage === "string" &&
    interview.coverImage.trim() !== ""
      ? interview.coverImage
      : getRandomInterviewCover();

  const normalizedType = /mix/gi.test(interview.type)
    ? "Mixed"
    : interview.type.charAt(0).toUpperCase() + interview.type;
  const displayType =
    normalizedType.charAt(0).toUpperCase() +
    normalizedType.slice(1).toLowerCase();

  const typeBadgeColor =
    {
      Behavioral: "bg-blue-200",
      Technical: "bg-green-200",
      Mixed: "bg-yellow-200",
    }[displayType] || "bg-violet-200";

  const displayLevel = interview.level
    ? interview.level.charAt(0).toUpperCase() +
      interview.level.slice(1).toLowerCase()
    : "Beginner";

  return (
    <>
      <div className="flex flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-row gap-4">
          <Image
            src={imageSrc}
            alt="cover-image"
            width={50}
            height={50}
            className="rounded-full object-cover size-[50px]"
          />
          <h3 className="capitalize text-xl font-medium">
            {interview.role} Interview
          </h3>
        </div>

        <DisplayTechIcons techStack={interview.techstack} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-dark-300 px-3 py-2 rounded-full">
          <Image src="/question.svg" width={20} height={20} alt="questions" />
          <span className="text-white">
            {interview.questions?.length || 0} questions
          </span>
        </div>

        <div className="flex gap-2">
          {/* level badge */}
          <p className={cn("px-4 py-2 rounded-lg", typeBadgeColor)}>
            <span className="badge-text font-medium text-white">
              {displayLevel}
            </span>
          </p>
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        // userAvatar={user?.photoURL}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
