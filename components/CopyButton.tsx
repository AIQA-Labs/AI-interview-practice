"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { copyToClipboard, isClipboardAvailable } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

const CopyButton = ({ text, className, label = "Copy" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Check clipboard support on mount
  useEffect(() => {
    setClipboardSupported(isClipboardAvailable());
  }, []);

  const handleCopy = async () => {
    // If clipboard is not supported, show fallback immediately
    if (!clipboardSupported) {
      setShowFallback(true);
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.select();
        }
      }, 100);
      return;
    }

    try {
      // Try using our utility function
      const success = await copyToClipboard(text);

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Show fallback textarea if clipboard API is not available
        setShowFallback(true);
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.select();
            // Try the execCommand as a last resort
            try {
              document.execCommand("copy");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (e) {
              console.error("execCommand failed:", e);
              // Just let the user manually copy from the textarea
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      // Show fallback textarea
      setShowFallback(true);
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.select();
        }
      }, 100);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleCopy}
        className={className}
        variant="outline"
        size="sm"
        title={!clipboardSupported ? "Clipboard API not available" : undefined}
      >
        {copied ? "Copied!" : !clipboardSupported ? "Manual Copy" : label}
      </Button>

      {showFallback && (
        <div className="absolute bottom-full mb-2 p-2 bg-dark-200 rounded-md shadow-lg z-50 w-64">
          <p className="text-xs text-light-100 mb-1">
            Copy this text manually:
          </p>
          <textarea
            ref={textAreaRef}
            value={text}
            className="w-full h-24 p-1 text-xs bg-dark-300 text-light-100 rounded border border-light-600"
            readOnly
            onClick={(e) => e.currentTarget.select()}
          />
          <Button
            size="sm"
            variant="secondary"
            className="mt-1 text-xs w-full"
            onClick={() => setShowFallback(false)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default CopyButton;
