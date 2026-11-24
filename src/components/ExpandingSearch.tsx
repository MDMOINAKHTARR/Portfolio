import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useReducedMotion } from '../lib/use-reduced-motion';

interface ExpandingSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number;
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function ExpandingSearch({
  value,
  onChange,
  placeholder = 'Search projects',
  width = 240,
}: ExpandingSearchProps) {
  const inputId = useId();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(Boolean(value));
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    onChange('');
  };

  const open = () => setIsOpen(true);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/' || isOpen || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || isEditableElement(event.target)) return;
      event.preventDefault();
      open();
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.7 };

  return (
    <motion.form
      ref={formRef}
      role="search"
      initial={false}
      animate={{ width: isOpen ? width : 40 }}
      transition={transition}
      onSubmit={(event) => event.preventDefault()}
      onBlur={(event) => {
        if (!isOpen || value) return;
        if (formRef.current?.contains(event.relatedTarget as Node | null)) return;
        setIsOpen(false);
      }}
      className="relative h-10 shrink-0 overflow-hidden rounded-full border border-ink/25 bg-paper/95 text-ink shadow-[0_3px_9px_rgba(40,25,10,0.14)] transition-transform duration-150 active:scale-[0.96] focus-within:border-stamp focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stamp"
    >
      <Search
        aria-hidden="true"
        className={`pointer-events-none absolute left-3 top-3 z-10 h-4 w-4 transition-colors ${isOpen ? 'text-stamp' : 'text-ink/70'}`}
      />
      <button
        ref={triggerRef}
        type="button"
        aria-label="Search projects"
        aria-expanded={isOpen}
        aria-controls={inputId}
        aria-keyshortcuts="/"
        onClick={open}
        className={`absolute inset-0 rounded-full outline-none ${isOpen ? 'invisible' : ''}`}
      />
      <label htmlFor={inputId} className="sr-only">Search projects</label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          close();
          triggerRef.current?.focus();
        }}
        style={{ width }}
        className={`absolute inset-y-0 left-0 bg-transparent py-0 pl-10 pr-10 font-mono text-xs text-ink outline-none placeholder:text-ink/45 [&::-webkit-search-cancel-button]:appearance-none ${isOpen ? '' : 'invisible'}`}
        placeholder={isOpen ? placeholder : ''}
      />
      <AnimatePresence initial={false}>
        {isOpen && value && (
          <motion.button
            key="clear"
            type="button"
            aria-label="Clear project search"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stamp"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
