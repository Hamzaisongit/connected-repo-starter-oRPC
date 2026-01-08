# Comprehensive UI Refactoring Plan: Extract Common Styling to @packages/ui-mui

## Executive Summary
This plan outlines a systematic refactoring of all frontend pages to extract common styling patterns into standardized, reusable components in `@packages/ui-mui`. The goal is to eliminate custom styling at the component usage level, ensure consistent theming across light/dark modes, and improve maintainability through standardized component APIs.

## Core Principles
1. **Zero Custom Styling at Usage**: All styling must be encapsulated in reusable components
2. **Theme-Driven**: All colors, spacing, and visual properties from MUI theme
3. **Responsive First**: Seamless desktop/tablet/mobile experience
4. **Light/Dark Mode Support**: Automatic theme adaptation using MUI theme
5. **MUI Native Components**: Prefer native MUI form components over custom implementations
6. **CSS Transitions**: Use CSS transitions where possible, framer-motion only for complex animations

## Pages Overview & Analysis

### 1. Auth Module
- **Login.page.tsx**: Authentication form with gradient background, feature highlights, error alerts

### 2. Core Pages
- **Welcome.page.tsx**: Onboarding slides with gradient background and progress indicators
- **Home.page.tsx**: Dashboard with progress tracking, supplement cards, compliance calendar
- **Profile.page.tsx**: User settings with account details, theme toggle, danger zone
- **Stats.page.tsx**: Progress visualization with streaks, compliance stats, wellness heatmap

### 3. User-Stack Module
- **UserStack.page.tsx**: Gallery view of supplements with filters and floating action button
- **CreateUserStack.page.tsx**: Multi-step form with photo assist and day/time selection
- **EditUserStack.page.tsx**: Same as create with pre-populated data
- **UserStackDetail.page.tsx**: Detailed view with intake logs and management actions

## Identified Common Patterns

### Typography Patterns
- **Page Headers**: Playfair Display serif titles with subtitle (1.75rem/0.875rem)
- **Feature Items**: Icon + text combinations for feature lists
- **Info Rows**: Icon + label + value display patterns

### Layout Patterns
- **Page Containers**: Centered content with bottom padding for nav clearance
- **Glass Cards**: Semi-transparent cards with backdrop blur (32px radius)
- **Info Pills**: Side-by-side info display containers
- **Empty States**: Centered icon + title + description + CTA button

### Interactive Patterns
- **Circular Buttons**: 40px-96px circular buttons with themed backgrounds
- **Action Rows**: Clickable rows with icon, title, subtitle (settings pattern)
- **Day Selectors**: Circular day buttons with glow selection states
- **Status Badges**: Circular indicators with status-based colors

### Card Patterns
- **Supplement Cards**: Compact 3-line cards with thumbnail and action button
- **Stack Gallery Cards**: Glass cards with overlapping circular icons
- **Hero Cards**: Prominent cards with centered content and metrics

### Background Patterns
- **Gradient Backgrounds**: Linear gradients for page backgrounds
- **Radial Glows**: Soft radial gradients with blur effects

## Component Architecture Plan

### Phase 1: Foundation Components (Week 1)

#### 1.1 Typography Components
**Location**: `@packages/ui-mui/src/components/typography/`

**PageHeader Component**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonProps?: IconButtonProps;
}
```

**FeatureItem Component**
```typescript
interface FeatureItemProps {
  icon: string;
  text: string;
  iconSize?: 'small' | 'medium' | 'large';
}
```

**InfoRow Component**
```typescript
interface InfoRowProps {
  icon?: ReactNode;
  label: string;
  value: string | ReactNode;
  variant?: 'default' | 'compact' | 'highlighted';
}
```

#### 1.2 Layout Components
**Location**: `@packages/ui-mui/src/components/layout/`

**PageContainer Component**
```typescript
interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'gradient' | 'radialGlow';
  enableBottomPadding?: boolean;
}
```

**GlassCard Component**
```typescript
interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}
```

**InfoPill Component**
```typescript
interface InfoPillProps {
  label: string;
  value: string | ReactNode;
  variant?: 'default' | 'compact';
}
```

### Phase 2: Interactive Components (Week 2)

#### 2.1 Button Components
**Location**: `@packages/ui-mui/src/components/buttons/`

**CircularButton Component**
```typescript
interface CircularButtonProps {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'filled' | 'outlined' | 'ghost';
  themeColor?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}
```

**FloatingActionButton Component**
```typescript
interface FloatingActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'medium' | 'large';
}
```

#### 2.2 Selector Components
**Location**: `@packages/ui-mui/src/components/selectors/`

**DaySelector Component**
```typescript
interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  variant?: 'default' | 'compact';
}
```

**StatusBadge Component**
```typescript
interface StatusBadgeProps {
  status: 'taken' | 'overdue' | 'pending' | 'missed';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}
```

### Phase 3: Card Components (Week 3)

#### 3.1 Content Cards
**Location**: `@packages/ui-mui/src/components/cards/`

**SupplementCard Component**
```typescript
interface SupplementCardProps {
  supplement: TodaysPlanSupplement;
  onLogTaken: (id: string, time: string) => void;
  onRevert?: (id: string, time: string) => void;
  onCardClick?: (id: string) => void;
  isLogging?: boolean;
}
```

**StackGalleryCard Component**
```typescript
interface StackGalleryCardProps {
  stack: UserStack;
  onClick: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}
```

**HeroCard Component**
```typescript
interface HeroCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'streak' | 'metric';
}
```

#### 3.2 Action Components
**Location**: `@packages/ui-mui/src/components/actions/`

**ActionRow Component**
```typescript
interface ActionRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailingElement?: ReactNode;
  variant?: 'default' | 'danger';
}
```

### Phase 4: Specialized Components (Week 4)

#### 4.1 Form Components
**Location**: `@packages/ui-mui/src/components/forms/`

**PhotoAssistCard Component**
```typescript
interface PhotoAssistCardProps {
  onClick?: () => void;
}
```

**FormSection Component**
```typescript
interface FormSectionProps {
  title?: string;
  children: ReactNode;
  variant?: 'card' | 'inline';
}
```

#### 4.2 Data Display Components
**Location**: `@packages/ui-mui/src/components/data-display/`

**ProgressBar Component**
```typescript
interface ProgressBarProps {
  value: number;
  maxValue?: number;
  variant?: 'linear' | 'circular';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}
```

**WellnessHeatmap Component**
```typescript
interface WellnessHeatmapProps {
  data: DailyCompliance[];
  month?: string;
  year?: number;
}
```

### Phase 5: Animation & Motion (Week 5)

#### 5.1 Motion Components
**Location**: `@packages/ui-mui/src/components/motion/`

**FadeIn Component**
```typescript
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}
```

**HoverLift Component**
```typescript
interface HoverLiftProps {
  children: ReactNode;
  lift?: number;
  scale?: number;
}
```

## Implementation Strategy

### Page-by-Page Refactoring Order

1. **Week 1**: Foundation Setup
   - Create all base components (PageHeader, GlassCard, etc.)
   - Update Login.page.tsx (simplest page)

2. **Week 2**: Authentication & Welcome Flow
   - Update Welcome.page.tsx
   - Update remaining auth-related components

3. **Week 3**: Core Dashboard Pages
   - Update Home.page.tsx (most complex)
   - Update Profile.page.tsx

4. **Week 4**: Stats & Analytics
   - Update Stats.page.tsx
   - Create specialized data visualization components

5. **Week 5**: User Stack Management
   - Update all user-stack pages (Create, Edit, Detail, List)
   - Polish and optimization

### Implementation Guidelines

#### Component API Design
- **Props Interface**: Comprehensive TypeScript interfaces for all props
- **Default Values**: Sensible defaults for optional props
- **Theme Integration**: All colors, spacing, and responsive values from theme
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

#### Responsive Design
- **Breakpoint System**: xs, sm, md, lg, xl breakpoints
- **Mobile First**: Design for mobile, enhance for larger screens
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Text Scaling**: Responsive font sizes with proper line heights

#### Theming Strategy
- **Color Palette**: Use semantic color names (primary, success, warning, error)
- **Dark Mode**: Automatic adaptation using theme.palette.mode
- **Custom Properties**: Leverage theme.spacing, theme.shape, theme.transitions
- **No Hardcoded Colors**: All colors must come from theme

#### Animation Strategy
- **CSS Transitions**: Default for hover, focus, active states
- **Framer Motion**: Only for complex page transitions, staggered animations
- **Performance**: GPU-accelerated transforms, minimal repaints
- **Reduced Motion**: Respect user preferences for reduced motion

#### Form Components Strategy
- **MUI Native**: Prefer TextField, Select, Switch, Checkbox over custom
- **RHF Integration**: Seamless react-hook-form integration
- **Validation**: Consistent error display patterns
- **Accessibility**: Proper labels, error messages, focus management

### Quality Assurance

#### Testing Strategy
- **Component Tests**: Unit tests for all new components
- **Integration Tests**: Page-level integration tests
- **Visual Regression**: Screenshot tests for component variations
- **Accessibility Tests**: Automated a11y testing

#### Documentation
- **JSDoc Comments**: Comprehensive component documentation
- **Storybook Stories**: Interactive component examples
- **Migration Guide**: Step-by-step migration instructions for each page

#### Performance Considerations
- **Bundle Size**: Monitor component bundle impact
- **Tree Shaking**: Ensure unused exports don't bloat bundles
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Code splitting for large component libraries

## Success Metrics

1. **Code Reduction**: 60-70% reduction in custom styling code
2. **Consistency**: 100% theme-driven styling across all components
3. **Maintainability**: Single source of truth for all common patterns
4. **Developer Experience**: Intuitive APIs with comprehensive TypeScript support
5. **User Experience**: Consistent, polished interface across all pages
6. **Performance**: No regression in bundle size or runtime performance

## Risk Mitigation

1. **Incremental Migration**: Page-by-page approach minimizes disruption
2. **Backwards Compatibility**: Maintain existing APIs during transition
3. **Comprehensive Testing**: Extensive test coverage before/after changes
4. **Rollback Plan**: Git branches and revert strategies for each phase

## Timeline & Milestones

- **Week 1**: Foundation components + Login page
- **Week 2**: Welcome & auth flow pages
- **Week 3**: Dashboard pages (Home, Profile)
- **Week 4**: Stats page + data visualization
- **Week 5**: User stack pages + final polish

This plan ensures a systematic, maintainable refactoring that establishes a solid foundation for future UI development while improving code quality and developer experience.</content>
<parameter name="filePath">/Users/krishna404/codeProjects/shipmyapp/heliocoach-app/COMPONENT_REFACTORING_PLAN.md