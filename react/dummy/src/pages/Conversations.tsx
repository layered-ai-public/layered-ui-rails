import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"
import { IconChevronDown } from "@layered-ui/icons"

export default function Conversations() {
  return (
    <>
      <PageHeader
        title="Conversations"
        description="A message list component for displaying conversations and messages. The container uses h-full to fill its parent's height, so the parent must provide an explicit height."
      />

      <div className="l-ui-conversation__container l-ui-utility--mt-xl">
        <div className="l-ui-conversation__messages">
          <div className="l-ui-conversation">
            <div className="l-ui-message">
              <div className="l-ui-message__avatar">AL</div>
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__author">Alice</div>
                <div className="l-ui-message__body">
                  Has anyone had a chance to review the pull request? I'd love to get it merged before the end of the week.
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__timestamp">10:30 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-message--sent">
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__author">Bob</div>
                <div className="l-ui-message__body">
                  I'll take a look this afternoon. The changes look straightforward from the description.
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__metadata">Claude Opus 4.6 (~128 tokens)</div>
                  <div className="l-ui-message__timestamp">10:32 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-message">
              <div className="l-ui-message__avatar">AL</div>
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__author">Alice</div>
                <div className="l-ui-message__body">
                  Thank you! Let me know if you have any questions about the implementation.
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__metadata">ChatGPT 5.2 (~96 tokens)</div>
                  <div className="l-ui-message__timestamp">10:33 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-conversation__separator">Today</div>

            <div className="l-ui-message">
              <div className="l-ui-message__avatar">BK</div>
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__author">Bob</div>
                <div className="l-ui-message__body l-ui-markdown">
                  <p>I left a few comments on the PR. The main issue is the <code>validate_input</code> method - it doesn't handle <strong>empty strings</strong> or <code>nil</code> values. Here's what I'd suggest:</p>
                  <pre><code>{`def validate_input(value)
  return false if value.nil? || value.empty?
  value.match?(/\\A[\\w\\s]+\\z/)
end`}</code></pre>
                  <p>Also, the error messages could be more descriptive. Instead of <em>"invalid input"</em>, something like:</p>
                  <blockquote>
                    <p>Please enter a value containing only letters, numbers, and spaces.</p>
                  </blockquote>
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__metadata">Claude Opus 4.6 (~215 tokens)</div>
                  <div className="l-ui-message__timestamp">10:45 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-message--sent">
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__body l-ui-markdown">
                  <p>Good catches, Bob. I agree with both suggestions. To summarise the changes needed:</p>
                  <ol>
                    <li>Add <strong>nil and empty string</strong> guards to <code>validate_input</code></li>
                    <li>Update error messages to be more descriptive</li>
                    <li>Add unit tests for the new edge cases</li>
                  </ol>
                  <p>I'll push a fix shortly.</p>
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__metadata">ChatGPT 5.2 (~84 tokens)</div>
                  <div className="l-ui-message__timestamp">11:02 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-message">
              <div className="l-ui-message__avatar">AL</div>
              <div className="l-ui-message__bubble">
                <div className="l-ui-message__author">Alice</div>
                <div className="l-ui-message__body l-ui-markdown">
                  <p>I've pushed the fix. Here's what changed:</p>
                  <h3>Validation</h3>
                  <ul>
                    <li>Added <s>early return</s> guard clause for <code>nil</code> and empty strings</li>
                    <li>Improved the regex to also allow <em>hyphens</em> and <em>underscores</em></li>
                  </ul>
                  <h3>Error messages</h3>
                  <table>
                    <caption className="l-ui-sr-only">Error message changes</caption>
                    <thead>
                      <tr>
                        <th scope="col">Before</th>
                        <th scope="col">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>invalid input</code></td>
                        <td>Please enter a valid name</td>
                      </tr>
                      <tr>
                        <td><code>too long</code></td>
                        <td>Name must be under 255 characters</td>
                      </tr>
                    </tbody>
                  </table>
                  <hr />
                  <p>Ready for re-review when you get a chance.</p>
                </div>
                <div className="l-ui-message__footer">
                  <div className="l-ui-message__metadata">ChatGPT 5.2 (~340 tokens)</div>
                  <div className="l-ui-message__timestamp">11:30 AM</div>
                </div>
              </div>
            </div>

            <div className="l-ui-message">
              <div className="l-ui-message__avatar">BK</div>
              <div className="l-ui-message__bubble">
                <div className="l-ui-typing-indicator" role="status">
                  <span className="l-ui-sr-only">Someone is typing</span>
                  <div className="l-ui-typing-indicator__dot"></div>
                  <div className="l-ui-typing-indicator__dot"></div>
                  <div className="l-ui-typing-indicator__dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="l-ui-conversation__composer">
          <textarea className="l-ui-conversation__composer-input" placeholder="Type a message..." rows={1} aria-label="Type a message"></textarea>
          <button className="l-ui-button--primary">Send</button>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-conversations-container" heading="Conversation container">
          <code className="l-ui-surface">{`<div class="l-ui-conversation__container">
  <div class="l-ui-conversation__messages">
    <div class="l-ui-conversation">
      <!-- Plain text message -->
      <div class="l-ui-message">...</div>
      <div class="l-ui-message--sent">...</div>

      <!-- Markdown message -->
      <div class="l-ui-message">
        <div class="l-ui-message__avatar">BK</div>
        <div class="l-ui-message__bubble">
          <div class="l-ui-message__body l-ui-markdown">
            <p>Rendered HTML from markdown...</p>
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div class="l-ui-message">
        <div class="l-ui-message__avatar">BK</div>
        <div class="l-ui-message__bubble">
          <div class="l-ui-typing-indicator">
            <div class="l-ui-typing-indicator__dot"></div>
            <div class="l-ui-typing-indicator__dot"></div>
            <div class="l-ui-typing-indicator__dot"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="l-ui-conversation__composer">
    <textarea class="l-ui-conversation__composer-input"
      placeholder="Type a message..." rows="1">
    </textarea>
    <button class="l-ui-button--primary">Send</button>
  </div>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Conversation CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation</code></th>
              <td className="l-ui-table__cell">Container for a list of messages</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation__container</code></th>
              <td className="l-ui-table__cell">Full-height container with scrolling messages and composer</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation__messages</code></th>
              <td className="l-ui-table__cell">Scrollable messages area</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation__composer</code></th>
              <td className="l-ui-table__cell">Message input area pinned to bottom</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation__composer-input</code></th>
              <td className="l-ui-table__cell">Textarea overrides for composing messages</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-conversation__separator</code></th>
              <td className="l-ui-table__cell">Date separator with horizontal lines</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message</code></th>
              <td className="l-ui-table__cell">Received message (left-aligned with avatar)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message--sent</code></th>
              <td className="l-ui-table__cell">Sent message (right-aligned, no avatar)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__avatar</code></th>
              <td className="l-ui-table__cell">Circular avatar aligned to bottom of bubble</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__bubble</code></th>
              <td className="l-ui-table__cell">Message bubble with background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__author</code></th>
              <td className="l-ui-table__cell">Author name inside bubble</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__body</code></th>
              <td className="l-ui-table__cell">Message text</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__footer</code></th>
              <td className="l-ui-table__cell">Container for tokens and timestamp</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__metadata</code></th>
              <td className="l-ui-table__cell">Metadata text, left-aligned in footer</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-message__timestamp</code></th>
              <td className="l-ui-table__cell">Message time, right-aligned in footer</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-typing-indicator</code></th>
              <td className="l-ui-table__cell">Animated typing indicator with bouncing dots</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-typing-indicator__dot</code></th>
              <td className="l-ui-table__cell">Individual dot inside the typing indicator</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-token-fade</code></th>
              <td className="l-ui-table__cell">Fade-in animation for streaming tokens (0.3s ease-in)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Scroll to bottom</h2>

      <p className="l-ui-utility--mt-md">A sticky button that appears when the user scrolls up in the message list. Hidden by default; add the <code>data-visible</code> attribute to reveal it.</p>

      <div className="l-ui-surface l-ui-utility--mt-lg l-ui-utility--p-lg" style={{ position: "relative", height: "8rem", overflowY: "auto" }}>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi scelerisque dui at dapibus tincidunt. In eleifend ante sit amet rhoncus cursus. Nullam erat lacus, ultrices vel molestie eu, luctus id enim.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi scelerisque dui at dapibus tincidunt. In eleifend ante sit amet rhoncus cursus. Nullam erat lacus, ultrices vel molestie eu, luctus id enim.</p>
        <button className="l-ui-scroll-to-bottom" data-visible aria-label="Scroll to bottom">
          <IconChevronDown className="l-ui-icon--sm" aria-hidden="true" />
        </button>
      </div>

      <div className="l-ui-utility--mt-lg">
        <CodeModal id="modal-conversations-scroll" heading="Scroll to bottom">
          <code className="l-ui-surface">{`<!-- Inside l-ui-conversation__messages -->
<button class="l-ui-scroll-to-bottom"
  aria-label="Scroll to bottom">
  <svg class="l-ui-icon--sm">...</svg>
</button>

<!-- Toggle visibility with data-visible -->
<button class="l-ui-scroll-to-bottom" data-visible
  aria-label="Scroll to bottom">
  <svg class="l-ui-icon--sm">...</svg>
</button>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Token fade-in</h2>

      <p className="l-ui-utility--mt-md">Apply <code>l-ui-token-fade</code> to each token as it arrives during streaming. The animation fades each token in over 0.3s with ease-in timing.</p>

      <div className="l-ui-surface l-ui-utility--mt-lg l-ui-utility--p-lg">
        <span className="l-ui-token-fade">Hello, </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.1s" }}>I'd </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.2s" }}>be </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.3s" }}>happy </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.4s" }}>to </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.5s" }}>help </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.6s" }}>with </span>
        <span className="l-ui-token-fade" style={{ animationDelay: "0.7s" }}>that.</span>
      </div>

      <div className="l-ui-utility--mt-lg">
        <CodeModal id="modal-conversations-token-fade" heading="Token fade-in">
          <code className="l-ui-surface">{`<!-- Apply to each token span as it streams in -->
<span class="l-ui-token-fade">Hello, </span>
<span class="l-ui-token-fade">I'd </span>
<span class="l-ui-token-fade">be </span>
<span class="l-ui-token-fade">happy </span>
...`}</code>
        </CodeModal>
      </div>
    </>
  )
}
