import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "../utilities/cn"

/* ------------------------------------------------------------------ */
/*  Conversation                                                       */
/* ------------------------------------------------------------------ */

export const Conversation = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-conversation", className)} {...props} />
  ),
)
Conversation.displayName = "Conversation"

/* ------------------------------------------------------------------ */
/*  ConversationContainer                                              */
/* ------------------------------------------------------------------ */

export const ConversationContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-conversation__container", className)} {...props} />
  ),
)
ConversationContainer.displayName = "ConversationContainer"

/* ------------------------------------------------------------------ */
/*  MessageList                                                        */
/* ------------------------------------------------------------------ */

export const MessageList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-conversation__messages", className)} {...props} />
  ),
)
MessageList.displayName = "MessageList"

/* ------------------------------------------------------------------ */
/*  Message                                                            */
/* ------------------------------------------------------------------ */

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  sent?: boolean
  avatar?: string
  author?: string
  timestamp?: string
  metadata?: string
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ sent, avatar, author, timestamp, metadata, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("l-ui-message", sent && "l-ui-message--sent", className)}
      {...props}
    >
      {avatar && !sent && (
        <div className="l-ui-message__avatar" aria-hidden="true">
          {avatar}
        </div>
      )}
      <div className="l-ui-message__bubble">
        {author && <div className="l-ui-message__author">{author}</div>}
        <div className="l-ui-message__body">{children}</div>
        {(timestamp || metadata) && (
          <div className="l-ui-message__footer">
            {metadata && (
              <span className="l-ui-message__metadata">{metadata}</span>
            )}
            {timestamp && (
              <span className="l-ui-message__timestamp">{timestamp}</span>
            )}
          </div>
        )}
      </div>
    </div>
  ),
)
Message.displayName = "Message"

/* ------------------------------------------------------------------ */
/*  Separator                                                          */
/* ------------------------------------------------------------------ */

export const ConversationSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-conversation__separator", className)} {...props}>
      {children}
    </div>
  ),
)
ConversationSeparator.displayName = "ConversationSeparator"

/* ------------------------------------------------------------------ */
/*  Composer                                                           */
/* ------------------------------------------------------------------ */

export interface ComposerProps extends HTMLAttributes<HTMLDivElement> {
  onSend?: (text: string) => void
}

export const Composer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-conversation__composer", className)} {...props}>
      {children}
    </div>
  ),
)
Composer.displayName = "Composer"

/* ------------------------------------------------------------------ */
/*  TypingIndicator                                                    */
/* ------------------------------------------------------------------ */

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("l-ui-typing-indicator", className)} aria-label="Typing">
      <span className="l-ui-typing-indicator__dot" />
      <span className="l-ui-typing-indicator__dot" />
      <span className="l-ui-typing-indicator__dot" />
    </div>
  )
}
