import React, { Fragment, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface FocusParagraphProps {
  sentences: (string | React.ReactNode)[];
  /**
   * Which sentence is lit from outside (null lights none). Leave undefined
   * to follow reader's pointer and keyboard.
   */
  active?: number | null;
  className?: string;
}

export function FocusParagraph({
  sentences,
  active: activeProp,
  className,
}: FocusParagraphProps) {
  const [hovered, setActive] = useState<number | null>(null);
  const active = activeProp === undefined ? hovered : activeProp;
  const focused = useRef<number | null>(null);

  return (
    <p
      className={cn("text-base leading-7 text-pretty text-ink", className)}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        setActive(focused.current);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        focused.current = null;
        setActive(null);
      }}
    >
      {sentences.map((sentence, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span
            tabIndex={0}
            data-state={active === null ? "idle" : active === i ? "focus" : "dim"}
            onPointerEnter={(e) => {
              if (e.pointerType !== "touch") setActive(i);
            }}
            onPointerUp={(e) => {
              if (e.pointerType === "touch") setActive((a) => (a === i ? null : i));
            }}
            onFocus={(e) => {
              if (!e.currentTarget.matches(":focus-visible")) return;
              focused.current = i;
              setActive(i);
            }}
            className={cn(
              "rounded-[3px] box-decoration-clone outline-hidden inline",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ink/40",
              "transition-[opacity,filter] ease-[cubic-bezier(0.23,1,0.32,1)]",
              "data-[state=dim]:opacity-35 data-[state=dim]:blur-[0.6px] data-[state=dim]:duration-300",
              "data-[state=focus]:duration-200 data-[state=idle]:duration-300",
              "motion-reduce:data-[state=dim]:filter-none",
            )}
          >
            {sentence}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

export default FocusParagraph;
