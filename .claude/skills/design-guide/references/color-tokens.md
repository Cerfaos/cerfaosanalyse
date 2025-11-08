# Color System & Tokens

Comprehensive color palette and usage guidelines for consistent, professional UIs.

## Neutral Palette

### Background Colors
```css
--bg-white: #FFFFFF;
--bg-gray-50: #F9FAFB;
--bg-gray-100: #F3F4F6;
--bg-gray-200: #E5E7EB;
```

**Usage**:
- `--bg-white`: Main content backgrounds, cards
- `--bg-gray-50`: Page backgrounds, subtle highlights
- `--bg-gray-100`: Hover states, disabled backgrounds
- `--bg-gray-200`: Borders, dividers

### Text Colors
```css
--text-dark: #1F2937;
--text-body: #374151;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--text-disabled: #D1D5DB;
```

**Usage**:
- `--text-dark`: Headings (h1-h3), important labels
- `--text-body`: Primary body text (16px+)
- `--text-secondary`: Subheadings, captions, helper text
- `--text-tertiary`: Placeholder text, timestamps
- `--text-disabled`: Disabled states

### Border Colors
```css
--border-light: #F3F4F6;
--border-base: #E5E7EB;
--border-medium: #D1D5DB;
--border-dark: #9CA3AF;
```

**Usage**:
- `--border-light`: Very subtle dividers
- `--border-base`: Default borders (most common)
- `--border-medium`: Input borders, emphasis
- `--border-dark`: Active/hover borders

## Accent Color Options

Choose ONE accent color for your entire UI. Use sparingly for:
- Primary action buttons
- Links
- Focus states
- Key interactive elements

### Blue (Most Common)
```css
--accent-50: #EFF6FF;
--accent-100: #DBEAFE;
--accent-500: #3B82F6;  /* Main accent */
--accent-600: #2563EB;  /* Hover */
--accent-700: #1D4ED8;  /* Active */
```

**Best for**: Professional apps, dashboards, enterprise software

### Green (Success/Growth)
```css
--accent-50: #ECFDF5;
--accent-100: #D1FAE5;
--accent-500: #10B981;  /* Main accent */
--accent-600: #059669;  /* Hover */
--accent-700: #047857;  /* Active */
```

**Best for**: Health apps, financial growth, environmental themes

### Teal (Modern/Fresh)
```css
--accent-50: #F0FDFA;
--accent-100: #CCFBF1;
--accent-500: #14B8A6;  /* Main accent */
--accent-600: #0D9488;  /* Hover */
--accent-700: #0F766E;  /* Active */
```

**Best for**: Creative tools, modern SaaS, tech products

### Indigo (Professional/Trust)
```css
--accent-50: #EEF2FF;
--accent-100: #E0E7FF;
--accent-500: #6366F1;  /* Main accent */
--accent-600: #4F46E5;  /* Hover */
--accent-700: #4338CA;  /* Active */
```

**Best for**: Enterprise software, professional services

### Rose (Energy/Bold)
```css
--accent-50: #FFF1F2;
--accent-100: #FFE4E6;
--accent-500: #F43F5E;  /* Main accent */
--accent-600: #E11D48;  /* Hover */
--accent-700: #BE123C;  /* Active */
```

**Best for**: Creative agencies, bold brands, lifestyle apps

## Semantic Colors

Use these for specific feedback states (separate from accent color).

### Success
```css
--success-bg: #ECFDF5;
--success-border: #A7F3D0;
--success-text: #065F46;
```

### Warning
```css
--warning-bg: #FFFBEB;
--warning-border: #FDE68A;
--warning-text: #92400E;
```

### Error
```css
--error-bg: #FEF2F2;
--error-border: #FECACA;
--error-text: #991B1B;
```

### Info
```css
--info-bg: #EFF6FF;
--info-border: #BFDBFE;
--info-text: #1E40AF;
```

## Usage Patterns

### Button States
```css
.btn-primary {
  background: var(--accent-500);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-600);
}

.btn-primary:active {
  background: var(--accent-700);
}

.btn-secondary {
  background: white;
  color: var(--text-body);
  border: 1px solid var(--border-base);
}

.btn-secondary:hover {
  background: var(--bg-gray-50);
  border-color: var(--border-medium);
}
```

### Form Inputs
```css
.input {
  background: white;
  color: var(--text-dark);
  border: 1px solid var(--border-medium);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:focus {
  border-color: var(--accent-500);
  /* Add subtle glow using accent-100 */
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-500) 10%, transparent);
}

.input:disabled {
  background: var(--bg-gray-100);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

### Links
```css
.link {
  color: var(--accent-500);
  text-decoration: none;
}

.link:hover {
  color: var(--accent-700);
  text-decoration: underline;
}

.link:visited {
  color: var(--accent-600);
}
```

## Contrast Ratios

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Verified combinations**:
- ✅ `--text-dark` on `white` (14.8:1)
- ✅ `--text-body` on `white` (10.4:1)
- ✅ `--text-secondary` on `white` (4.6:1)
- ✅ `white` on `--accent-500` (varies, typically 4.5:1+)
- ⚠️ `--text-tertiary` on `white` (3.3:1) - Use only for non-essential text

## CSS Custom Properties Setup

Add this to your CSS root:

```css
:root {
  /* Backgrounds */
  --bg-white: #FFFFFF;
  --bg-gray-50: #F9FAFB;
  --bg-gray-100: #F3F4F6;
  --bg-gray-200: #E5E7EB;
  
  /* Text */
  --text-dark: #1F2937;
  --text-body: #374151;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-disabled: #D1D5DB;
  
  /* Borders */
  --border-light: #F3F4F6;
  --border-base: #E5E7EB;
  --border-medium: #D1D5DB;
  --border-dark: #9CA3AF;
  
  /* Accent (choose one) */
  --accent-50: #EFF6FF;
  --accent-100: #DBEAFE;
  --accent-500: #3B82F6;
  --accent-600: #2563EB;
  --accent-700: #1D4ED8;
  
  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

## Dark Mode Considerations

If implementing dark mode, invert the palette:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-white: #1F2937;
    --bg-gray-50: #374151;
    --bg-gray-100: #4B5563;
    --bg-gray-200: #6B7280;
    
    --text-dark: #F9FAFB;
    --text-body: #E5E7EB;
    --text-secondary: #D1D5DB;
    --text-tertiary: #9CA3AF;
  }
}
```

## Anti-Patterns

❌ **Don't do this**:
- Using multiple accent colors (blue buttons, green links, purple badges)
- Random colors not from the system (#FF00FF, #ABC123)
- Purple-to-blue gradients: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
- Low contrast combinations (light gray text on white)

✅ **Do this instead**:
- Stick to ONE accent color throughout
- Use the defined neutral palette
- Solid colors only (no gradients)
- Verify contrast ratios
