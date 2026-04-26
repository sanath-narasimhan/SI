export interface StageTool {
  tool: string;
  usageLogPrompt: string;
}

export interface StageData {
  stage: number;
  name: string;
  goal: string;
  keyObjectives: string[];
  bestPractices: string[];
  stageTools: StageTool[];
  metrics: string[];
}

export const stagesData: StageData[] = [
  {
    stage: 1,
    name: "Developing Faith Stage",
    goal: "Develop absolute faith in scriptures, gurus, and fellow aspirants to lay the foundation for spiritual growth.",
    keyObjectives: [
      "Understand the limitations of sense organs.",
      "Recognize the need to enquire about life's purpose.",
      "Verify and develop faith in scriptures.",
      "Appreciate the necessity for absolute faith in scriptures, gurus, and fellow aspirants."
    ],
    bestPractices: [
      "Act with faith to build stronger faith (spiral development).",
      "Contemplate during difficult times: How to gain sustained happiness despite unpredictability? What is the goal of life?",
      "Introspect on solving chronic problems or irritations.",
      "Research essentials of various philosophies.",
      "Convince yourself there is more than what you see.",
      "Zero-in on your guru: meet, discuss, practice, and experience moments of bliss."
    ],
    stageTools: [
      {
        tool: "Recitation of hymns (stotra, prabandha)",
        usageLogPrompt: "How many times did you recite hymns this week? Any moments of peace or connection felt?"
      },
      {
        tool: "Listening to discourses from gurus",
        usageLogPrompt: "Which discourse did you listen to? Key insight gained?"
      },
      {
        tool: "Self-study of Vedanta texts",
        usageLogPrompt: "Which text/section did you study? What new understanding emerged?"
      },
      {
        tool: "Introspection and journaling",
        usageLogPrompt: "What chronic irritation did you introspect on? How did faith help?"
      }
    ],
    metrics: [
      "Number of faith-building moments per week (target: 5+)",
      "Percentage of daily actions performed with faith (self-report, target: 80%)",
      "Faith spiral score: Rate faith level before/after contemplative sessions (1–10, improvement >2 points)"
    ]
  },
  {
    stage: 2,
    name: "Understanding Realities",
    goal: "Gain knowledge of the three realities (self, matter, Supreme Self) and their interrelations.",
    keyObjectives: [
      "Understand the self as knowledge-nature and subservient to the Supreme Self.",
      "Recognize matter's deluding power and transience.",
      "Appreciate the Supreme Self as all-pervading inner-controller.",
      "Apply this knowledge to daily life through spiritual work."
    ],
    bestPractices: [
      "Study Vedanta texts under a guru.",
      "Contemplate on creation, karma, and liberation.",
      "Perform spiritual work: View all actions as worship of the Supreme.",
      "Use affirmations for correct perception (e.g., 'All is pervaded by the Lord')."
    ],
    stageTools: [
      {
        tool: "Reading spiritual books (Ramayana, Bhagavata, Vishnu Purana)",
        usageLogPrompt: "Which book/section read? Key truth understood?"
      },
      {
        tool: "Keeping company of devotees (satsang)",
        usageLogPrompt: "Satsang attended? Insight gained from discussion?"
      },
      {
        tool: "Complete study of Vedanta at acharya's feet",
        usageLogPrompt: "Study session notes: What was clarified?"
      },
      {
        tool: "Introspection on daily experiences",
        usageLogPrompt: "What reality did you observe today?"
      }
    ],
    metrics: [
      "Knowledge retention score from weekly quizzes (target: 90%)",
      "Frequency of applying realities in decisions (target: 70% of actions)",
      "Depth of understanding (journal insight rating 1–5, average >3)"
    ]
  },
  {
    stage: 3,
    name: "Getting Rid of Negativities Stage",
    goal: "Eliminate mental negativities like fear, anxiety, sorrow, and desires for transient joys.",
    keyObjectives: [
      "Identify and detach from body-ego and possessiveness.",
      "Use SI to overcome fears by recognizing the inner-controller.",
      "Foster human qualities like compassion and tolerance.",
      "Maintain equanimity in dualities (joy-sorrow)."
    ],
    bestPractices: [
      "Mind control through discipline and devotion.",
      "Affirmations for stress categories (e.g., 'Lord controls all disasters').",
      "Regular introspection and corrective actions.",
      "Surrender to the Supreme during obstacles."
    ],
    stageTools: [
      {
        tool: "Meditation and contemplation",
        usageLogPrompt: "Duration of meditation today? Any negativity released?"
      },
      {
        tool: "Chanting mantras after initiation",
        usageLogPrompt: "Which mantra chanted? Effect on mind?"
      },
      {
        tool: "Research on philosophies to dispel doubts",
        usageLogPrompt: "What doubt was addressed? Insight gained?"
      },
      {
        tool: "Zero-in on guru for guidance",
        usageLogPrompt: "Interaction with guru? Guidance received?"
      }
    ],
    metrics: [
      "Negativity incidence rate per day (target: <3)",
      "Equanimity score in challenging situations (1–10, average >7)",
      "Reduction in desire for material gains (weekly self-report, target: 50% decrease)"
    ]
  },
  {
    stage: 4,
    name: "Gaining Bliss",
    goal: "Experience sustained bliss through divine communion and moments of ecstasy.",
    keyObjectives: [
      "Experience coincidences, miracles, and vivid perceptions.",
      "Build a personal relationship with the Lord.",
      "Enjoy spiritual activities as pleasant endeavors.",
      "Achieve liberation post-mortal coil."
    ],
    bestPractices: [
      "Contemplate on Lord before/after actions.",
      "Perform Vedic worship and meditation.",
      "Total surrender for experiential knowledge.",
      "Recite prayers from waking to sleeping."
    ],
    stageTools: [
      {
        tool: "Performing worship (Vedic saligrama)",
        usageLogPrompt: "Worship performed? Moments of bliss felt?"
      },
      {
        tool: "Complete study of Vedanta",
        usageLogPrompt: "Study notes: What bliss insight emerged?"
      },
      {
        tool: "Keeping company of devotees",
        usageLogPrompt: "Satsang attended? Joy experienced?"
      },
      {
        tool: "Contemplation and meditation",
        usageLogPrompt: "Meditation duration? Bliss sustained?"
      }
    ],
    metrics: [
      "Bliss moments per week (target: 7+)",
      "Duration of sustained equanimity (hours/day, target: 80% of day)",
      "Relationship strength with Lord (self-rated 1–10, improvement >2)"
    ]
  },
  {
    stage: 5,
    name: "Being a Guru",
    goal: "Propagate spiritualism by mentoring others and maintaining the tradition.",
    keyObjectives: [
      "Worship and honor the guru parampara.",
      "Develop qualities of a guru (compassion, knowledge).",
      "Guide disciples through the SI model.",
      "Keep the model contemporary."
    ],
    bestPractices: [
      "Daily worship of guru lineage.",
      "Teach with experiential knowledge.",
      "Mentor with focus on disciple's growth.",
      "Adapt teachings for modern contexts."
    ],
    stageTools: [
      {
        tool: "Serving the guru",
        usageLogPrompt: "How did you serve the guru today? Insight gained?"
      },
      {
        tool: "Propagating teachings through discourses",
        usageLogPrompt: "Discourse given? Feedback from listeners?"
      },
      {
        tool: "Introspection on teaching effectiveness",
        usageLogPrompt: "What teaching was effective? What to improve?"
      },
      {
        tool: "Association with other gurus",
        usageLogPrompt: "Interaction with other gurus? Learning received?"
      }
    ],
    metrics: [
      "Number of disciples mentored (target: 5+ per cycle)",
      "Feedback score from disciples (1–10, average >8)",
      "Continuity rate: Percentage of disciples progressing to next stage (target: 70%)"
    ]
  }
];
