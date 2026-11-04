# Ilmivora

Ilmivora is a competitive exam preparation app for browsing multiple-choice questions (MCQs), practising by subject, and taking timed exams. It uses TanStack Start, React, Vite, and Supabase.

This repository is connected to Lovable. Keep the connected branch buildable; commits pushed to that branch sync back to Lovable.

## Start developing

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |

## Project map

```text
src/
├── routes/       File-based pages and URL route definitions
├── components/
│   ├── admin/    Admin screens and forms
│   ├── mcq/      Question cards, browsers, quiz setup, practice and exam flows
│   ├── site/     Header, footer, breadcrumbs, page headers and subject intros
│   └── ui/       Shared low-level UI components
├── hooks/        Shared React hooks
├── lib/
│   ├── data/     Async data repositories and React Query definitions
│   ├── categories.ts       Subject and section tree helpers
│   ├── category-data.ts   Owner-provided subject and section catalogue
│   ├── mcq.ts              MCQ types and quiz rules
│   └── supabase.ts         Supabase Auth, REST and Storage helpers
└── test/         Vitest tests and test setup

public/           Static files served as-is
```

### Where to make common changes

- **Pages and URLs:** add or edit a route in `src/routes/`. TanStack's generated route tree is `src/routeTree.gen.ts`; it is generated from the route files.
- **MCQ data:** use `src/lib/data/mcq-repo.ts` through the async functions in `src/lib/data/queries.ts`. UI components should not access the database directly.
- **Question and exam behavior:** update `src/lib/mcq.ts` and its corresponding tests.
- **Subjects and sections:** use `src/lib/categories.ts`. The catalogue in `src/lib/category-data.ts` is owner data; do not invent or manually add categories.
- **Subject images and introductions:** use `src/lib/data/subject-intro-repo.ts` and the admin UI in `src/components/admin/AdminSubjectIntros.tsx`.
- **Admin sections:** edit components in `src/components/admin/`. Admin tabs are selected by the `?tab=` URL parameter on `/admin`.
- **Shared navigation and styling:** `src/components/site/` and the application styles in `src/styles.css`.

## Supabase setup

Copy `.env.example` to `.env.local` and set the project's browser-safe configuration:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Never commit `.env.local` or service-role keys. Public database access is controlled by Supabase row-level security; admin operations must remain behind the app's admin checks and policies.

## Tests

Tests live under `src/test/`. They cover the app routes, MCQ rules, and subject introduction repository. Run them with `npm test` when you want to check changes.
