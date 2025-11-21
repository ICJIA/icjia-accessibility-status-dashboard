/**
 * @fileoverview Tool Info Tooltip Component
 * Displays information about accessibility testing tools (Axe, Lighthouse) with tooltips.
 *
 * @module components/ToolInfo
 */

import { Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ToolInfoProps {
  tool: "axe" | "lighthouse";
}

const toolDescriptions = {
  axe: {
    title: "Axe",
    description:
      "Open source accessibility testing engine. Runs programmatically to detect accessibility violations.",
  },
  lighthouse: {
    title: "Lighthouse",
    description:
      "Google's automated tool for auditing web page quality. Runs programmatically to assess accessibility, performance, and best practices.",
  },
};

/**
 * ToolInfo Component
 *
 * Displays a small info icon with a responsive, accessible tooltip describing an accessibility testing tool.
 *
 * Features:
 * - Responsive tooltip positioning (adjusts for viewport edges)
 * - Keyboard accessible (Enter/Space to toggle, Escape to close)
 * - Screen reader friendly with ARIA attributes
 * - Works on all screen sizes
 * - Touch-friendly on mobile devices
 *
 * @component
 * @param {ToolInfoProps} props - Component props
 * @param {string} props.tool - The tool to display info for ('axe' or 'lighthouse')
 * @returns {React.ReactElement} The info icon with tooltip
 *
 * @example
 * <ToolInfo tool="axe" />
 * <ToolInfo tool="lighthouse" />
 */
export function ToolInfo({ tool }: ToolInfoProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<
    "top" | "bottom" | "left" | "right"
  >("top");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const info = toolDescriptions[tool];
  const tooltipId = `tooltip-${tool}`;

  // Calculate optimal tooltip position to keep it within viewport
  useEffect(() => {
    if (!showTooltip || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 16; // 1rem padding from viewport edge

    // Check if tooltip fits above
    const fitsAbove = buttonRect.top - tooltipRect.height - 8 > padding;
    // Check if tooltip fits below
    const fitsBelow =
      buttonRect.bottom + tooltipRect.height + 8 < window.innerHeight - padding;
    // Check if tooltip fits to the left
    const fitsLeft = buttonRect.left - tooltipRect.width - 8 > padding;
    // Check if tooltip fits to the right
    const fitsRight =
      buttonRect.right + tooltipRect.width + 8 < window.innerWidth - padding;

    // Determine best position (prefer top, then bottom, then left, then right)
    if (fitsAbove) {
      setTooltipPosition("top");
    } else if (fitsBelow) {
      setTooltipPosition("bottom");
    } else if (fitsLeft) {
      setTooltipPosition("left");
    } else if (fitsRight) {
      setTooltipPosition("right");
    } else {
      // Fallback: use top with constrained width
      setTooltipPosition("top");
    }
  }, [showTooltip]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowTooltip(!showTooltip);
    } else if (e.key === "Escape") {
      setShowTooltip(false);
    }
  };

  const getTooltipClasses = () => {
    const baseClasses =
      "absolute px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50";

    switch (tooltipPosition) {
      case "top":
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case "bottom":
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case "left":
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case "right":
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    switch (tooltipPosition) {
      case "top":
        return "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700";
      case "bottom":
        return "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700";
      case "left":
        return "absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700";
      case "right":
        return "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700";
      default:
        return "";
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center justify-center ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded"
        aria-label={`Information about ${info.title}`}
        aria-describedby={showTooltip ? tooltipId : undefined}
        type="button"
      >
        <Info className="h-4 w-4" />
      </button>

      {showTooltip && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`${getTooltipClasses()} max-w-xs`}
          style={{
            maxWidth: "min(300px, calc(100vw - 2rem))",
          }}
        >
          <p className="font-semibold">{info.title}</p>
          <p className="text-gray-200 break-words">{info.description}</p>
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
}
