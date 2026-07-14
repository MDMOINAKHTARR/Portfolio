import { Highlight } from '../components/Highlight';
import { TopSecretStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { ScrambleText } from '../components/ScrambleText';
import { Lock, Unlock, Github, ExternalLink, PlayCircle } from 'lucide-react';
import React, { useState } from 'react';
import { OperationCard } from '../components/OperationCard';

export function Operations() {
  return (
    <PageTransition className="px-6 py-12 sm:px-20 sm:py-24">
      <TopSecretStamp text="ATTACHMENT B: DECLASSIFIED OPERATIONS" />
      
      <div className="space-y-12 mt-8">
        
        {/* OP 1 */}
        <OperationCard
          id="OP-001"
          delay={0.6}
          title="LAZYCLIP.BUZZ"
          tech="Open Source, Video Editing, Natural Language, Captions, Voice-over"
          status="ACTIVE"
          statusColor="text-emerald-800"
          imageUrl="/lazyclip.buzz mock.png"
          githubUrl="https://github.com/JAYATIAHUJA/LAZYCLIP.BUZZ"
          liveUrl="https://lazyclip.buzz"
          xUrl="https://x.com/___moinn_/status/2076235594209042859?s=20"
          desc={
            <>
              <Highlight style="circle" color="blue">lazyclip.buzz</Highlight> is an open-source video editing system controlled through natural-language instructions. It accepts a prompt, an uploaded video, or a YouTube segment and returns a processed <Highlight style="underline" color="green">vertical video</Highlight> with captions, formatting, and optional <Highlight style="marker" color="yellow">voice-over</Highlight>.
            </>
          }
        />

        {/* OP 2 */}
        <OperationCard
          id="OP-317"
          delay={0.8}
          title="RELAY VAULT"
          tech="Monad Testnet, Smart Contracts, AI Agents, Escrow"
          status="ACTIVE"
          statusColor="text-emerald-800"
          imageUrl="/RelayVault landing page.png"
          githubUrl="https://github.com/MDMOINAKHTARR/Relay_Vault"
          youtubeUrl="https://youtu.be/IpkW9Zmbb7s?si=qtM8zDWlvqMVsKKQ"
          desc={
            <>
              A decentralized agent marketplace and workflow execution platform built on the <Highlight style="circle" color="blue">Monad Testnet</Highlight>. It leverages smart contracts for <Highlight style="underline" color="green">secure negotiation and escrow</Highlight> to enable seamless <Highlight style="marker" color="yellow">on-chain AI agent interactions</Highlight>.
            </>
          }
        />

        {/* OP 3 */}
        <OperationCard 
          id="OP-081"
          delay={1.0}
          title="UPSTART - STARTUP BLUEPRINT ENGINE"
          tech="Next.js, Node.js, SQLite, Google Gen AI"
          status="DEPLOYED"
          statusColor="text-emerald-800"
          imageUrl="/upstart-mockup.png"
          githubUrl="https://github.com/MDMOINAKHTARR"
          liveUrl="#"
          youtubeUrl="https://youtu.be/mIntn3mUa50?si=7fvye7ZSGPpWbKM6"
          desc={
            <>
              An AI-powered platform transforming startup ideas into validated business plans and 4-week MVP roadmaps. Integrates <Highlight style="circle" color="red">Google Generative AI</Highlight> and <Highlight style="underline" color="blue">Google Trends API</Highlight> for market insights. Features a custom feasibility scoring system and secure <Highlight style="marker" color="yellow">JWT authentication</Highlight>.
            </>
          }
        />

        {/* OP 4 */}
        <OperationCard
          id="OP-109"
          delay={1.2}
          title="HALO AI"
          tech="React, Node.js, Next.js, REST API"
          status="ACTIVE"
          statusColor="text-emerald-800"
          imageUrl="/haloai mockup.png"
          githubUrl="https://github.com/MDMOINAKHTARR"
          liveUrl="#"
          youtubeUrl="https://youtu.be/x34yyyCvm3E?si=KWrS3WjbGiywp3Ai"
          desc={
            <>
              A highly responsive <Highlight style="circle" color="blue">AI Assistant platform</Highlight> designed to synthesize contextual knowledge and execute tasks. Integrated with modern conversational models and features a <Highlight style="squiggly" color="yellow">real-time streaming interface</Highlight>.
            </>
          }
        />

        {/* OP 5 */}
        <OperationCard 
          id="OP-044"
          delay={1.4}
          title="EMOTION-BASED MOVIE RECOMMENDER"
          tech="Python, DeepFace, OpenCV, MySQL"
          status="SUCCESS"
          statusColor="text-emerald-800"
          imageUrl="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000"
          githubUrl="https://github.com/MDMOINAKHTARR"
          desc={
            <>
              Engineered a real-time recommendation system using <Highlight style="circle" color="green">DeepFace</Highlight> and OpenCV for live emotion detection. Maps dominant emotions via webcam to TMDB genres and employs <Highlight style="squiggly" color="yellow">TF-IDF cosine similarity</Highlight> for content-based filtering. 
            </>
          }
        />
        
        {/* OP 6 */}
        <OperationCard 
          id="OP-012"
          delay={1.6}
          title="DEVCATION - HACKATHON ENVIRONMENT"
          tech="Next.js 15, Matter.js, React"
          status="VERIFIED"
          statusColor="text-emerald-800"
          imageUrl="/devacation-mockup.jpg"
          githubUrl="https://github.com/MDMOINAKHTARR"
          liveUrl="#"
          desc={
            <>
              Built and deployed the <Highlight style="underline" color="red">Devcation hackathon website</Highlight>. Features highly interactive, physics-based user experiences driven by <Highlight style="marker" color="yellow">Matter.js</Highlight>. Instrumental in securing 1st Place at PromptWars (IGDTUW 2026).
            </>
          }
        />

        {/* OP 7 */}
        <OperationCard 
          id="OP-256"
          delay={1.8}
          title="CASSENDRA"
          tech="React, Data Analysis, Next.js, Tailwind"
          status="VERIFIED"
          statusColor="text-emerald-800"
          imageUrl="https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&q=80&w=1000"
          githubUrl="https://github.com/MDMOINAKHTARR"
          liveUrl="#"
          desc={
            <>
              High-performance dataset analysis interface and querying platform. Provides real-time metrics and dynamic <Highlight style="marker" color="red">graphical visualization</Highlight> of data schemas for rapid <Highlight style="underline" color="green">insight extraction</Highlight>.
            </>
          }
        />

      </div>
    </PageTransition>
  );
}
