# Communication Style Rule

- Antigravity must always respond in Hinglish (a blend of Hindi and English written in the Latin/Roman script). Avoid using pure Hindi script (Devanagari) or formal/pure English.

# Locked Core Application Architecture Rules

1. **Strict Swap Request Chat Locking**:
   - Chat access and messaging MUST strictly require an ACCEPTED SwapRequest (`status === 'accepted'`).
   - `getChats`, `getMessages`, and `sendMessage` in `chatController.js` MUST enforce that only accepted swap requests can view or send messages.
   - `UserProfileModal` MUST render "Open Chat" ONLY when `isConnected` (accepted swap request), "Request Pending" when pending, and "Send match request" otherwise.

2. **AI Assistant Fresh Chat State**:
   - `AIChatbox.jsx` MUST always start with a fresh new chat session on mount/refresh/navigation (`setMessages([])` and new `currentSessionId`).
   - Never auto-load past chat sessions onto the active chat window on page load. History chats must only be loaded when explicitly selected in the History drawer.

3. **Instant Guest Loading**:
   - Guest page loads MUST NOT block on access token refresh API calls. Use `hasSessionHint` in `tokenStore.js` and `AuthContext.jsx`.

4. **No Dummy Fallback Strings**:
   - Never render default "SkillSwap member" string under user names on cards or modals.

5. **Universal Field-Wise Skill Normalization & Merging**:
   - `Skill.js` and `adminController.js` MUST automatically canonicalize and normalize skill titles (e.g., "Ui/ux", "Ui/ux Design", "UI/UX", "UX/UI" -> "UI/UX Design", `normalizedTitle`: "ui/ux design", `category`: "design").
   - All skill variations across categories (Tech, Design, Business, Marketing, Languages, Music, Fitness, etc.) MUST be grouped field-wise under single canonical cards across Frontend, Backend, and MongoDB.

6. **Admin Dashboard Animations**:
   - `AdminOverview.jsx` and `AdminAnalytics.jsx` MUST render slow motion SVG line drawing animations (`4.2s cubic-bezier(0.25, 1, 0.5, 1)`) from left to right for line charts, and bottom-to-top growing animations for vertical bar charts.
   - Lower analytics charts MUST trigger slow-motion progress animations when scrolled into view via `IntersectionObserver`.

7. **Weekly Recent User Registrations & Avatar Initials**:
   - `AdminOverview.jsx` MUST fetch weekly registrations (`createdAt >= sevenDaysAgo`) and render clean Initials (`getInitials(name)`) of Name + Surname (e.g. "HV" for Heli Vyas) inside orange avatar circles with type-safe fallback.
