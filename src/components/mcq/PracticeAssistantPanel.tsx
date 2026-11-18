import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Link } from "@tanstack/react-router";
import { ArrowUp, Bot, LoaderCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getCurrentAccessToken,
  getCurrentAuthUser,
  subscribeToAuthChanges,
} from "@/shared/supabase";

type ChatSource = {
  id: string;
  kind: "mcq" | "subject-intro";
  subject: string;
  topic?: string | null;
  question?: string;
  slug?: string;
};
type ChatMessage = UIMessage<unknown, { sources: ChatSource[] }>;

export function PracticeAssistantPanel({ subject }: { subject?: string }) {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState<ReturnType<typeof getCurrentAuthUser>>(null);
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/ilmivora-chat",
        headers: async () => {
          const token = await getCurrentAccessToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ subject }),
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

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="sticky top-24 ml-auto flex w-full gap-2 lg:w-auto"
        onClick={() => setOpen(true)}
        aria-label="Open Ask Ilmivora assistant"
      >
        <Bot aria-hidden="true" /> Ask Ilmivora
      </Button>
    );
  }

  return (
    <aside className="sticky top-24 flex h-[min(74vh,760px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Bot aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold">Ask Ilmivora</h2>
          <p className="truncate text-xs text-muted-foreground">
            {subject ? `Practising ${subject}` : "Ask about MCQs and subjects"}
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            stop();
            setMessages([]);
            clearError();
          }}
          disabled={!messages.length && !error}
          aria-label="Clear chat"
          title="Clear chat"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setOpen(false)}
          aria-label="Close Ask Ilmivora sidebar"
          title="Close sidebar"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {!messages.length && (
          <div className="rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            Ask for an explanation or help finding a related question. Answers use published
            Ilmivora MCQs as references.
          </div>
        )}
        {messages.map((message) => {
          const sources = message.parts.find((part) => part.type === "data-sources")?.data ?? [];
          return (
            <article key={message.id} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {message.role === "user" ? "You" : "Ilmivora assistant"}
              </p>
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <p
                    key={`${message.id}-${index}`}
                    className="whitespace-pre-wrap text-sm leading-6"
                  >
                    {part.text}
                  </p>
                ) : null,
              )}
              {message.role === "assistant" && sources.length > 0 && (
                <div className="space-y-1 border-l-2 border-primary/30 pl-3">
                  <p className="text-xs font-semibold text-muted-foreground">Related questions</p>
                  {sources.slice(0, 4).map((source) =>
                    source.kind === "mcq" ? (
                      <Link
                        key={source.id}
                        to="/search"
                        search={{ q: source.question ?? "" }}
                        className="block truncate text-xs text-primary hover:underline"
                      >
                        {source.question}
                      </Link>
                    ) : (
                      <Link
                        key={source.id}
                        to="/subjects/$slug"
                        params={{ slug: source.slug ?? "" }}
                        className="block truncate text-xs text-primary hover:underline"
                      >
                        {source.subject} introduction
                      </Link>
                    ),
                  )}
                </div>
              )}
            </article>
          );
        })}
        {busy && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Searching MCQs…
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error.message}
          </p>
        )}
      </div>

      {!user && (
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          Log in to chat with the study assistant.
        </p>
      )}
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3">
        <label className="sr-only" htmlFor="practice-assistant-message">
          Ask Ilmivora
        </label>
        <Textarea
          id="practice-assistant-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={user ? "Ask about this subject…" : "Log in to start chatting"}
          disabled={!user || busy}
          rows={2}
          className="min-h-10 resize-none text-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!user || busy || !input.trim()}
          aria-label="Send message"
        >
          {busy ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
        </Button>
      </form>
    </aside>
  );
}
