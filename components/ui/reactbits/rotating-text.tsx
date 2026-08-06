"use client";

import { forwardRef, useState, useMemo, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  texts: string[];
  transition?: object;
  initial?: object;
  animate?: object;
  exit?: object;
  animatePresenceMode?: "wait" | "sync" | "popLayout";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

export const RotatingText = forwardRef<unknown, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useImperativeHandle(ref, () => ({
      next: () => handleNext(),
      jumpTo: (i: number) => setCurrentTextIndex(i),
      reset: () => setCurrentTextIndex(0),
    }));

    const splitIntoCharacters = (text: string) => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), (s) => s.segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex];
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      return currentText.split(" ").map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1,
      }));
    }, [texts, currentTextIndex, splitBy]);

    const handleNext = () => {
      const nextIndex = (currentTextIndex + 1) % texts.length;
      setCurrentTextIndex(nextIndex);
      onNext?.(nextIndex);
    };

    return (
      <motion.span
        className={cn("text-rotate inline-flex flex-wrap", mainClassName)}
        layout
        transition={transition}
      >
        <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            className="text-rotate flex flex-wrap"
            aria-hidden="true"
          >
            {elements.map((wordObj, wordIndex, array) => {
              const totalChars = array.reduce(
                (sum, w) => sum + w.characters.length,
                0
              );
              let charOffset = 0;
              for (let i = 0; i < wordIndex; i++) {
                charOffset += array[i].characters.length;
              }
              return (
                <span
                  key={`${currentTextIndex}-${wordIndex}`}
                  className={cn("text-rotate-word inline-flex", splitLevelClassName)}
                >
                  {wordObj.characters.map((char, charIndex) => {
                    const globalIndex = charOffset + charIndex;
                    const delay =
                      staggerDuration > 0
                        ? (globalIndex / Math.max(totalChars - 1, 1)) * staggerDuration
                        : 0;
                    return (
                      <motion.span
                        key={`${currentTextIndex}-${wordIndex}-${charIndex}`}
                        initial={initial as never}
                        animate={animate as never}
                        exit={exit as never}
                        transition={{
                          ...(transition as object),
                          delay,
                        }}
                        className={cn("text-rotate-element inline-block", elementLevelClassName)}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                  {wordObj.needsSpace && <span className="text-rotate-space">&nbsp;</span>}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  }
);

RotatingText.displayName = "RotatingText";
