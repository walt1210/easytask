# EasyTask - Focus Assistant

A smart task management and focus assistant built with Next.js 15 and Supabase.

## Features

- Task management with categories (Work, Personal, Urgent)
- Energy level tracking (High, Medium, Low) to prioritize tasks
- Focus mode with timer
- Progress statistics dashboard
- Smart task suggestions based on energy levels
- Dark sidebar navigation
- Mobile-responsive design

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email/Password)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Connection (Auto-provided by Supabase integration)
POSTGRES_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your-project.supabase.co

# JWT Secret (Auto-provided by Supabase integration)
SUPABASE_JWT_SECRET=your_jwt_secret

# Optional: For local development email redirects
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication

### Email/Password Authentication

EasyTask uses Supabase Auth with email and password authentication.

#### Sign Up Flow

1. Navigate to `/auth/sign-up`
2. Enter your email and password (minimum 6 characters)
3. Click "Create Account"
4. Check your email for a confirmation link
5. Click the link to confirm your account
6. You will be redirected to the dashboard

#### Login Flow

1. Navigate to `/auth/login`
2. Enter your registered email and password
3. Click "Sign In"
4. You will be redirected to the dashboard

#### Logout

Click the "Logout" button in the sidebar (desktop) or mobile navigation menu.

#### Protected Routes

All routes except `/auth/*` are protected by middleware. Unauthenticated users are automatically redirected to `/auth/login`.

---

## Database Schema

### Tasks Table

The `tasks` table stores all user tasks with Row Level Security (RLS) enabled.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | - | Foreign key to `auth.users(id)`, cascade delete |
| `title` | TEXT | - | Task title (required) |
| `description` | TEXT | `null` | Optional task description |
| `due_date` | DATE | `null` | Optional due date |
| `due_time` | TIME | `null` | Optional due time |
| `tag` | task_tag | `'work'` | Task category |
| `status` | task_status | `'todo'` | Current status |
| `energy_required` | energy_level | `'medium'` | Energy level needed |
| `completed_at` | TIMESTAMPTZ | `null` | Auto-set when done |
| `created_at` | TIMESTAMPTZ | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | `NOW()` | Last update timestamp |

### Custom Types (ENUMs)

```sql
-- Task categories
CREATE TYPE task_tag AS ENUM ('work', 'personal', 'urgent');

-- Task status
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done');

-- Energy levels for task prioritization
CREATE TYPE energy_level AS ENUM ('high', 'medium', 'low');
```

### Row Level Security (RLS) Policies

All policies use `auth.uid() = user_id` to ensure users can only access their own data:

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view their own tasks | SELECT | `auth.uid() = user_id` |
| Users can create their own tasks | INSERT | `auth.uid() = user_id` |
| Users can update their own tasks | UPDATE | `auth.uid() = user_id` |
| Users can delete their own tasks | DELETE | `auth.uid() = user_id` |

### Database Indexes

| Index | Column | Purpose |
|-------|--------|---------|
| `idx_tasks_user_id` | `user_id` | Fast user-specific queries |
| `idx_tasks_status` | `status` | Fast status filtering |
| `idx_tasks_due_date` | `due_date` | Fast due date queries |

### Auto-Update Trigger

The `updated_at` column is automatically updated on every row change via a trigger:

```sql
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## API Reference

### Server Actions (`lib/actions.ts`)

All server actions are authenticated and will return an error if the user is not logged in.

#### `getTasks()`

Fetches all tasks for the authenticated user, ordered by creation date (newest first).

```typescript
const { tasks, error } = await getTasks()
// tasks: Task[] | []
// error: string | null
```

#### `createTask(formData)`

Creates a new task for the authenticated user.

```typescript
const { task, error } = await createTask({
  title: "Complete project report",      // Required
  description: "Q4 financial summary",   // Optional
  due_date: "2024-12-31",               // Optional (YYYY-MM-DD)
  due_time: "14:00",                    // Optional (HH:MM)
  tag: "work",                          // "work" | "personal" | "urgent"
  energy_required: "high"               // "high" | "medium" | "low"
})
```

#### `updateTaskStatus(taskId, status)`

Updates a task's status. Automatically sets `completed_at` when status is `"done"`.

```typescript
const { error } = await updateTaskStatus(
  "550e8400-e29b-41d4-a716-446655440000",  // Task UUID
  "done"                                     // "todo" | "in-progress" | "done"
)
```

#### `deleteTask(taskId)`

Permanently deletes a task.

```typescript
const { error } = await deleteTask("550e8400-e29b-41d4-a716-446655440000")
```

#### `toggleTaskComplete(taskId, currentStatus)`

Convenience function to toggle a task between `todo` and `done`.

```typescript
const { error } = await toggleTaskComplete(
  "550e8400-e29b-41d4-a716-446655440000",
  "todo"  // Current status - will toggle to "done"
)
```

### Task Type Definition

```typescript
type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null       // "YYYY-MM-DD"
  due_time: string | null       // "HH:MM:SS"
  tag: "work" | "personal" | "urgent"
  status: "todo" | "in_progress" | "done"
  energy_required: "high" | "medium" | "low"
  completed_at: string | null   // ISO timestamp
  created_at: string            // ISO timestamp
  updated_at: string            // ISO timestamp
}
```

---

## Project Structure

```
easytask/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── sign-up/page.tsx        # Sign up page
│   │   ├── sign-up-success/page.tsx # Email confirmation message
│   │   └── error/page.tsx          # Auth error page
│   ├── globals.css                 # Global styles & design tokens
│   ├── layout.tsx                  # Root layout with fonts
│   └── page.tsx                    # Main dashboard (protected)
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── add-task-modal.tsx          # Add new task dialog
│   ├── app-sidebar.tsx             # Desktop sidebar navigation
│   ├── energy-selector.tsx         # Energy level picker
│   ├── focus-card.tsx              # Focus mode with timer
│   ├── header.tsx                  # Dashboard header with greeting
│   ├── mobile-nav.tsx              # Mobile hamburger navigation
│   ├── smart-suggestion.tsx        # AI-style suggestion banner
│   ├── stats-cards.tsx             # Task statistics cards
│   └── task-list.tsx               # Filterable task list
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client (singleton)
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts           # Supabase middleware helper
│   ├── actions.ts                  # Server actions for CRUD
│   ├── store.ts                    # Utility functions (greeting, date)
│   └── utils.ts                    # General utilities (cn)
├── scripts/
│   └── 001_create_tasks_table.sql  # Database migration
└── middleware.ts                   # Next.js middleware for auth
```

---

## Development

### Running Database Migrations

SQL migrations are located in the `scripts/` folder. Execute them in your Supabase SQL editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration file contents
4. Click "Run"

Or use the Supabase CLI:

```bash
supabase db push
```

### Adding New Features

1. Update the database schema if needed (add new migration in `scripts/`)
2. Update types in `lib/actions.ts`
3. Add server actions for data operations
4. Create or update React components

### Design Tokens

The app uses CSS custom properties for theming. Edit `app/globals.css` to customize:

- Primary color (orange): `--primary`
- Sidebar colors: `--sidebar`, `--sidebar-foreground`
- Accent color (green): `--accent`

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy

### Required Environment Variables for Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Built with v0

This project was built with [v0](https://v0.app). Continue developing:

[Continue working on v0](https://v0.app/chat/projects/prj_BdxbdFK1EnEAaCadKqODsy2tYgpT)

## License

MIT
