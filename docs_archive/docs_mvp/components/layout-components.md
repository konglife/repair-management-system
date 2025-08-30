# Layout Components Documentation

## Overview

This document provides technical documentation for the layout components that form the foundation of the repair management system's user interface. These components are built using React, Shadcn/ui, and follow modern accessibility standards.

## Component Hierarchy

```
MainLayout
├── Sidebar (Desktop)
├── Sheet (Mobile)
│   └── Sidebar
└── Main Content Area
    ├── Header
    └── Page Content
```

## Component Specifications

### MainLayout Component

**File:** `src/components/layout/main-layout.tsx`

#### Props Interface
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}
```

#### State Management
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);
```

#### Key Features
- **Responsive Layout:** Adapts between desktop two-column and mobile single-column
- **State Management:** Controls mobile sidebar visibility
- **Accessibility:** WCAG compliant with proper ARIA labels
- **Performance:** Minimal re-renders with efficient state updates

#### CSS Classes
- **Container:** `flex h-screen bg-gray-100`
- **Desktop Sidebar:** `hidden md:flex md:w-64 md:flex-col`
- **Main Content:** `flex flex-1 flex-col overflow-hidden`

#### Usage Example
```tsx
import { MainLayout } from "~/components/layout/main-layout";

export default function Page() {
  return (
    <MainLayout>
      <div>Your page content here</div>
    </MainLayout>
  );
}
```

### Sidebar Component

**File:** `src/components/layout/sidebar.tsx`

#### Props Interface
```typescript
interface SidebarProps {
  className?: string;
}
```

#### Navigation Items Configuration
```typescript
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Stock", 
    href: "/stock",
    icon: Boxes,
  },
  {
    name: "Sales",
    href: "/sales", 
    icon: ShoppingCart,
  },
  {
    name: "Repairs",
    href: "/repairs",
    icon: Wrench,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
];
```

#### Key Features
- **Active Route Detection:** Uses `usePathname()` for current page highlighting
- **Icon Integration:** Lucide icons with consistent sizing and theming
- **Hover States:** Interactive feedback for navigation items
- **Light Theme:** Clean design with proper contrast ratios

#### Styling Classes
- **Container:** `flex h-full w-64 flex-col bg-white border-r border-gray-200`
- **Header:** `flex h-16 items-center px-6 border-b border-gray-200`
- **Active Link:** `bg-blue-50 text-blue-700 border-r-2 border-blue-600`
- **Inactive Link:** `text-gray-700 hover:bg-gray-100 hover:text-gray-900`

#### Usage Notes
- **Width:** Fixed 256px (16rem) width for consistency
- **Height:** Full height to match parent container
- **Navigation:** Uses Next.js Link for optimal performance
- **Icons:** 20px (h-5 w-5) size with consistent margin

### Header Component

**File:** `src/components/layout/header.tsx`

#### Props Interface
```typescript
interface HeaderProps {
  onMenuClick: () => void;
}
```

#### Key Features
- **Mobile Menu:** Hamburger button visible only on mobile screens
- **User Management:** Clerk UserButton integration
- **Responsive Design:** Adapts layout based on screen size
- **Clean Layout:** Minimal design with proper spacing

#### Component Structure
```tsx
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm" 
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  );
}
```

#### Styling Classes
- **Container:** `flex h-16 items-center justify-between border-b bg-white px-6`
- **Mobile Button:** `md:hidden` (hidden on desktop)
- **Icon Size:** `h-5 w-5` for consistent sizing

#### Dependencies
- **Lucide Icons:** Menu icon for hamburger button
- **Shadcn/ui:** Button component with variants
- **Clerk:** UserButton for authentication

## Mobile Navigation Implementation

### Sheet Component Integration

The mobile navigation uses Shadcn/ui's Sheet component for accessible overlay navigation:

```tsx
<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
  <SheetContent side="left" className="w-64 p-0">
    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
    <SheetDescription className="sr-only">
      Navigate to different sections of the repair management system
    </SheetDescription>
    <Sidebar />
  </SheetContent>
</Sheet>
```

#### Accessibility Features
- **Screen Reader Support:** Hidden title and description for assistive technology
- **Keyboard Navigation:** Full keyboard accessibility
- **Focus Management:** Proper focus trapping within overlay
- **ARIA Labels:** Semantic markup for screen readers

#### Animation Behavior
- **Slide Animation:** Smooth slide-in from left side
- **Backdrop:** Semi-transparent overlay with click-to-close
- **Duration:** 300ms transition for smooth user experience

## Responsive Breakpoints

### Mobile (<768px)
- **Sidebar:** Hidden by default, accessible via hamburger menu
- **Header:** Shows hamburger button and UserButton
- **Layout:** Single-column with overlay navigation
- **Touch Targets:** Minimum 44px for accessibility

### Desktop (≥768px)
- **Sidebar:** Permanently visible with fixed positioning
- **Header:** Minimal layout with UserButton only
- **Layout:** Two-column grid system
- **Hover States:** Enhanced interaction feedback

## Authentication Integration

### Route Protection Pattern

Layout components integrate with authentication through the route group layout:

```tsx
// src/app/(main)/layout.tsx
export default function RouteGroupMainLayout({ children }: RouteGroupMainLayoutProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <LoadingState />;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
```

### User Management Features
- **Profile Access:** Clerk UserButton provides profile management
- **Logout Functionality:** Integrated sign-out with proper cleanup
- **Loading States:** Graceful handling during authentication checks

## Performance Optimizations

### Component Efficiency
- **Minimal Re-renders:** Efficient state management with useState
- **Icon Optimization:** Tree-shaken Lucide icon imports
- **CSS Classes:** Tailwind with purged unused styles
- **Code Splitting:** Lazy loading of non-critical components

### Bundle Size Considerations
- **Shadcn/ui:** Only imports used components
- **Icons:** Individual icon imports to minimize bundle
- **Dependencies:** Minimal external dependencies

## Testing Guidelines

### Component Testing
```typescript
// Example test structure
describe('MainLayout', () => {
  it('renders sidebar on desktop', () => {
    render(<MainLayout><div>Content</div></MainLayout>);
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('shows hamburger menu on mobile', () => {
    mockMobile();
    render(<MainLayout><div>Content</div></MainLayout>);
    expect(screen.getByRole('button', { name: /menu/i })).toBeVisible();
  });
});
```

### Accessibility Testing
- **Screen Reader Testing:** NVDA, JAWS, VoiceOver compatibility
- **Keyboard Navigation:** Tab order and focus management
- **Color Contrast:** WCAG AA compliance verification
- **Touch Targets:** Minimum size requirements

## Maintenance Guidelines

### Code Standards
- **TypeScript:** Strict typing for all props and state
- **ESLint:** Zero warnings policy for layout components
- **Prettier:** Consistent code formatting
- **Comments:** Document complex logic and accessibility features

### Component Updates
- **Breaking Changes:** Maintain backward compatibility when possible
- **Deprecation:** Provide clear migration paths for updates
- **Testing:** Comprehensive test coverage for any changes
- **Documentation:** Update docs for any API changes

## Troubleshooting

### Common Issues

#### Mobile Navigation Not Working
- **Check:** Sheet component prop binding
- **Verify:** State management for `sidebarOpen`
- **Ensure:** Proper event handler binding

#### Active Route Not Highlighting
- **Check:** `usePathname()` hook implementation
- **Verify:** Route matching logic
- **Ensure:** Proper className conditional logic

#### Accessibility Warnings
- **Check:** SheetTitle and SheetDescription presence
- **Verify:** ARIA labels and semantic markup
- **Ensure:** Proper focus management

### Performance Issues
- **Monitor:** Component re-render frequency
- **Check:** State update efficiency
- **Verify:** Icon import optimization
- **Ensure:** CSS class optimization

## Future Enhancements

### Planned Features
- **Theme Toggle:** Dark mode support
- **Breadcrumb Navigation:** Hierarchical navigation
- **Search Integration:** Global search in header
- **Notification System:** Toast notifications

### Scalability Considerations
- **Component Composition:** Modular design for extensions
- **Theme System:** CSS custom properties for theming
- **Animation Library:** Enhanced micro-interactions
- **Performance Monitoring:** Runtime performance tracking