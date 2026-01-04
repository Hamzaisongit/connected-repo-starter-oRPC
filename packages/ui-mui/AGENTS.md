# @connected-repo/ui-mui

Material-UI components with direct exports for tree-shaking + React Hook Form wrappers

## Purpose
- Re-exports of MUI components with consistent theming
- Custom composite components
- RHF wrapper components for forms
- Zero barrel exports

## Structure
```
src/
├── components/      # Custom composites
├── data-display/    # MUI data display
├── feedback/        # MUI feedback
├── form/            # MUI form controls
├── layout/          # MUI layout
├── rhf-form/        # React Hook Form wrappers
└── theme/           # Theme config
```

## Imports

**External** (from other apps):
```typescript
import { Button } from '@connected-repo/ui-mui/form/Button'
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
```

**Internal** (within ui-mui):
```typescript
// ✅ Relative
import { NumLockAlert } from "../feedback/NumLockAlert";

// ❌ Package alias
import { NumLockAlert } from "@ui-mui/feedback/NumLockAlert";
```

## Component Categories

### form/ - Form Controls
```typescript
import { Button, TextField, Select, Checkbox, Radio, Switch, FormControl, MenuItem } from '@connected-repo/ui-mui/form/*'
```

### layout/ - Layout
```typescript
import { Box, Stack, Grid, Container, Paper, Card, Divider } from '@connected-repo/ui-mui/layout/*'
```

### feedback/ - Feedback
```typescript
import { Alert, CircularProgress, Dialog, Snackbar, Skeleton } from '@connected-repo/ui-mui/feedback/*'
```

### data-display/ - Data
```typescript
import { Typography, Table, List, Chip, Avatar, Badge, Tooltip } from '@connected-repo/ui-mui/data-display/*'
```

### components/ - Custom
```typescript
import { ContentCard, ErrorAlert, SuccessAlert, LoadingSpinner, PrimaryButton, SecondaryButton } from '@connected-repo/ui-mui/components/*'
```

## RHF Components

**All RHF components**: Responsive margins, full width, iOS-friendly font sizes, error handling

```typescript
import { useRhfForm, RhfFormProvider, RhfTextField, RhfCheckbox, RhfSwitch, RhfSelect, RhfRadio, RhfSubmitButton } from '@connected-repo/ui-mui/rhf-form/*'
```

**Example**:
```typescript
const { formMethods, RhfFormProvider } = useRhfForm({
  onSubmit: async (data) => { /* submit */ },
  formConfig: { resolver: zodResolver(schema) }
})

return (
  <RhfFormProvider>
    <RhfTextField name="email" label="Email" type="email" />
    <RhfSelect name="country" label="Country" options={[{ value: 'us', label: 'US' }]} />
    <RhfCheckbox name="terms" label="I agree" />
    <RhfSubmitButton />
  </RhfFormProvider>
)
```

**Base Styling**:
- Margins: 16px mobile, 20px desktop (fields); 12px mobile, 16px desktop (checkboxes)
- Full width by default
- Font size: 16px mobile (prevents iOS zoom), 14px desktop
- Override with `sx` prop

## Theme

```typescript
import { ThemeProvider } from '@connected-repo/ui-mui/theme/ThemeProvider'
```

### Design Style: Glassmorphism/Neo-minimalist "Airy Compliance"

**Aesthetic Approach**:
- Premium wellness space aesthetic (not medical/clinical)
- Glassmorphism effects applied selectively for depth and impact
- High border radii for modern, friendly feel
- Soft gradients over flat colors
- Generous spacing and "airy" layouts

**Colors**:
- Primary: Deep Navy (#1A1C2E) - primary buttons with white text
- Secondary: Soft Tint (#E0F2FE) - secondary buttons with primary-colored text
- Success: Sage Green (#4F6F52)
- Error: Muted Salmon (#FEE2E2) - soft error states, not harsh red
- Warning: Soft yellow tints
- Info: Light blue tints

**Spacing**: 8px base unit (generous spacing for airy feel)

**Border Radius**: 
- 32px for cards/buttons (Neo-minimalist style)
- 100px for chips and smaller components

**Shadows**: Soft Depth - `box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05)` (avoid harsh shadows)

**Backgrounds**:
- Semi-transparent papers: `rgba(255, 255, 255, 0.8)` for glassmorphism
- Apply `backdrop-filter: blur(10px)` where glass effect enhances UX
- Subtle gradients for page backgrounds

**Component Defaults**:
- Buttons: 56px min height ("one-thumb"), soft shadows, 32px border radius
- TextFields: Outlined, small, 32px border radius
- Cards: 32px border radius, soft depth shadows, hover lift effect
- Smooth transitions: 200-300ms ease-in-out

## Design Principles (CRITICAL)

**Beautiful, Smooth, Delightful**: Tasteful colors, generous spacing, clear typography, smooth transitions, immediate feedback

**When to Apply Glassmorphism** (selective, not everywhere):
- Hero sections, feature cards, modals - places that benefit from depth
- Use semi-transparent backgrounds with backdrop blur
- Don't overdo it - apply where it enhances UX

```tsx
// Glassmorphism example for feature cards
<Box sx={{
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '32px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
}} />
```

**Color Usage**:
```tsx
<Box sx={{
  bgcolor: 'background.paper',  // Semi-transparent for glass effect
  color: 'text.primary',
  borderColor: 'divider',
}} />
```

**Spacing** (theme.spacing = 8px, use generously):
```tsx
sx={{ p: 2, mb: 3, gap: 1.5 }}  // 16px, 24px, 12px
```

**Transitions** (200-300ms smooth):
```tsx
sx={{
  transition: 'all 0.2s ease-in-out',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
}}
```

**Typography** (high contrast, readable):
```tsx
<Typography variant="h5" fontWeight={600} lineHeight={1.7} color="text.primary" />
```

**Border Radius** (Neo-minimalist):
```tsx
sx={{ borderRadius: '32px' }}  // Cards, buttons
sx={{ borderRadius: '100px' }} // Chips, pills
```

**Loading**: Use skeleton > spinner
```tsx
{isLoading ? <Skeleton variant="rectangular" height={200} /> : <Content />}
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
<Button sx={{ minHeight: 44, padding: { xs: '12px 24px', md: '8px 16px' } }} />
```

**Responsive Components**:
```tsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4}>

<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} />

const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
```

## Adding Components

**MUI Re-export**:
```typescript
// src/form/DatePicker.tsx
export { default as DatePicker, type DatePickerProps } from "@mui/x-date-pickers/DatePicker"
```

**Custom Component**:
```typescript
import type { BoxProps } from "@mui/material/Box"
import Box from "@mui/material/Box"

export interface MyComponentProps extends BoxProps { title: string }

export const MyComponent = ({ title, children, ...props }: MyComponentProps) => (
  <Box {...props}>
    <h3>{title}</h3>
    {children}
  </Box>
)
```

Rebuild: `yarn build`

## Styling

**sx Prop**:
```tsx
<Box sx={{
  p: 2,                    // Padding: 16px
  bgcolor: 'background.paper', // Semi-transparent for glassmorphism
  backdropFilter: 'blur(10px)', // Apply where glass effect desired
  borderRadius: '32px',    // Neo-minimalist high radius
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)', // Soft depth
  transition: 'all 0.2s ease-in-out',
  '&:hover': { 
    transform: 'translateY(-2px)',
    boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.08)'
  }
}} />
```

**Theme Spacing**: `p: 1` (8px), `p: 2` (16px), `p: 3` (24px) - use generously
**Theme Colors**: `primary.main` (#1A1C2E), `secondary.main` (#E0F2FE), `success.main` (#4F6F52), `error.main` (#FEE2E2)
**Border Radius**: Use `'32px'` string for main components, `'100px'` for chips/pills

## Peer Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@mui/material": "^7.3.4",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

## Bundle Size
```typescript
// ✅ Small: ~5KB
import { Button } from '@connected-repo/ui-mui/form/Button'

// ❌ Large: ~500KB (if barrel exports existed)
import { Button } from '@connected-repo/ui-mui'
```

## Best Practices
1. ✅ Direct imports from category/component paths
2. ✅ Export types alongside components
3. ✅ Use theme spacing/colors (not hardcoded)
4. ✅ Extend MUI props for custom components
5. ✅ Smooth transitions (200-300ms ease-in-out)
6. ✅ Generous spacing (airy layouts)
7. ✅ High border radii (32px cards/buttons, 100px chips)
8. ✅ Glassmorphism where applicable (selective, not everywhere)
9. ✅ Soft depth shadows (avoid harsh shadows)
10. ✅ Responsive (xs, sm, md, lg)
11. ✅ Touch targets 44x44px min (56px for buttons)
12. ❌ NO package root imports
13. ❌ NO inline styles when sx available
14. ❌ NO overdone glass effects (apply selectively)
