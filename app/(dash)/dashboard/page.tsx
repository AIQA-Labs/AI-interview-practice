import Spline from "@splinetool/react-spline/next";

import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import AnimatedCTAButton from "@/components/AnimatedCTAButton";
import AnimatedText from "@/components/AnimatedText";
import Footer from "@/components/Footer";
import AllInterviewsList from "@/components/AllInterviewsList";
import ClientInterviewCard from "@/components/ClientInterviewCard";
import AvatarPicker from "@/components/avatar/AvatarPicker";
import SignOutButton from "@/components/SignOutButton";
import Image from "next/image";

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews = [], allInterview = []] = await Promise.all([
    getInterviewsByUserId(user?.id || ""),
    getLatestInterviews({ userId: user?.id || "" }),
  ]);

  return (
    <>
      {/* Navigation Section */}
      <div className="root-layout">
        <nav className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_2.png"
              alt="MockMate Logo"
              width={72}
              height={72}
            />
            <h2 className="text-primary-100">AIQA</h2>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-primary-100 font-medium">{user?.name}</span>
              <AvatarPicker
                currentAvatar={user?.photoURL || ""}
                userId={user?.id}
                userName={user?.name}
              />
              <SignOutButton />
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <section className="card-cta justify-around md:flex-row items-center">
        <div className="flex flex-col gap-8 max-w-md mt-6 sm:mt-0">
          <AnimatedText delay={0.1}>
            <h2>
              <span className="text-indigo-300">AI-Powered</span> Real-Time
              Interview Platform for Smarter Hiring
            </h2>
          </AnimatedText>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <AnimatedCTAButton href="/interview" delay={0.3}>
            Create Interview
          </AnimatedCTAButton>
        </div>

        <div style={{ width: 500, height: 500 }} className="max-sm:hidden">
          <Spline
            className="flex flex-col justify-around gap-6 max-w-md mt-6 sm:mt-0"
            scene="https://prod.spline.design/pW1PEsPooVGYcbWe/scene.splinecode"
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {userInterviews && userInterviews.length > 0 ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>
          All Interviews{" "}
          {allInterview && allInterview.length > 0 && (
            <span className="text-primary-200">({allInterview.length})</span>
          )}
        </h2>

        {allInterview && allInterview.length > 0 ? (
          <AllInterviewsList
            renderedCards={await Promise.all(
              allInterview.map(async (interview) => {
                const interviewCard = (
                  <InterviewCard
                    key={interview.id}
                    userId={user?.id}
                    interviewId={interview.id}
                    role={interview.role}
                    type={interview.type}
                    techstack={interview.techstack}
                    createdAt={interview.createdAt}
                    coverImage={interview.coverImage}
                    level={interview.level}
                    questions={interview.questions}
                  />
                );

                return (
                  <ClientInterviewCard
                    key={interview.id}
                    interview={interview}
                    userId={user?.id}
                    interviewCard={interviewCard}
                  />
                );
              })
            )}
          />
        ) : (
          <p>There are no interviews available</p>
        )}
      </section>

      <Footer />
    </>
  );
};

export default page;
