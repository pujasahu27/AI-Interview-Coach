import "server-only";

import { GoogleGenAI, Type } from "@google/genai";
import type { Difficulty, InterviewFocus } from "@/lib/interviewOptions";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export type { Difficulty, InterviewFocus };

export function describeGeminiError(error: unknown): { status: number; message: string } {
  const status = (error as { status?: number } | null)?.status;
  if (status === 429) {
    return {
      status: 429,
      message:
        "The AI provider's rate limit or daily quota was reached for this API key. Wait a bit and try again, or use a different Gemini API key.",
    };
  }
  return {
    status: 502,
    message: "Something went wrong talking to the AI provider. Please try again.",
  };
}

export type TurnEvaluation = {
  score: number;
  strengths: string[];
  gaps: string[];
  notes: string;
};

type CandidateContext = {
  resumeText: string;
  jobDescriptionText: string;
  yearsOfExperience: number;
  interviewFocus: InterviewFocus;
  difficulty: Difficulty;
  targetCompany?: string | null;
};

type TranscriptTurn = {
  question: string;
  answerTranscript: string;
  evaluation: TurnEvaluation;
};

function focusInstruction(focus: InterviewFocus): string {
  switch (focus) {
    case "behavioral":
      return "Ask only behavioral questions. Favor STAR-style prompts (Situation, Task, Action, Result) about past experience.";
    case "technical":
      return "Ask only role-specific technical questions that probe hands-on skills, tools, and problem-solving relevant to the job description.";
    case "mixed":
      return "Alternate between behavioral (STAR-style) and role-specific technical questions.";
    case "system_design":
      return "Ask system design / architecture questions scoped to the role — scalability, trade-offs, component design, and reasoning about ambiguous requirements.";
    case "coding":
      return "Ask coding and algorithmic problem-solving questions the candidate would reason through verbally — approach, complexity, and edge cases, as in a whiteboard or live-coding round.";
    case "hr_round":
      return "Ask HR-round questions: culture fit, motivation, career goals, availability, and soft-skill screening — no technical questions.";
  }
}

function difficultyInstruction(difficulty: Difficulty): string {
  switch (difficulty) {
    case "beginner":
      return "Keep questions foundational and approachable, suitable for someone early in their learning journey.";
    case "intermediate":
      return "Ask moderately challenging questions expecting solid working knowledge.";
    case "advanced":
      return "Ask challenging questions expecting deep expertise and nuanced trade-off reasoning.";
    case "expert":
      return "Ask expert-level questions probing edge cases, architecture at scale, and deep specialization.";
  }
}

function candidateContextBlock(ctx: CandidateContext): string {
  const companyLine = ctx.targetCompany
    ? `\nTarget company: ${ctx.targetCompany} — where reasonable, tailor question style to what's typical for interviews at this company.`
    : "";
  return `Candidate resume:\n${ctx.resumeText}\n\nJob description:\n${ctx.jobDescriptionText}\n\nCandidate years of experience: ${ctx.yearsOfExperience}\nInterview focus: ${ctx.interviewFocus} — ${focusInstruction(ctx.interviewFocus)}\nDifficulty level: ${ctx.difficulty} — ${difficultyInstruction(ctx.difficulty)}${companyLine}`;
}

export type ResumeInsights = {
  highlights: string[];
  matchedSkills: string[];
  missingSkills: string[];
};

export async function generateResumeInsights(
  resumeText: string,
  jobDescriptionText: string,
): Promise<ResumeInsights> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Compare this resume against this job description.\n\nResume:\n${resumeText}\n\nJob description:\n${jobDescriptionText}\n\nReturn: 3-5 short highlights of the candidate's strongest, most relevant experience for this job; a list of skills/requirements from the job description that the resume clearly matches; and a list of skills/requirements from the job description that the resume does NOT clearly show.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["highlights", "matchedSkills", "missingSkills"],
      },
    },
  });

  return JSON.parse(response.text ?? "{}");
}

export async function generateOpeningQuestion(
  ctx: CandidateContext,
): Promise<string> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `You are an experienced technical interviewer conducting a mock interview.\n\n${candidateContextBlock(ctx)}\n\nAsk the single best opening interview question for this candidate. Keep it concise (1-3 sentences), natural to say aloud, and directly grounded in their resume and the job description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
        },
        required: ["question"],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");
  return parsed.question as string;
}

export async function evaluateAnswerAndGenerateNext(
  ctx: CandidateContext,
  transcript: TranscriptTurn[],
  currentQuestion: string,
  currentAnswer: string,
): Promise<{ evaluation: TurnEvaluation; nextQuestion: string }> {
  const transcriptBlock = transcript
    .map(
      (turn, i) =>
        `Q${i + 1}: ${turn.question}\nA${i + 1}: ${turn.answerTranscript}\nScore: ${turn.evaluation.score}/10, gaps: ${turn.evaluation.gaps.join("; ") || "none"}`,
    )
    .join("\n\n");

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `You are an experienced technical interviewer conducting an adaptive mock interview.\n\n${candidateContextBlock(ctx)}\n\nInterview so far:\n${transcriptBlock || "(this is the first question)"}\n\nMost recent question: ${currentQuestion}\nCandidate's answer: ${currentAnswer}\n\nFirst, evaluate the candidate's answer: score it 1-10, list concrete strengths, list concrete gaps or missing depth, and add a short internal note.\n\nThen, based on that evaluation and the running transcript, decide the single best next question: probe deeper into a weak or shallow point if the answer had gaps, or move on to a new relevant area if the answer was strong. Do not repeat a question already asked. Keep the next question concise and natural to say aloud.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evaluation: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
            },
            required: ["score", "strengths", "gaps", "notes"],
          },
          nextQuestion: { type: Type.STRING },
        },
        required: ["evaluation", "nextQuestion"],
      },
    },
  });

  return JSON.parse(response.text ?? "{}");
}

export type RecommendationsSummary = {
  overallScore: number;
  strengths: string[];
  gapsToImprove: string[];
  recommendations: string[];
};

export async function generateRecommendations(
  ctx: Pick<CandidateContext, "yearsOfExperience" | "interviewFocus" | "difficulty">,
  targetRole: string | null,
  transcript: TranscriptTurn[],
): Promise<RecommendationsSummary> {
  const transcriptBlock = transcript
    .map(
      (turn, i) =>
        `Q${i + 1}: ${turn.question}\nA${i + 1}: ${turn.answerTranscript}\nScore: ${turn.evaluation.score}/10\nStrengths: ${turn.evaluation.strengths.join("; ") || "none"}\nGaps: ${turn.evaluation.gaps.join("; ") || "none"}`,
    )
    .join("\n\n");

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `You are an interview coach summarizing a completed mock interview for a candidate targeting the role of ${targetRole ?? "this position"} with ${ctx.yearsOfExperience} years of experience (${ctx.interviewFocus} focus, ${ctx.difficulty} difficulty).\n\nFull transcript with per-answer evaluations:\n${transcriptBlock}\n\nProduce an overall score (1-10, weighted average impression), a consolidated list of the candidate's strengths across the interview, a consolidated list of gaps to improve, and 3-6 specific, actionable study/practice recommendations targeting the gaps you found.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          gapsToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["overallScore", "strengths", "gapsToImprove", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text ?? "{}");
}
