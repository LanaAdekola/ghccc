import React from "react";

export default function EventsSeparator({
  className = "",
}: EventsSeparatorProps) {
  return (
    <div className={`${className}`}>
      <svg width="100%" height="100%" style={{"overflow":"visible"}} preserveAspectRatio="none" viewBox="0 0 45 1" fill="none" xmlns="http://www.w3.org/2000/svg"><line y1="1.5" x2="45" y2="1.5" stroke="#2AABEE" stroke-width="3"/></svg>
    </div>
  );
}

interface EventsSeparatorProps {
  className?: string;
}