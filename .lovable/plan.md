

# Kanban Board App

A beautiful, interactive Kanban board with drag-and-drop, AI assistant, authentication, and persistent storage.

## 1. Authentication
- **Sign Up & Sign In pages** with email/password using Supabase Auth
- Protected routes — unauthenticated users are redirected to login
- User profile stored in a `profiles` table

## 2. Kanban Board (Core)
- **Three columns**: To Do, In Progress, Done
- **Rich task cards** showing title, description, due date, priority badge, and color-coded tags
- **Drag & drop** to move cards between columns (smooth animations)
- **Add Task** dialog to create new tasks with all fields
- **Edit & delete** tasks via card menu
- Clean, modern design inspired by your reference images — soft card shadows, rounded corners, column headers with task counts

## 3. Database & Persistence
- Supabase database to store tasks (title, description, status, due date, priority, tags, user ownership)
- Row-level security so each user only sees their own tasks
- Real-time sync — changes persist immediately

## 4. AI Chat Assistant
- Floating chat button that opens a slide-out panel
- **General Q&A** — ask anything like a ChatGPT experience
- **Task-aware** — can reference your board tasks to help prioritize, suggest next steps, or summarize what's on your plate
- Streaming responses for a smooth conversational feel
- Powered by Lovable AI (Gemini) via an edge function

## 5. Layout & Design
- Sidebar navigation with Dashboard/Board links and user profile at the bottom
- Top bar with search and "Add Task" button
- Gorgeous, polished UI with subtle animations, hover effects, and a clean color palette
- Fully responsive

