# Component Examples

Complete code examples demonstrating modern, professional UI components.

## Buttons

### Primary Button
```html
<button class="btn-primary">
  Save Changes
</button>

<style>
.btn-primary {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: #3B82F6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  background: #1D4ED8;
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### Secondary Button
```html
<button class="btn-secondary">
  Cancel
</button>

<style>
.btn-secondary {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-secondary:active {
  background: #F3F4F6;
}
</style>
```

## Cards

### Basic Card
```html
<div class="card">
  <h3 class="card-title">Card Title</h3>
  <p class="card-body">Card content goes here with proper spacing and typography.</p>
  <button class="btn-primary">Action</button>
</div>

<style>
.card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.card-body {
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}
</style>
```

### Card with Shadow (Alternative)
```html
<div class="card-shadow">
  <h3 class="card-title">Featured Item</h3>
  <p class="card-body">This card uses a subtle shadow instead of a border.</p>
</div>

<style>
.card-shadow {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}

.card-shadow:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

## Forms

### Input Field
```html
<div class="form-group">
  <label for="email" class="form-label">Email Address</label>
  <input 
    type="email" 
    id="email" 
    class="form-input" 
    placeholder="you@example.com"
  />
</div>

<style>
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  color: #1F2937;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
```

### Error State
```html
<div class="form-group">
  <label for="password" class="form-label">Password</label>
  <input 
    type="password" 
    id="password" 
    class="form-input form-input-error" 
    placeholder="Enter password"
  />
  <span class="form-error">Password must be at least 8 characters</span>
</div>

<style>
.form-input-error {
  border-color: #EF4444;
}

.form-input-error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #EF4444;
}
</style>
```

## Layouts

### Centered Container
```html
<div class="container">
  <div class="content">
    <!-- Your content here -->
  </div>
</div>

<style>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
</style>
```

### Grid Layout
```html
<div class="grid">
  <div class="grid-item">Item 1</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
</div>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
```

## Navigation

### Simple Nav Bar
```html
<nav class="navbar">
  <div class="navbar-container">
    <div class="navbar-brand">Logo</div>
    <div class="navbar-links">
      <a href="#" class="nav-link">Home</a>
      <a href="#" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    </div>
  </div>
</nav>

<style>
.navbar {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 16px 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.navbar-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: 16px;
  color: #6B7280;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #1F2937;
}
</style>
```

## Alerts/Messages

### Success Alert
```html
<div class="alert alert-success">
  <strong>Success!</strong> Your changes have been saved.
</div>

<style>
.alert {
  padding: 16px;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 16px;
}

.alert-success {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.alert strong {
  font-weight: 600;
}
</style>
```

### Error Alert
```html
<div class="alert alert-error">
  <strong>Error!</strong> Something went wrong. Please try again.
</div>

<style>
.alert-error {
  background: #FEF2F2;
  color: #991B1B;
  border: 1px solid #FECACA;
}
</style>
```

## Best Practices Demonstrated

All examples above follow these principles:
- ✅ 8px spacing system (8, 16, 24, 32)
- ✅ 16px minimum text size
- ✅ Subtle shadows where appropriate
- ✅ Clear hover/focus/active states
- ✅ Mobile-first responsive design
- ✅ Consistent color palette from design guide
- ✅ Clean, readable typography
- ✅ No gradients or overdone effects
