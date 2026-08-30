export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  highlightClass?: string;
  isGlitch?: boolean;
}

export interface MonologueSection {
  id: string;
  label: string;
  seg_range?: [number, number] | number[];
  startTime?: number;
  endTime?: number;
  text?: string;
  words: WordTimestamp[];
}

export const MONOLOGUE_AUDIO_SRC = '/voiceover-classified.mp3';
export const MONOLOGUE_TOTAL_DURATION = 100.61;

export const MONOLOGUE_SECTIONS: MonologueSection[] = [
  {
    "id": "hook",
    "label": "ORIGIN STATEMENT",
    "seg_range": [
      0,
      0
    ],
    "text": "“Alright, let’s do this one last time.”",
    "words": [
      {
        "word": "“Alright,",
        "start": 0.0,
        "end": 0.32
      },
      {
        "word": "let’s",
        "start": 0.52,
        "end": 0.7
      },
      {
        "word": "do",
        "start": 0.7,
        "end": 0.8
      },
      {
        "word": "this",
        "start": 0.8,
        "end": 0.96
      },
      {
        "word": "one",
        "start": 0.96,
        "end": 1.22
      },
      {
        "word": "last",
        "start": 1.22,
        "end": 1.5
      },
      {
        "word": "time.”",
        "start": 1.5,
        "end": 1.9
      }
    ]
  },
  {
    "id": "name",
    "label": "SUBJECT NAME",
    "seg_range": [
      1,
      1
    ],
    "text": "My name is Moin Akhtar.",
    "words": [
      {
        "word": "My",
        "start": 2.36,
        "end": 2.62
      },
      {
        "word": "name",
        "start": 2.62,
        "end": 2.84
      },
      {
        "word": "is",
        "start": 2.84,
        "end": 3.12
      },
      {
        "word": "Moin",
        "start": 3.12,
        "end": 3.56
      },
      {
        "word": "Akhtar.",
        "start": 3.56,
        "end": 3.84
      }
    ]
  },
  {
    "id": "identity_intro",
    "label": "CORE DRIVE",
    "seg_range": [
      2,
      5
    ],
    "text": "I’m an Artificial Intelligence & Data Science student, developer, builder, and probably someone who spends way too much time asking, “What if I built this?”",
    "words": [
      {
        "word": "I’m",
        "start": 4.24,
        "end": 4.52
      },
      {
        "word": "an",
        "start": 4.52,
        "end": 4.58
      },
      {
        "word": "Artificial",
        "start": 4.58,
        "end": 5.02
      },
      {
        "word": "Intelligence",
        "start": 5.02,
        "end": 5.68
      },
      {
        "word": "&",
        "start": 5.68,
        "end": 6.04
      },
      {
        "word": "Data",
        "start": 6.04,
        "end": 6.28
      },
      {
        "word": "Science",
        "start": 6.28,
        "end": 6.72
      },
      {
        "word": "student,",
        "start": 6.72,
        "end": 7.14
      },
      {
        "word": "developer,",
        "start": 7.58,
        "end": 8.22
      },
      {
        "word": "builder,",
        "start": 8.76,
        "end": 9.2
      },
      {
        "word": "and",
        "start": 9.48,
        "end": 10.1
      },
      {
        "word": "probably",
        "start": 10.1,
        "end": 10.32
      },
      {
        "word": "someone",
        "start": 10.32,
        "end": 10.66
      },
      {
        "word": "who",
        "start": 10.66,
        "end": 10.8
      },
      {
        "word": "spends",
        "start": 10.8,
        "end": 10.98
      },
      {
        "word": "way",
        "start": 10.98,
        "end": 11.32
      },
      {
        "word": "too",
        "start": 11.32,
        "end": 11.48
      },
      {
        "word": "much",
        "start": 11.48,
        "end": 11.64
      },
      {
        "word": "time",
        "start": 11.64,
        "end": 11.9
      },
      {
        "word": "asking,",
        "start": 11.9,
        "end": 12.36
      },
      {
        "word": "“What",
        "start": 12.8,
        "end": 13.2
      },
      {
        "word": "if",
        "start": 13.2,
        "end": 13.32
      },
      {
        "word": "I",
        "start": 13.32,
        "end": 13.42
      },
      {
        "word": "built",
        "start": 13.42,
        "end": 13.66
      },
      {
        "word": "this?”",
        "start": 13.66,
        "end": 13.92
      }
    ]
  },
  {
    "id": "wakeup",
    "label": "ORIGIN REALITY",
    "seg_range": [
      6,
      6
    ],
    "text": "I didn’t wake up one day knowing how to build AI systems.",
    "words": [
      {
        "word": "I",
        "start": 14.64,
        "end": 14.82
      },
      {
        "word": "didn’t",
        "start": 14.82,
        "end": 15.02
      },
      {
        "word": "wake",
        "start": 15.02,
        "end": 15.18
      },
      {
        "word": "up",
        "start": 15.18,
        "end": 15.34
      },
      {
        "word": "one",
        "start": 15.34,
        "end": 15.6
      },
      {
        "word": "day",
        "start": 15.6,
        "end": 15.8
      },
      {
        "word": "knowing",
        "start": 15.8,
        "end": 16.16
      },
      {
        "word": "how",
        "start": 16.16,
        "end": 16.44
      },
      {
        "word": "to",
        "start": 16.44,
        "end": 16.52
      },
      {
        "word": "build",
        "start": 16.52,
        "end": 16.7
      },
      {
        "word": "AI",
        "start": 16.7,
        "end": 16.94
      },
      {
        "word": "systems.",
        "start": 16.94,
        "end": 17.44
      }
    ]
  },
  {
    "id": "evolution_steps",
    "label": "SYSTEM EVOLUTION",
    "seg_range": [
      7,
      8
    ],
    "text": "I started with code. Then came web development. Then data. Then machine learning. And eventually, AI.",
    "words": [
      {
        "word": "I",
        "start": 17.92,
        "end": 18.08
      },
      {
        "word": "started",
        "start": 18.08,
        "end": 18.42
      },
      {
        "word": "with",
        "start": 18.42,
        "end": 18.66
      },
      {
        "word": "code.",
        "start": 18.66,
        "end": 19.42
      },
      {
        "word": "Then",
        "start": 19.42,
        "end": 19.8
      },
      {
        "word": "came",
        "start": 19.8,
        "end": 20.1
      },
      {
        "word": "web",
        "start": 20.1,
        "end": 20.34
      },
      {
        "word": "development.",
        "start": 20.34,
        "end": 21.0
      },
      {
        "word": "Then",
        "start": 21.0,
        "end": 21.62
      },
      {
        "word": "data.",
        "start": 21.62,
        "end": 22.2
      },
      {
        "word": "Then",
        "start": 22.62,
        "end": 23.02
      },
      {
        "word": "machine",
        "start": 23.02,
        "end": 23.4
      },
      {
        "word": "learning.",
        "start": 23.4,
        "end": 24.18
      },
      {
        "word": "And",
        "start": 24.18,
        "end": 24.58
      },
      {
        "word": "eventually,",
        "start": 24.58,
        "end": 24.88
      },
      {
        "word": "AI.",
        "start": 24.88,
        "end": 25.18
      }
    ]
  },
  {
    "id": "cycle_iteration",
    "label": "CYCLE 01: ITERATION",
    "seg_range": [
      9,
      10
    ],
    "text": "I built projects. Broke things. Fixed them. Built them again.",
    "words": [
      {
        "word": "I",
        "start": 25.8,
        "end": 26.04
      },
      {
        "word": "built",
        "start": 26.04,
        "end": 26.32
      },
      {
        "word": "projects.",
        "start": 26.32,
        "end": 27.1
      },
      {
        "word": "Broke",
        "start": 27.1,
        "end": 27.46
      },
      {
        "word": "things.",
        "start": 27.46,
        "end": 28.02
      },
      {
        "word": "Fixed",
        "start": 28.02,
        "end": 28.38
      },
      {
        "word": "them.",
        "start": 28.38,
        "end": 28.82
      },
      {
        "word": "Built",
        "start": 28.82,
        "end": 29.18
      },
      {
        "word": "them",
        "start": 29.18,
        "end": 29.34
      },
      {
        "word": "again.",
        "start": 29.34,
        "end": 29.92
      }
    ]
  },
  {
    "id": "cycle_hackathons",
    "label": "CYCLE 02: HACKATHONS",
    "seg_range": [
      11,
      12
    ],
    "text": "I joined hackathons. Won some. Lost some. Learned from all of them.",
    "words": [
      {
        "word": "I",
        "start": 30.4,
        "end": 30.6
      },
      {
        "word": "joined",
        "start": 30.6,
        "end": 31.0
      },
      {
        "word": "hackathons.",
        "start": 31.0,
        "end": 31.96
      },
      {
        "word": "Won",
        "start": 31.96,
        "end": 32.32
      },
      {
        "word": "some.",
        "start": 32.32,
        "end": 32.78
      },
      {
        "word": "Lost",
        "start": 32.78,
        "end": 33.04
      },
      {
        "word": "some.",
        "start": 33.04,
        "end": 33.28
      },
      {
        "word": "Learned",
        "start": 33.68,
        "end": 33.94
      },
      {
        "word": "from",
        "start": 33.94,
        "end": 34.08
      },
      {
        "word": "all",
        "start": 34.08,
        "end": 34.26
      },
      {
        "word": "of",
        "start": 34.26,
        "end": 34.38
      },
      {
        "word": "them.",
        "start": 34.38,
        "end": 34.62
      }
    ]
  },
  {
    "id": "cycle_applied",
    "label": "CYCLE 03: APPLIED WORK",
    "seg_range": [
      13,
      15
    ],
    "text": "I worked on research. Built AI applications. Created web experiences. Turned random ideas into things people could actually use.",
    "words": [
      {
        "word": "I",
        "start": 35.04,
        "end": 35.2
      },
      {
        "word": "worked",
        "start": 35.2,
        "end": 35.58
      },
      {
        "word": "on",
        "start": 35.58,
        "end": 35.74
      },
      {
        "word": "research.",
        "start": 35.74,
        "end": 36.42
      },
      {
        "word": "Built",
        "start": 36.42,
        "end": 36.78
      },
      {
        "word": "AI",
        "start": 36.78,
        "end": 37.04
      },
      {
        "word": "applications.",
        "start": 37.04,
        "end": 37.7
      },
      {
        "word": "Created",
        "start": 38.0,
        "end": 38.48
      },
      {
        "word": "web",
        "start": 38.48,
        "end": 38.8
      },
      {
        "word": "experiences.",
        "start": 38.8,
        "end": 39.78
      },
      {
        "word": "Turned",
        "start": 39.78,
        "end": 40.24
      },
      {
        "word": "random",
        "start": 40.24,
        "end": 40.64
      },
      {
        "word": "ideas",
        "start": 40.64,
        "end": 40.98
      },
      {
        "word": "into",
        "start": 40.98,
        "end": 41.24
      },
      {
        "word": "things",
        "start": 41.24,
        "end": 41.6
      },
      {
        "word": "people",
        "start": 41.6,
        "end": 41.98
      },
      {
        "word": "could",
        "start": 41.98,
        "end": 42.14
      },
      {
        "word": "actually",
        "start": 42.14,
        "end": 42.66
      },
      {
        "word": "use.",
        "start": 42.66,
        "end": 43.02
      }
    ]
  },
  {
    "id": "realization",
    "label": "THE REALIZATION",
    "seg_range": [
      16,
      18
    ],
    "text": "And somewhere along the way, I realized... I wasn’t just learning technology anymore. I was building things I actually wanted to exist.",
    "words": [
      {
        "word": "And",
        "start": 43.42,
        "end": 43.68
      },
      {
        "word": "somewhere",
        "start": 43.68,
        "end": 44.2
      },
      {
        "word": "along",
        "start": 44.2,
        "end": 44.48
      },
      {
        "word": "the",
        "start": 44.48,
        "end": 44.62
      },
      {
        "word": "way,",
        "start": 44.62,
        "end": 44.88
      },
      {
        "word": "I",
        "start": 44.88,
        "end": 45.02
      },
      {
        "word": "realized...",
        "start": 45.02,
        "end": 45.38
      },
      {
        "word": "I",
        "start": 45.98,
        "end": 46.12
      },
      {
        "word": "wasn’t",
        "start": 46.12,
        "end": 46.4
      },
      {
        "word": "just",
        "start": 46.4,
        "end": 46.68
      },
      {
        "word": "learning",
        "start": 46.68,
        "end": 47.02
      },
      {
        "word": "technology",
        "start": 47.02,
        "end": 47.66
      },
      {
        "word": "anymore.",
        "start": 47.66,
        "end": 48.04
      },
      {
        "word": "I",
        "start": 48.6,
        "end": 48.74
      },
      {
        "word": "was",
        "start": 48.74,
        "end": 48.96
      },
      {
        "word": "building",
        "start": 48.96,
        "end": 49.44
      },
      {
        "word": "things",
        "start": 49.44,
        "end": 49.78
      },
      {
        "word": "I",
        "start": 49.78,
        "end": 49.94
      },
      {
        "word": "actually",
        "start": 49.94,
        "end": 50.38
      },
      {
        "word": "wanted",
        "start": 50.38,
        "end": 50.7
      },
      {
        "word": "to",
        "start": 50.7,
        "end": 50.82
      },
      {
        "word": "exist.",
        "start": 50.82,
        "end": 51.14
      }
    ]
  },
  {
    "id": "confession",
    "label": "CLASSIFIED CONFESSION",
    "seg_range": [
      19,
      21
    ],
    "text": "And yeah, I’ve made some questionable decisions along the way. We don’t really talk about those.",
    "words": [
      {
        "word": "And",
        "start": 51.68,
        "end": 51.86
      },
      {
        "word": "yeah,",
        "start": 51.86,
        "end": 52.26
      },
      {
        "word": "I’ve",
        "start": 52.26,
        "end": 52.54
      },
      {
        "word": "made",
        "start": 52.54,
        "end": 52.74
      },
      {
        "word": "some",
        "start": 52.74,
        "end": 52.92
      },
      {
        "word": "questionable",
        "start": 52.92,
        "end": 53.48
      },
      {
        "word": "decisions",
        "start": 53.48,
        "end": 53.88
      },
      {
        "word": "along",
        "start": 53.88,
        "end": 54.2
      },
      {
        "word": "the",
        "start": 54.2,
        "end": 54.34
      },
      {
        "word": "way.",
        "start": 54.34,
        "end": 54.66
      },
      {
        "word": "We",
        "start": 55.14,
        "end": 55.32
      },
      {
        "word": "don’t",
        "start": 55.32,
        "end": 55.58
      },
      {
        "word": "really",
        "start": 55.58,
        "end": 55.94
      },
      {
        "word": "talk",
        "start": 55.94,
        "end": 56.24
      },
      {
        "word": "about",
        "start": 56.24,
        "end": 56.44
      },
      {
        "word": "those.",
        "start": 56.44,
        "end": 56.68
      }
    ]
  },
  {
    "id": "creed",
    "label": "THE BUILDER CREED",
    "seg_range": [
      22,
      28
    ],
    "text": "But after everything... I still love building. I mean, who wouldn’t? There’s something about taking an idea that exists only in your head and turning it into something real. Something you can see. Something you can use. Something you can say: “Yeah. I built that.”",
    "words": [
      {
        "word": "But",
        "start": 57.0,
        "end": 57.24
      },
      {
        "word": "after",
        "start": 57.24,
        "end": 57.54
      },
      {
        "word": "everything...",
        "start": 57.54,
        "end": 58.14
      },
      {
        "word": "I",
        "start": 58.7,
        "end": 58.84
      },
      {
        "word": "still",
        "start": 58.84,
        "end": 59.1
      },
      {
        "word": "love",
        "start": 59.1,
        "end": 59.34
      },
      {
        "word": "building.",
        "start": 59.34,
        "end": 59.74
      },
      {
        "word": "I",
        "start": 60.16,
        "end": 60.28
      },
      {
        "word": "mean,",
        "start": 60.28,
        "end": 60.5
      },
      {
        "word": "who",
        "start": 60.5,
        "end": 60.68
      },
      {
        "word": "wouldn’t?",
        "start": 60.68,
        "end": 60.9
      },
      {
        "word": "There’s",
        "start": 61.22,
        "end": 61.56
      },
      {
        "word": "something",
        "start": 61.56,
        "end": 62.0
      },
      {
        "word": "about",
        "start": 62.0,
        "end": 62.24
      },
      {
        "word": "taking",
        "start": 62.24,
        "end": 62.62
      },
      {
        "word": "an",
        "start": 62.62,
        "end": 62.74
      },
      {
        "word": "idea",
        "start": 62.74,
        "end": 63.06
      },
      {
        "word": "that",
        "start": 63.06,
        "end": 63.3
      },
      {
        "word": "exists",
        "start": 63.3,
        "end": 63.78
      },
      {
        "word": "only",
        "start": 63.78,
        "end": 64.08
      },
      {
        "word": "in",
        "start": 64.08,
        "end": 64.22
      },
      {
        "word": "your",
        "start": 64.22,
        "end": 64.44
      },
      {
        "word": "head",
        "start": 64.44,
        "end": 64.84
      },
      {
        "word": "and",
        "start": 64.84,
        "end": 65.02
      },
      {
        "word": "turning",
        "start": 65.02,
        "end": 65.46
      },
      {
        "word": "it",
        "start": 65.46,
        "end": 65.58
      },
      {
        "word": "into",
        "start": 65.58,
        "end": 65.86
      },
      {
        "word": "something",
        "start": 65.86,
        "end": 66.32
      },
      {
        "word": "real.",
        "start": 66.32,
        "end": 66.9
      },
      {
        "word": "Something",
        "start": 66.9,
        "end": 67.44
      },
      {
        "word": "you",
        "start": 67.44,
        "end": 67.58
      },
      {
        "word": "can",
        "start": 67.58,
        "end": 67.8
      },
      {
        "word": "see.",
        "start": 67.8,
        "end": 68.2
      },
      {
        "word": "Something",
        "start": 68.2,
        "end": 68.74
      },
      {
        "word": "you",
        "start": 68.74,
        "end": 68.88
      },
      {
        "word": "can",
        "start": 68.88,
        "end": 69.1
      },
      {
        "word": "use.",
        "start": 69.1,
        "end": 69.44
      },
      {
        "word": "Something",
        "start": 69.88,
        "end": 70.36
      },
      {
        "word": "you",
        "start": 70.36,
        "end": 70.5
      },
      {
        "word": "can",
        "start": 70.5,
        "end": 70.7
      },
      {
        "word": "say:",
        "start": 70.7,
        "end": 71.04
      },
      {
        "word": "“Yeah.",
        "start": 71.04,
        "end": 71.5
      },
      {
        "word": "I",
        "start": 71.5,
        "end": 71.7
      },
      {
        "word": "built",
        "start": 71.7,
        "end": 72.0
      },
      {
        "word": "that.”",
        "start": 72.0,
        "end": 72.26
      }
    ]
  },
  {
    "id": "resilience",
    "label": "THE RESILIENCE LOOP",
    "seg_range": [
      29,
      33
    ],
    "text": "So no matter how many times I get stuck, fail, rebuild, or start from scratch... I always find a way to come back. Because there’s always another idea. Another problem to solve. Another thing to learn. Another version of myself to build.",
    "words": [
      {
        "word": "So",
        "start": 72.64,
        "end": 72.84
      },
      {
        "word": "no",
        "start": 72.84,
        "end": 73.02
      },
      {
        "word": "matter",
        "start": 73.02,
        "end": 73.3
      },
      {
        "word": "how",
        "start": 73.3,
        "end": 73.48
      },
      {
        "word": "many",
        "start": 73.48,
        "end": 73.74
      },
      {
        "word": "times",
        "start": 73.74,
        "end": 74.08
      },
      {
        "word": "I",
        "start": 74.08,
        "end": 74.22
      },
      {
        "word": "get",
        "start": 74.22,
        "end": 74.48
      },
      {
        "word": "stuck,",
        "start": 74.48,
        "end": 74.96
      },
      {
        "word": "fail,",
        "start": 74.96,
        "end": 75.4
      },
      {
        "word": "rebuild,",
        "start": 75.4,
        "end": 75.94
      },
      {
        "word": "or",
        "start": 76.4,
        "end": 76.6
      },
      {
        "word": "start",
        "start": 76.6,
        "end": 76.94
      },
      {
        "word": "from",
        "start": 76.94,
        "end": 77.14
      },
      {
        "word": "scratch...",
        "start": 77.14,
        "end": 77.8
      },
      {
        "word": "I",
        "start": 78.2,
        "end": 78.4
      },
      {
        "word": "always",
        "start": 78.4,
        "end": 78.78
      },
      {
        "word": "find",
        "start": 78.78,
        "end": 79.1
      },
      {
        "word": "a",
        "start": 79.1,
        "end": 79.2
      },
      {
        "word": "way",
        "start": 79.2,
        "end": 79.42
      },
      {
        "word": "to",
        "start": 79.42,
        "end": 79.54
      },
      {
        "word": "come",
        "start": 79.54,
        "end": 79.74
      },
      {
        "word": "back.",
        "start": 79.74,
        "end": 79.98
      },
      {
        "word": "Because",
        "start": 79.98,
        "end": 80.36
      },
      {
        "word": "there’s",
        "start": 80.36,
        "end": 80.68
      },
      {
        "word": "always",
        "start": 80.68,
        "end": 81.08
      },
      {
        "word": "another",
        "start": 81.08,
        "end": 81.44
      },
      {
        "word": "idea.",
        "start": 81.44,
        "end": 81.88
      },
      {
        "word": "Another",
        "start": 82.32,
        "end": 82.7
      },
      {
        "word": "problem",
        "start": 82.7,
        "end": 83.18
      },
      {
        "word": "to",
        "start": 83.18,
        "end": 83.32
      },
      {
        "word": "solve.",
        "start": 83.32,
        "end": 83.8
      },
      {
        "word": "Another",
        "start": 83.8,
        "end": 84.22
      },
      {
        "word": "thing",
        "start": 84.22,
        "end": 84.58
      },
      {
        "word": "to",
        "start": 84.58,
        "end": 84.72
      },
      {
        "word": "learn.",
        "start": 84.72,
        "end": 85.14
      },
      {
        "word": "Another",
        "start": 85.64,
        "end": 86.06
      },
      {
        "word": "version",
        "start": 86.06,
        "end": 86.48
      },
      {
        "word": "of",
        "start": 86.48,
        "end": 86.6
      },
      {
        "word": "myself",
        "start": 86.6,
        "end": 87.0
      },
      {
        "word": "to",
        "start": 87.0,
        "end": 87.12
      },
      {
        "word": "build.",
        "start": 87.12,
        "end": 87.28
      }
    ]
  },
  {
    "id": "climax",
    "label": "THE NEXT CHAPTER",
    "seg_range": [
      34,
      38
    ],
    "text": "I don’t know exactly where this story ends. Honestly, I don’t even know what the next chapter looks like. And that’s okay. Because this is my story so far. And I’m nowhere near finished. This is just the beginning.",
    "words": [
      {
        "word": "I",
        "start": 87.84,
        "end": 87.98
      },
      {
        "word": "don’t",
        "start": 87.98,
        "end": 88.22
      },
      {
        "word": "know",
        "start": 88.22,
        "end": 88.46
      },
      {
        "word": "exactly",
        "start": 88.46,
        "end": 88.94
      },
      {
        "word": "where",
        "start": 88.94,
        "end": 89.2
      },
      {
        "word": "this",
        "start": 89.2,
        "end": 89.42
      },
      {
        "word": "story",
        "start": 89.42,
        "end": 89.76
      },
      {
        "word": "ends.",
        "start": 89.76,
        "end": 90.0
      },
      {
        "word": "Honestly,",
        "start": 90.34,
        "end": 90.84
      },
      {
        "word": "I",
        "start": 90.84,
        "end": 90.96
      },
      {
        "word": "don’t",
        "start": 90.96,
        "end": 91.2
      },
      {
        "word": "even",
        "start": 91.2,
        "end": 91.46
      },
      {
        "word": "know",
        "start": 91.46,
        "end": 91.68
      },
      {
        "word": "what",
        "start": 91.68,
        "end": 91.86
      },
      {
        "word": "the",
        "start": 91.86,
        "end": 92.0
      },
      {
        "word": "next",
        "start": 92.0,
        "end": 92.28
      },
      {
        "word": "chapter",
        "start": 92.28,
        "end": 92.56
      },
      {
        "word": "looks",
        "start": 92.56,
        "end": 92.68
      },
      {
        "word": "like.",
        "start": 92.68,
        "end": 92.74
      },
      {
        "word": "And",
        "start": 93.1,
        "end": 93.3
      },
      {
        "word": "that’s",
        "start": 93.3,
        "end": 93.68
      },
      {
        "word": "okay.",
        "start": 93.68,
        "end": 94.2
      },
      {
        "word": "Because",
        "start": 94.5,
        "end": 94.88
      },
      {
        "word": "this",
        "start": 94.88,
        "end": 95.12
      },
      {
        "word": "is",
        "start": 95.12,
        "end": 95.34
      },
      {
        "word": "my",
        "start": 95.34,
        "end": 95.58
      },
      {
        "word": "story",
        "start": 95.58,
        "end": 95.98
      },
      {
        "word": "so",
        "start": 95.98,
        "end": 96.24
      },
      {
        "word": "far.",
        "start": 96.24,
        "end": 96.7
      },
      {
        "word": "And",
        "start": 97.14,
        "end": 97.32
      },
      {
        "word": "I’m",
        "start": 97.32,
        "end": 97.58
      },
      {
        "word": "nowhere",
        "start": 97.58,
        "end": 98.02
      },
      {
        "word": "near",
        "start": 98.02,
        "end": 98.24
      },
      {
        "word": "finished.",
        "start": 98.24,
        "end": 98.46
      },
      {
        "word": "This",
        "start": 98.92,
        "end": 99.12
      },
      {
        "word": "is",
        "start": 99.12,
        "end": 99.3
      },
      {
        "word": "just",
        "start": 99.3,
        "end": 99.52
      },
      {
        "word": "the",
        "start": 99.52,
        "end": 99.66
      },
      {
        "word": "beginning.",
        "start": 99.66,
        "end": 99.92
      }
    ]
  }
];

export const ALL_MONOLOGUE_WORDS: WordTimestamp[] = MONOLOGUE_SECTIONS.flatMap(s => s.words);
