"use client";
import { useUser } from "@clerk/nextjs";
import SplitText from "./ui/hello-text";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { GlowingEffect } from "./ui/glowing-effect";

const HeroText = () => {
  const { user, isLoaded } = useUser();
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (cardsRef.current && titleRef.current) {
      const cards = cardsRef.current.querySelectorAll(".question-card");
      const title = titleRef.current;

      // Set initial state
      gsap.set([title, ...cards], { opacity: 0, y: 30 });

      // Animate title first, then cards with stagger
      const tl = gsap.timeline();
      tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.6, // Start after the text animation
      }).to(
        cards,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        },
        "-=0.3"
      ); // Start cards animation 0.3s before title finishes
    }
  }, [isLoaded]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <div className="text-center space-y-4">
        {isLoaded ? (
          <SplitText
            text={`Good Afternoon, ${user?.firstName}`}
            className="text-4xl md:text-5xl mt-20 font-semibold text-black"
            delay={50}
            duration={0.2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            // onLetterAnimationComplete={handleAnimationComplete}
          />
        ) : (
          <Skeleton className="h-12 md:h-16 w-96 max-w-full" />
        )}
      </div>

      {/* Question Templates Section */}
      <div className="w-full max-w-6xl px-4">
        <div className="text-center mb-8">
          <h2
            ref={titleRef}
            className="text-xl font-medium text-gray-600 uppercase tracking-wide"
          >
            GET STARTED WITH AN EXAMPLE BELOW
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* AI Tutor Card */}
          <div className="question-card relative">
            <GlowingEffect
              disabled={false}
              proximity={100}
              spread={40}
              blur={1}
              glow={true}
              className="rounded-lg"
            />
            <div className="bg-white min-h-52 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Learn with AI Tutor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get 30-40 second video explanations on any topic from your
                    personal AI tutor
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Whiteboard Card */}
          {/* Whiteboard Card */}
          <div className="question-card relative">
            <GlowingEffect
              disabled={false}
              proximity={100}
              spread={40}
              blur={1}
              glow={true}
              className="rounded-lg"
            />
            <div className="bg-white min-h-52 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Whiteboard Problem Solving
                  </h3>
                  <p className="text-sm text-gray-600">
                    Solve problems on an interactive whiteboard with real-time
                    AI assistance
                  </p>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Blank Chat Card */}
          <div className="question-card relative">
            <GlowingEffect
              disabled={false}
              proximity={100}
              spread={40}
              blur={1}
              glow={true}
              className="rounded-lg"
            />
            <div className="bg-white min-h-52 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Start Learning Journey
                  </h3>
                  <p className="text-sm text-gray-600">
                    Begin with a blank template, use your books as reference,
                    and take quizzes along the way
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Last Chat Card */}
          <div className="question-card relative">
            <GlowingEffect
              disabled={false}
              proximity={100}
              spread={40}
              blur={1}
              glow={true}
              className="rounded-lg"
            />
            <div className="bg-white min-h-52 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Continue Last Session
                  </h3>
                  <p className="text-sm text-gray-600">
                    Pick up right where you left off in your previous learning
                    session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroText;
