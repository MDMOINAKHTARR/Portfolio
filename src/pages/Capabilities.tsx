import { TopSecretStamp } from '../components/Stamps';
import { PageTransition } from '../components/PageTransition';
import { Github, Terminal, Code, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { ActivityHeatmaps } from '../components/ActivityHeatmaps';
import { CertificatesSection } from '../components/CertificatesSection';
import { SkillsCarousel } from '../components/SkillsCarousel';

export function Capabilities() {
  return (
    <PageTransition className="px-6 pt-6 pb-12 sm:px-20 sm:pt-10 sm:pb-24 relative overflow-hidden">
      <div className="mb-6">
        <TopSecretStamp text="SKILLS & CERTIFICATES" />
      </div>

      {/* Decorative Thumbprint / Watermark */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-[0.03] pointer-events-none grayscale sepia select-none">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[400px] h-[400px]">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      </div>

      {/* Classification Header */}


      {/* TECHNICAL SKILLS */}
      <section className="pt-2 z-10 relative">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-4 h-4" />
          <h2 className="text-xs font-bold tracking-[0.1em] font-mono leading-none pt-[2px]">TECHNICAL SKILLS (PRIMARY & SECONDARY)</h2>
        </div>
        <div className="border-t border-ink/10 pt-1">
          <div className="-mx-6 sm:-mx-8 mb-0">
            <SkillsCarousel />
          </div>
          <p className="text-xs font-mono italic opacity-80 leading-relaxed max-w-[90%] mb-12">
            <span className="bg-hl-pink-bg border border-hl-pink-border px-2 py-0.5 rounded-full not-italic text-[10px] tracking-wider shadow-sm mr-1">CERTIFIED</span> comprehensive stack and analytical tooling.
          </p>

          {/* Premium Thematic 5-Banner Grid Layout */}
          <div className="grid grid-cols-10 gap-2 mb-6">
            {/* Left Column (LeetCode & LinkedIn) */}
            <div className="col-span-4 flex flex-col gap-2">
              {/* LeetCode (Position 1: Top-Left) */}
              <a 
                href="https://leetcode.com/__moinn_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative w-full h-[130px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
              >
                <img 
                  src="/leetcode banner.jpg" 
                  alt="LeetCode Operations" 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-start gap-3 flex-col transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Code className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LEETCODE</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">ALGORITHM CHALLENGES // @__moinn_</p>
                    </div>
                  </div>
                </div>
              </a>

              {/* LinkedIn (Position 2: Bottom-Left - Taller) */}
              <a 
                href="https://www.linkedin.com/in/mdmoinakhtar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative w-full h-[120px] md:h-[210px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
              >
                <img 
                  src="/linkedin banner.jpg" 
                  alt="LinkedIn Operations" 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-start gap-3 flex-col transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Linkedin className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LINKEDIN</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">PROFESSIONAL NETWORK // @mdmoinakhtar</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Right Column (GitHub, 4th Image, Twitter) */}
            <div className="col-span-6 flex flex-col gap-2">
              {/* GitHub (Position 3: Top-Right - Biggest) */}
              <a 
                href="https://github.com/MDMOINAKHTARR" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative w-full h-[160px] md:h-[220px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
              >
                <img 
                  src="https://media1.tenor.com/m/czm3QzVCDJIAAAAC/batman-bruce-wayne.gif" 
                  alt="GitHub Operations Banner" 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-center gap-3 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Github className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">GITHUB</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">SOURCE REPOSITORY // @MDMOINAKHTARR</p>
                    </div>
                  </div>
                </div>
              </a>

              {/* Bottom Row inside Right Column (4th Image & Twitter side-by-side) */}
              <div className="grid grid-cols-10 gap-2 h-[90px] md:h-[120px]">
                {/* 4th Image (Position 4: Bottom-Middle - Smallest) */}
                <div className="relative overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px] col-span-4 h-full">
                  <img 
                    src="/4th image.jpg" 
                    alt="Classified Operations" 
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent flex flex-col justify-end p-2 transition-all duration-300">
                    <div className="font-mono text-[8px] tracking-widest text-paper/70 font-bold">CLASSIFIED // DATA-04</div>
                  </div>
                </div>

                <a 
                  href="https://x.com/Moincrafted" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px] col-span-6 h-full"
                >
                  <img
                    src="/twitter banner.jpg"
                    alt="Twitter / X Banner"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-2 sm:p-3 transition-all duration-300">
                    <div className="flex items-center gap-2 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <FaXTwitter className="w-4 h-4 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">TWITTER / X</h3>
                        <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">@Moincrafted</p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Contribution Matrices */}
          <div className="flex flex-col gap-6 mb-8">
            <ActivityHeatmaps />
          </div>

          <CertificatesSection />
        </div>
      </section>

    </PageTransition>
  );
}
