interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed sm:max-w-[65%] ${
          isUser
            ? "bg-[var(--message-user)] text-[var(--text-primary)]"
            : "text-[var(--text-primary)]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
