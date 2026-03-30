import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildSystemPrompt } from "@/lib/ai/chat-prompts";
import { getBusinessAiBrief } from "@/lib/ai/business-context";

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .min(1)
    .max(40),
  pathname: z.string().max(500).optional().default(""),
  context: z.string().max(128).optional().default("general"),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role || "USER";
    if (role !== "BUSINESS" && role !== "USER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const rateLimit = checkRateLimit(`ai_${session.user.id}`, 20, 60_000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { message: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = chatBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "Geçersiz istek gövdesi.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { messages, pathname, context } = parsed.data;

    const disabled =
      process.env.AI_DISABLED === "true" ||
      process.env.AI_DISABLED === "1" ||
      !process.env.OPENAI_API_KEY?.trim();

    if (disabled) {
      return NextResponse.json({ code: "AI_UNAVAILABLE" }, { status: 503 });
    }

    let businessBrief = "";
    if (role === "BUSINESS" && session.user.businessId) {
      businessBrief = await getBusinessAiBrief(session.user.businessId);
    }

    const systemPrompt = buildSystemPrompt({
      role,
      pathname,
      context,
      businessBrief,
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const maxTokens = Math.min(Math.max(parseInt(process.env.AI_MAX_TOKENS || "1024", 10) || 1024, 256), 4096);

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
      max_tokens: maxTokens,
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";
    if (!reply) {
      return NextResponse.json({ code: "AI_UNAVAILABLE" }, { status: 503 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI CHAT API ERROR:", error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
