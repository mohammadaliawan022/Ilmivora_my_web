import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  CircleHelp,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getCurrentAccessToken,
  getCurrentAuthUser,
  subscribeToAuthChanges,
} from "@/shared/supabase";
import { SUBJECTS } from "@/shared/subjects";

type ChatSource = {
  id: string;
  kind: "mcq" | "subject-intro";
  subject: string;
  topic?: string | null;
  question?: string;
  slug?: string;
};
type ChatMessage = UIMessage<unknown, { sources: ChatSource[] }>;

const STARTERS = [
  "Explain a General Knowledge MCQ about world geography.",
  "Find an MCQ about Pakistan’s constitutional history.",
  "Help me understand a science question and its correct answer.",
];

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask Ilmivora — MCQ Study Assistant" },
      {
        name: "description",
        content: "Ask study questions and explore Ilmivora MCQs with an AI study assistant.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentAuthUser>>(null);
  const [subject, setSubject] = useState("");
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/ilmivora-chat",
        headers: async () => {
          const token = await getCurrentAccessToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ subject: subject || undefined }),
      }),
    [subject],
  );
  const { messages, sendMessage, status, error, clearError, setMessages, stop } =
    useChat<ChatMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const refresh = () => setUser(getCurrentAuthUser());
    refresh();
    return subscribeToAuthChanges(refresh);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy || !user) return;
    clearError();
    sendMessage({ text: question });
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const askStarter = (prompt: string) => {
    if (!busy && user) sendMessage({ text: prompt });
  };

  return (
    <div className="container-page py-8 md:py-12">
      <section className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> AI study assistant
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ask Ilmivora</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Ask about exam topics and MCQs. Answers are grounded in published questions from
              Ilmivora.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="sr-only" htmlFor="ask-subject">
              Limit search to a subject
            </label>
            <select
              id="ask-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              disabled={!user || busy}
              className="h-10 max-w-52 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                stop();
                setMessages([]);
                clearError();
              }}
              disabled={!messages.length && !error}
              aria-label="Start a new conversation"
              title="Start a new conversation"
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bot aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold">Study chat</h2>
              <p className="text-xs text-muted-foreground">
                MCQ-grounded answers · {subject || "All subjects"}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Open model
            </span>
          </div>

          <div
            className="max-h-[min(62vh,720px)] min-h-[360px] space-y-5 overflow-y-auto p-4 sm:p-6"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {!messages.length && (
              <div className="mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen aria-hidden="true" className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">What are you studying today?</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  I’ll search published MCQs, then explain the answer using the matching question
                  and explanation as references.
                </p>
                {user ? (
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {STARTERS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => askStarter(prompt)}
                        className="rounded-full border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button asChild className="mt-6">
                    <Link to="/login">Log in to start chatting</Link>
                  </Button>
                )}
              </div>
            )}

            {messages.map((message) => {
              const sources =
                message.parts.find((part) => part.type === "data-sources")?.data ?? [];
              return (
                <article
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role !== "user" && (
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Bot aria-hidden="true" className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`min-w-0 max-w-[88%] space-y-3 ${message.role === "user" ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground" : ""}`}
                  >
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <p
                          key={`${message.id}-${index}`}
                          className={`whitespace-pre-wrap text-sm leading-7 ${message.role === "assistant" ? "text-foreground" : ""}`}
                        >
                          {part.text}
                        </p>
                      ) : null,
                    )}
                    {message.role === "assistant" && sources.length > 0 && (
                      <div className="rounded-xl border border-border bg-background p-3">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <BookOpen aria-hidden="true" className="h-3.5 w-3.5" /> Related MCQs used
                        </p>
                        <ul className="space-y-2">
                          {sources.map((source) => (
                            <li key={source.id}>
                              {source.kind === "mcq" && source.question ? (
                                <Link
                                  to="/search"
                                  search={{ q: source.question }}
                                  className="block rounded-lg p-2 text-xs text-foreground transition-colors hover:bg-accent"
                                >
                                  <span className="font-semibold text-primary">
                                    MCQ · {source.subject}
                                    {source.topic ? ` · ${source.topic}` : ""}
                                  </span>
                                  <span className="mt-1 block leading-5">{source.question}</span>
                                </Link>
                              ) : (
                                <Link
                                  to="/subjects/$slug"
                                  params={{ slug: source.slug ?? "" }}
                                  className="block rounded-lg p-2 text-xs text-foreground transition-colors hover:bg-accent"
                                >
                                  <span className="font-semibold text-primary">
                                    Subject introduction · {source.subject}
                                  </span>
                                  <span className="mt-1 block leading-5">
                                    Open the subject guide
                                  </span>
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <UserRound aria-hidden="true" className="h-4 w-4" />
                    </div>
                  )}
                </article>
              );
            })}

            {busy && messages.at(-1)?.role === "user" && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Bot aria-hidden="true" className="h-4 w-4" />
                </div>
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Searching MCQs
                and preparing an explanation…
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error.message || "The assistant could not answer. Please try again."}
              </p>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-border bg-background/70 p-3 sm:p-4">
            {!user && (
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Log in to ask questions and search the MCQ library.
              </p>
            )}
            <div className="flex items-end gap-2 rounded-xl border border-input bg-card p-2 focus-within:ring-2 focus-within:ring-ring">
              <label className="sr-only" htmlFor="ask-message">
                Ask about an MCQ or subject
              </label>
              <Textarea
                id="ask-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a topic, question or explanation…"
                maxLength={600}
                rows={2}
                disabled={!user || busy}
                className="max-h-36 min-h-12 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              {busy ? (
                <Button type="button" variant="outline" onClick={() => stop()} className="shrink-0">
                  <span className="h-2 w-2 rounded-full bg-destructive" /> Stop
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!user || !input.trim()}
                  aria-label="Send question"
                  className="mb-0.5 shrink-0"
                >
                  <Send aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CircleHelp aria-hidden="true" className="h-3 w-3" /> Answers use matching Ilmivora
                MCQs; check linked questions for context.
              </span>
              <span>{input.length}/600 · Ctrl+Enter to send</span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
