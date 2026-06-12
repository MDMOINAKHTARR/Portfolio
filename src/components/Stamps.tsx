import { Paperclip } from './Paperclip';

export function TopSecretStamp({ text = "VERIFIED PORTFOLIO" }: { text?: string }) {
  const isDefault = text === "VERIFIED PORTFOLIO" || text === "SKILLS" || text === "SKILLS & CERTIFICATES";
  const textClasses = isDefault 
    ? "text-lg sm:text-[24px] md:text-[28px] lg:text-[40px] tracking-[0.2em]" 
    : "text-sm sm:text-lg md:text-[20px] lg:text-[28px] whitespace-nowrap tracking-[0.1em] sm:tracking-[0.15em]";

  return (
    <div className="w-full flex justify-center sm:justify-start sm:pl-6 md:pl-12 lg:pl-[60px] xl:pl-[80px] pointer-events-none mb-4 sm:mb-2 -mt-2 sm:-mt-4 relative z-10 opacity-[0.95]">
      <div className="relative inline-block transform -rotate-[2deg]">
        <Paperclip className="top-[-26px] left-[-8px] sm:top-[-36px] sm:left-[-12px] transform rotate-[10deg] scale-75 sm:scale-100 z-20" />
        
        <span className={`block font-stamp text-stamp px-2 sm:px-4 lg:px-5 py-0.5 sm:py-1 lg:py-1.5 border-[2px] sm:border-[3px] lg:border-[4px] border-stamp/80 rounded mix-blend-multiply inline-block ${textClasses}`}>
          {text}
        </span>
      </div>
    </div>
  );
}

export function ClassifiedStamp() {
  return (
    <div className="absolute bottom-16 right-6 sm:right-12 pointer-events-none z-30">
      <span className="block font-stamp text-stamp text-4xl sm:text-6xl px-6 py-2 border-[6px] border-stamp/70 rounded-md tracking-widest opacity-80 mix-blend-multiply transform -rotate-[15deg] whitespace-nowrap">
        CLASSIFIED
      </span>
    </div>
  );
}
