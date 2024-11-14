import React, { useEffect, useState } from "react";
import CTA from "../../images/main-bg.svg";

/**
 * 
 * @param {content} content :object, content.quote : text, content.scripture : text
 * 
 * @returns 
 */
export const Cta = ({ content }) => {
  const quotes = [
    { quote: "To fully equip and perfect the saints (God’s people) for works of service, to build up the body of Christ [the church], until we all reach oneness in the faith and in the knowledge of the Son of God.", scripture: "Ephesians 4:12" },
    { quote: "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers, For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ", scripture: "Ephesians 4:11,12" },
    { quote: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.", scripture: "2 Timothy 2:15" },
    // Add more quotes as needed
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false); // Track exiting state

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true); // Trigger the exit transition

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setIsExiting(false); // Reset after transition ends
      }, 1000); // 1 second transition for exit
    }, 6000); // 3 seconds for staying, 1 second for transition

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div style={{ position: 'relative', height: 'full', overflow: 'hidden' }}>
      {/* Background Image */}
      <div
        style={{
          backgroundImage:  `url(${CTA})`, // Background image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      />

      {/* Blue Overlay */}
      <div
        className="bg-sky-400 opacity-20"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="roboto flex font-normal w-full flex-col items-center gap-y-2 px-6 py-4 md:px-12 md:py-9 text-center text-white"
        style={{ position: 'relative', zIndex: 2 }}
      >
        {/* Quote */}
        <h3
          className={`text-xs sm:text-lg md:text-lg lg:text-xl lg:leading-6 lg:tracking-wider transition-transform duration-1000 ease-in-out transform ${
            isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          {quotes[currentIndex].quote}
        </h3>
        
        {/* Scripture */}
        <div className={`font-semibold text-xs sm:text-sm md:text-lg lg:text-lg transition-transform duration-1000 ease-in-out transform ${
            isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          {quotes[currentIndex].scripture}
        </div>
      </div>
    </div>
  );
};
