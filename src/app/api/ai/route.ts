
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { zai } from "@/lib/zai";
import { ChatMessage } from "z-ai-web-dev-sdk";
import { getAuthFromRequest, findUserById } from "@/lib/auth";

/**
 * A custom error class for API-related errors.
 */
class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Fetches student data and constructs a contextual prompt for the AI.
 * @param studentId The ID of the student.
 * @returns A detailed string of context for the AI.
 */
async function getContextForAi(studentId: string): Promise<string> {
  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        logEntries: { orderBy: { date: "desc" }, take: 5 },
        monthlyReports: { orderBy: { createdAt: "desc" }, take: 1 },
        project: { select: { title: true, chapter1Introduction: true } },
      },
    });

    if (!student) {
      return "No student data found.";
    }

    let context = "Here is the student's recent data:\n\n";

    if (student.logEntries.length > 0) {
      context += "**Last 5 Log Entries:**\n";
      student.logEntries.forEach((log) => {
        context += `- ${new Date(log.date).toLocaleDateString()}: ${log.activity.substring(0, 100)}\n`;
      });
      context += "\n";
    }

    if (student.project?.title) {
      context += `**Current Project:** "${student.project.title}"\n`;
      if (student.project.chapter1Introduction) {
        context += `**Project Introduction:** ${student.project.chapter1Introduction.substring(0, 200)}...\n`;
      }
      context += "\n";
    }

    return context;
  } catch (error) {
    console.error("Failed to fetch student data:", error);
    return "Could not retrieve student data.";
  }
}

/**
 * Main handler for the AI chat API.
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      throw new ApiError("Unauthorized", 401);
    }

    const user = await findUserById(auth.userId);
    if (!user || !user.studentId) {
      throw new ApiError("User not found or not linked to a student profile", 404);
    }

    const { prompt: userPrompt } = await req.json();

    if (!userPrompt) {
      throw new ApiError("Prompt is required", 400);
    }

    const studentContext = await getContextForAi(user.studentId);

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert AI assistant for a student on industrial attachment. Your goal is to be as helpful as possible. You have access to the student's recent activity in the system.\n\n${studentContext}`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const response = await zai.chat.completions.create({
      model: 'gemini-1.5-pro-latest',
      messages,
      stream: false,
      thinking: { type: "disabled" },
    });

    const reply = response.choices?.[0]?.message?.content;

    if (!reply) {
      throw new ApiError("The AI did not provide a response.", 500);
    }

    return NextResponse.json({ reply });

  } catch (err: any) {
    const errorMessage = err instanceof ApiError ? err.message : "An unexpected error occurred.";
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    console.error(`[AI API Error]: ${errorMessage}`, err);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
