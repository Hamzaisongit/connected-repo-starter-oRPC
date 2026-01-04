# Frontend Agent Guidelines

## Stack
React 19, Vite 7 + SWC, React Router 7, TanStack Query + oRPC, React Hook Form, Zustand, Material-UI (via `@connected-repo/ui-mui`), Zod, Better Auth, Sentry

## Testing
- **E2E**: Playwright - `yarn test:e2e`, `yarn test:e2e:ui`
- **Shared State**: Tests share browser state - use conditional logic, check app state before actions

## React 19 Patterns
- **Actions & useTransition**: Handle async mutations
- **use() Hook**: Consume promises in render
- **Suspense**: Data fetching boundaries
- **Minimize useEffect**: Prefer direct calculations, event handlers, use()

## Structure
```
src/
├── modules/          # Feature modules (auth, user-stack, etc.)
│   └── <module>/
│       ├── pages/          # Module pages
│       ├── <module>.router.tsx  # Routes
│       └── <module>.spec.ts     # E2E tests
├── components/       # Shared (prefer ui-mui package)
├── utils/           # oRPC client, auth, query client
├── router.tsx       # Main routes
└── main.tsx         # Entry
```

## Module Rules
- **Self-contained**: Each module has own pages, routes, logic
- **NO cross-module imports**: Move shared components to `@connected-repo/ui-mui`
- **Lazy load pages**: `const Page = lazy(() => import('./pages/Page.page'))`
- **Module router**: Export router from `<module>.router.tsx`

## Components
**Naming**:
- Pages: `PageName.page.tsx` (Login.page.tsx)
- Components: `ComponentName.tsx`

**Use ui-mui Package**:
```typescript
import { Button } from '@connected-repo/ui-mui/form/Button'
import { Card } from '@connected-repo/ui-mui/layout/Card'
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
```

## Forms (React Hook Form)
```typescript
import { useRhfForm } from '@connected-repo/ui-mui/rhf-form/useRhfForm'
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
import { zodResolver } from '@hookform/resolvers/zod'

const { formMethods, RhfFormProvider } = useRhfForm({
  onSubmit: async (data) => { /* submit */ },
  formConfig: { resolver: zodResolver(schema) }
})

return (
  <RhfFormProvider>
    <RhfTextField name="email" label="Email" type="email" />
    <RhfSubmitButton />
  </RhfFormProvider>
)
```

## State Management
- **Server state**: oRPC + TanStack Query
- **Global state**: Zustand (theme, user session, shared UI state)
- **Form state**: React Hook Form
- **URL state**: React Router params
- **Local state**: useState/useReducer

## oRPC Client
```typescript
import { orpc } from '@/utils/orpc.client'

// Query
const { data, isLoading } = orpc.adherenceLog.getAll.useQuery()

// Mutation
const createLog = orpc.adherenceLog.create.useMutation()
await createLog.mutateAsync({ supplementId: 'uuid', status: 'Taken on-time', scheduledFor: new Date() })
```
## Visual & UX Identity System

### Design Principles (CRITICAL)

**Beautiful, Smooth, Delightful**:
- Tasteful colors, generous spacing, clear typography
- Smooth transitions (200-300ms)
- Immediate feedback on actions
- Elegant loading (skeleton > spinner)
- Friendly errors, inviting empty states

### Design Language: "Airy Compliance"
The app must feel like a premium wellness space, not a medical tool. We follow a **Glassmorphism/Neo-minimalist** approach with soft shadows, high-contrast typography, and generous whitespace.

**Key Aesthetic Principles**:
- **Glassmorphism** (where applicable): Semi-transparent backgrounds with backdrop blur for depth
- **High border radii**: 32px for cards/buttons, creating a modern, friendly feel
- **Soft gradients**: Subtle transitions instead of flat colors
- **Airy layouts**: Generous spacing, breathing room between elements
- **Don't overdo it**: Apply glass effects selectively for impact, not everywhere

### Core UI Specs (MUI Overrides)
- **Border Radius:** Global `32px` for main cards and buttons (Neo-minimalist style). Smaller components (chips) use `100px`.
- **Backgrounds:** Use subtle linear gradients instead of flat colors. 
  - Light Mode: `linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)`
  - Cards: Semi-transparent white (#FFFFFFCC) with `backdrop-filter: blur(10px)` for glassmorphism effect
- **Typography:** - Headings: Serif font (e.g., 'Playfair Display' or 'Georgia') for "Oops, missed a dose?" to feel personal.
  - Body: San-serif (System UI) for legibility.
- **Buttons:**
  - Primary: Deep Navy (#1A1C2E) with white text.
  - Secondary: Soft Tint (#E0F2FE) with primary-colored text.
- **Shadows:** Use "Soft Depth" — `box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05)`.

**Glassmorphism Usage** (selective, not everywhere):
```tsx
// Hero sections, feature cards, modals - places that benefit from depth
<Box sx={{
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '32px',
}} />
```

### Component States
- **Overdue/Missed:** Use a soft "Muted Salmon" (#FEE2E2 text on white) rather than harsh red.
- **Success:** Use "Sage Green" (#4F6F52).
- **Interactive:** Every button must be "one-thumb" height (min 56px).

## Interaction Design: "The One-Fold Rule"
- **Compactness:** Every form must fit on a standard mobile screen (approx. 800px height) without scrolling. Use horizontal layouts for related fields (e.g., Dosage + Unit).
- **Dynamic Fields:** Use `react-hook-form`'s `useFieldArray` for list-based inputs (Instructions, Times). Use a '+' icon button that is accessible for one-thumb operation.
- **Visual Cues:** Use a modern `Switch` or a custom `Toggle` for binary states (Active/Inactive) instead of checkboxes.

## Flavor & Personalization
- **Dynamic Address:** Always use the user's name (e.g., "Good evening, [Name] 👋").
- **Visual Fillers:** If a supplement has no user-uploaded image, fallback to a category-specific stock illustration (e.g., a sun for Vitamin D, a fish for Omega-3).
- **Status Hierarchy:** Follow a 3-line detail rule for list items: 1. Name, 2. Dosage/Time, 3. Status (Overdue/Taken/Upcoming).

**Color**:
```tsx
<Box sx={{
  bgcolor: 'background.paper',
  color: 'text.primary',
  borderColor: 'divider',
}} />
```

**Spacing** (theme.spacing = 8px):
```tsx
sx={{ p: 2, mb: 3, gap: 1.5 }}  // 16px, 24px, 12px
```

**Transitions**:
```tsx
sx={{
  transition: 'all 0.2s ease-in-out',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
}}
```

**Typography**:
```tsx
<Typography variant="h5" fontWeight={600} lineHeight={1.7} />
```

## Responsive Design (CRITICAL)

**Mobile-First**:
```tsx
<Box sx={{
  p: 2,                    // Mobile: 16px
  md: { p: 3 },            // Desktop: 24px
  fontSize: { xs: '1rem', md: '0.875rem' }
}} />
```

**Breakpoints**: xs (0), sm (600px), md (900px), lg (1200px), xl (1536px)

**Touch Targets**: Min 44x44px
```tsx
<Button sx={{
  minHeight: 44,
  padding: { xs: '12px 24px', md: '8px 16px' }
}} />
```

**Grid**:
```tsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4}>  {/* Responsive columns */}
</Grid>
```

**Stack**:
```tsx
<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} />
```

**useMediaQuery**:
```tsx
const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
return isMobile ? <MobileView /> : <DesktopView />
```

## Performance
- **Lazy load** route-level pages
- **Memoize** expensive calculations
- **React Query** caching & stale-while-revalidate

## Environment
- Prefix: `VITE_`
- Access: `import.meta.env.VITE_API_URL`

## Key Takeaways
1. React 19: use(), useTransition, Suspense - minimize useEffect
2. NO `any` or `as unknown`
3. Modular: Keep modules independent
4. Lazy load pages
5. UI components: Use `@connected-repo/ui-mui`
6. Direct imports: `@connected-repo/ui-mui/form/Button`
7. Beautiful design: Tasteful, smooth, delightful
8. Responsive: ALWAYS mobile, tablet, desktop
9. Forms: React Hook Form + Zod + RHF components
10. State: Server (oRPC/Query), Global (Zustand), Forms (RHF), URL (Router), Local (useState)
