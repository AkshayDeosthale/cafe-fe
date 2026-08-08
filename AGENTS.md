# CaféOS Frontend

Next.js 16 (App Router) + React 19 + TS strict + Tailwind 4 + shadcn (base-ui). Product spec: `AI context/idea.md`.

## Architecture

```
mock/            seed data (one file per domain) — the ONLY place dummy data lives
lib/types.ts     domain types + zod schemas
lib/data/        repositories — pure TS in-memory store (globalThis, survives HMR,
                 resets on restart). NO Next imports here → unit-testable.
lib/actions/     "use server" server actions — ALL data access goes through these.
                 zod-validate → repo → revalidatePath. No API routes.
lib/permissions.ts  role→permission map, hasPermission(), currentEmployee() (mock: first admin)
lib/utils/       inr(), cartTotals(), elapsed buckets, formatters
components/shared/  PageHeader, SearchForm (?search= debounced), Pagination,
                    ConfirmButton, EmptyState, StatusBadge, StatCard
features/<domain>/  page-level client components (one folder per page)
app/(authenticated)/  17 pages — server components fetching via actions.
                      Data pages use `export const dynamic = "force-dynamic"`.
```

Rules:
- Never import `mock/` from components/pages. Pages call `lib/actions/*`.
- Never trust client prices — checkout rebuilds cart from product master server-side.
- Money math in `lib/utils/totals.ts` (cartTotals). GST proportional per line.
- Stock moves only via `applyMovement` (sale/purchase/waste/correction) — keeps movement log.
- Backend swap: rewrite `lib/data/*` internals only. UI untouched.

## Testing

`npm test` (vitest + testing-library, jsdom).
- `tests/unit/` — every repo: CRUD, guards, calc, state machines, permissions, reports. Reset via `resetDB()`.
- `tests/components/` — page clients; server actions mocked via `vi.mock("@/lib/actions/...")`, router via `vi.mock("next/navigation")`.

Gate before commit: `npx tsc --noEmit && npx vitest run && npm run build` — all three green.

## Notes

- Route protection disabled in `proxy.ts` during development (re-enable before launch).
- QR codes via api.qrserver.com image (needs internet).
- Subscription/Profile are placeholders — swap to Clerk `<PricingTable/>` / `<UserProfile/>` later.
- Auth user = first admin employee (mock) until Clerk session wiring.
