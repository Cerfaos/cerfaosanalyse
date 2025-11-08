---
name: design-guide
description: Modern UI design principles and standards for building clean, professional interfaces. Use whenever creating UI components, web interfaces, React artifacts, HTML pages, or any visual interface elements including buttons, forms, cards, layouts, dashboards, or applications.
---

# Design Guide

Ensure every UI looks modern and professional by following these core design principles.

## Core Principles

### Clean and Minimal
- Prioritize white space - let content breathe
- Avoid clutter - show only what's necessary
- Use visual hierarchy to guide attention
- Less is more - remove rather than add

### Color Palette
- **Base**: Use grays (e.g., #F9FAFB, #F3F4F6, #E5E7EB, #D1D5DB) and off-whites
- **Text**: Dark grays for body (#374151, #1F2937), mid-grays for secondary text (#6B7280, #9CA3AF)
- **Accent**: Choose ONE accent color and use sparingly for CTAs and key interactive elements
- **NEVER use**: Generic purple/blue gradients, rainbow gradients, or multiple competing accent colors

### Spacing System
Use an 8px grid system for all spacing:
- 8px - tight spacing (icon to label)
- 16px - default component padding and small gaps
- 24px - comfortable spacing between related elements
- 32px - section spacing
- 48px - large section breaks
- 64px - major layout divisions

### Typography
- **Hierarchy**: Clear distinction between headings (h1-h6), body, and labels
- **Minimum size**: 16px for body text (never smaller)
- **Font limit**: Maximum 2 font families (1 for headings, 1 for body is ideal)
- **Line height**: 1.5-1.7 for body text, 1.2-1.3 for headings
- **Font weights**: Use weight variations (400, 500, 600, 700) rather than multiple fonts

### Shadows and Depth
- Use subtle shadows: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` for cards
- Hover states: Slightly larger shadow `0 4px 6px rgba(0,0,0,0.1)`
- AVOID: Heavy drop shadows, multiple stacked shadows, overdone glows

### Borders and Corners
- **Rounded corners**: Use judiciously (4px-8px typically)
- **Not everything** needs to be rounded - rectangular elements are fine
- **Borders**: Use 1px solid borders in light gray (#E5E7EB) when needed
- **Cards**: Choose either clean borders OR subtle shadows, not both

### Interactive States
Always define clear states:
- **Default**: Base appearance
- **Hover**: Subtle change (darker background, shadow, or color shift)
- **Active/Pressed**: Slightly darker or inset appearance
- **Disabled**: Reduced opacity (0.5-0.6) with cursor-not-allowed
- **Focus**: Clear outline for keyboard navigation (2-3px accent color)

### Mobile-First Approach
- Design for mobile screens first, then scale up
- Touch targets minimum 44x44px
- Test layouts at 320px, 768px, 1024px, 1440px
- Stack elements vertically on small screens
- Use responsive units (rem, %, vw/vh) over fixed pixels

## Component Patterns

### Buttons
✅ **Good**:
- Padding: 12px 24px (vertical horizontal)
- Border-radius: 6px
- Subtle shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Hover: Darker background + `0 2px 4px rgba(0,0,0,0.1)`
- Solid colors, no gradients
- Clear text hierarchy (primary = accent, secondary = gray)

❌ **Bad**:
- Gradient backgrounds
- Tiny padding (cramped text)
- No hover state
- Inconsistent sizing across the UI

### Cards
✅ **Good**:
```css
background: white;
border: 1px solid #E5E7EB;
/* OR */
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
border-radius: 8px;
padding: 24px;
```

❌ **Bad**:
- Both heavy border AND heavy shadow
- Inconsistent padding
- Background colors that compete with content

### Forms
✅ **Good**:
- Labels above inputs (16px font, 8px bottom margin)
- Input padding: 12px 16px
- Error states: Red border + red text below (14px)
- Field spacing: 24px between fields
- Clear placeholder text in mid-gray
- Focus state: Accent color border (2px)

❌ **Bad**:
- Tiny unreadable error text
- Labels inside inputs only
- Inconsistent spacing
- No visual feedback on focus/error

### Layouts
✅ **Good**:
- Centered content with max-width (1200px-1440px)
- Consistent margins (use spacing system)
- Clear visual hierarchy
- Balanced negative space

❌ **Bad**:
- Content edge-to-edge with no margins
- Inconsistent spacing throughout
- No clear sections or grouping

## Color Examples

Suggested neutral palette:
```
Backgrounds:
#FFFFFF (white)
#F9FAFB (lightest gray)
#F3F4F6 (light gray)

Borders:
#E5E7EB (light gray border)
#D1D5DB (medium border)

Text:
#1F2937 (dark text)
#374151 (body text)
#6B7280 (secondary text)
#9CA3AF (tertiary text)
```

Accent color examples (choose ONE):
```
Blue: #3B82F6
Green: #10B981
Teal: #14B8A6
Indigo: #6366F1
Rose: #F43F5E
```

## Anti-Patterns to Avoid

1. **Gradient overload**: Especially purple-to-blue gradients everywhere
2. **Tiny text**: Nothing below 14px, prefer 16px minimum for body
3. **Spacing chaos**: Random margins - stick to the 8px system
4. **Color explosion**: Multiple accent colors competing for attention
5. **Shadow madness**: Heavy or multiple layered shadows
6. **Border + shadow combo**: Choose one for depth, not both
7. **All rounded**: Not everything needs border-radius
8. **Missing states**: Buttons and links with no hover/active states

## Quick Checklist

Before finalizing any UI, verify:
- [ ] Consistent spacing using 8px system
- [ ] Only ONE accent color used
- [ ] Body text is 16px or larger
- [ ] Clear hover states on all interactive elements
- [ ] Disabled states are visually obvious
- [ ] Mobile responsive (test at 375px width)
- [ ] Subtle shadows (not overdone)
- [ ] Maximum 2 font families
- [ ] Clean and not cluttered
- [ ] No purple/blue gradients

## Reference Files

For detailed examples of specific components, see:
- `references/component-examples.md` - Complete code examples of buttons, forms, cards, etc.
- `references/color-tokens.md` - Expanded color system with usage guidelines
