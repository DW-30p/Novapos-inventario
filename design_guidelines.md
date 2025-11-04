# Design Guidelines: Inventory Management & Barcode Scanner App

## Design Approach: Material Design System
**Rationale**: Productivity-focused inventory application requiring clear visual feedback, efficient data entry, and strong mobile support for camera scanning. Material Design provides robust patterns for forms, tables, and action-oriented interfaces.

---

## Typography System

**Font Family**: Roboto (via Google Fonts CDN)
- Primary: Roboto (400, 500, 700)
- Monospace: Roboto Mono (for barcodes, SKUs)

**Hierarchy**:
- Page Titles: text-3xl font-bold (Roboto 700)
- Section Headers: text-xl font-medium (Roboto 500)
- Card/Product Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Captions: text-sm font-medium
- Helper Text: text-xs text-gray-600
- Barcode Display: font-mono text-lg tracking-wide

---

## Layout & Spacing System

**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8, mb-12
- Card spacing: gap-4, gap-6
- Form field spacing: space-y-4
- Button padding: px-6 py-3

**Container Structure**:
- Max width: max-w-4xl mx-auto (centered content)
- Mobile padding: px-4
- Desktop padding: px-6
- Consistent vertical rhythm: py-8 for sections

---

## Core Components

### 1. Scanner Interface
- Full-width camera preview container (aspect-ratio-video)
- Floating overlay with scanning guide (centered frame graphic)
- Real-time barcode detection indicator
- Bottom action bar with scan/capture button (large, circular FAB-style)
- Camera controls: flash toggle, camera switch
- Haptic feedback indication on successful scan

### 2. Product Form Card
- Elevated card with shadow (Material elevation-2)
- Form fields in single column layout
- Input groups with floating labels (Material style)
- Required field indicators (asterisk)
- Field order: Name → Barcode (with scan button inline) → Category → Description → Price → Cost → Stock → Min Stock
- Bottom action bar: Cancel + Save buttons
- Inline validation messages below each field

### 3. Product List/Table
- Responsive card layout on mobile, table on desktop
- Search bar (sticky at top): full-width with search icon
- Filter chips row: Category filter, Stock status filter
- Product cards (mobile):
  - Product name (bold)
  - Barcode (monospace, secondary)
  - Price/Stock (flex row)
  - Category badge
  - Edit/Delete action buttons
- Table view (desktop):
  - Sortable columns: Name, Barcode, Category, Price, Stock
  - Row hover states
  - Inline edit icons
  - Selection checkboxes for bulk operations

### 4. Export Panel
- Fixed bottom sheet (mobile) or floating panel (desktop)
- Two prominent action buttons:
  - "Export to Excel" with Excel icon
  - "Export to SQL" with database icon
- Export options toggles (include timestamps, headers)
- Success confirmation toast

### 5. Navigation Header
- App title/logo left-aligned
- Product count badge
- Navigation tabs: Scan | Products | Export
- Hamburger menu (mobile) with sync status indicator

### 6. Empty States
- Centered illustration placeholder
- Primary message: "No products yet"
- Secondary action: "Start scanning" button with camera icon
- Helper text about getting started

---

## Interaction Patterns

**Buttons**:
- Primary actions: Filled buttons (scan, save, export)
- Secondary actions: Outlined buttons (cancel, filter)
- Icon buttons: Edit, delete, camera controls
- FAB: Main scan action (bottom-right, elevated)

**Feedback**:
- Loading states: Linear progress bars for data operations
- Success: Brief toast notifications (bottom)
- Errors: Inline field validation, alert dialogs for critical errors
- Scan success: Visual flash + vibration

**Forms**:
- Auto-focus on first field
- Enter key advances to next field
- Barcode field with inline "Scan" button
- Clear/reset option for each input
- Form persistence (draft saving)

---

## Mobile-First Considerations

**Scanner Priority**: Camera view is primary interaction on mobile
- Full-screen scanner mode option
- Quick-add flow: Scan → Auto-fill barcode → Add details
- Swipe gestures: Swipe card to edit/delete

**Touch Targets**: Minimum 44px height for all interactive elements
**Bottom Navigation**: Primary actions accessible with thumb
**Responsive Breakpoints**:
- Mobile: Single column, stacked cards
- Tablet (md:): Two-column product grid
- Desktop (lg:): Table view, side panels

---

## Data Visualization

**Stock Indicators**:
- Visual badges: In Stock (green), Low Stock (amber), Out of Stock (red)
- Progress bars for stock levels vs. min_stock
- Category color coding with distinct badges

**Stats Dashboard** (above product list):
- Total products count
- Low stock alerts count
- Total inventory value
- Recent scans count (last 24h)
- Cards in 2x2 grid (mobile), 4-column row (desktop)

---

## Accessibility

- ARIA labels on all icon-only buttons
- Keyboard navigation: Tab order follows visual hierarchy
- Focus indicators on all interactive elements
- High contrast text ratios (WCAG AA)
- Screen reader announcements for scan success/errors
- Form error association with aria-describedby

---

## Icons

**Library**: Material Icons (via CDN)
- barcode_scanner, add_a_photo, save, download, upload
- edit, delete, search, filter_list, category
- check_circle, error, inventory, assessment