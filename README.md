# Work Order Schedule Timeline

An interactive timeline component for managing work orders across multiple work centers in a manufacturing ERP system. Built with Angular 17+ and designed for optimal user experience.

## Features

- **Interactive Timeline Grid**: Visualize work orders across multiple work centers with horizontal scrolling
- **Multiple Zoom Levels**: Switch between Day, Week, and Month views with intelligent column scaling
- **Click-to-Create**: Click on empty timeline areas to create new work orders with "Click to add dates" tooltip
- **Edit & Delete**: Manage existing work orders via three-dot action menu
- **Overlap Detection**: Prevents scheduling conflicts on the same work center
- **Status Management**: Track work orders with 4 status types (Open, In Progress, Complete, Blocked)
- **Vertical Grid Lines**: Clean visual separation for date columns
- **Current Day Indicator**: Visual marker showing today's date on the timeline (zoom-aware positioning)
- **Responsive Design**: Horizontal scrolling for timeline, fixed left panel for work centers
- **Work Order Tooltips**: Hover over work order bars to see detailed information (name, status, date range)
- **"Today" Button**: Quick navigation to scroll timeline and center on current day (works across all zoom levels)
- **Infinite Horizontal Scroll**: Timeline dynamically loads more date columns as you scroll

## Tech Stack

- **Angular 17+** with standalone components
- **TypeScript** (strict mode)
- **SCSS** for styling
- **Reactive Forms** for form management
- **RxJS** for reactive state management
- **HttpClient** for data loading
- **@ng-select/ng-select** for custom dropdowns
- **@ng-bootstrap/ng-bootstrap** (ngb-datepicker, ngb-tooltip) for date picking and tooltips

### Implementation Notes

- **Dropdowns**: ng-select library used for timescale and status dropdowns with custom styling to match design specifications
- **Date Inputs**: ngb-datepicker from ng-bootstrap provides calendar functionality with custom styling
- **Tooltips**: ngb-tooltip displays "Click to add dates" on empty cells and work order details (name, status, dates) on work order bars
- **Zoom Levels**: Day view shows individual days, Week view shows 7-day periods, Month view shows monthly periods with intelligent column scaling
- **Position Calculations**: All timeline positioning is zoom-aware, ensuring accurate placement of work orders and current day indicator across all zoom levels
- **Change Detection**: OnPush strategy used throughout for optimal performance
- **Infinite Scroll**: Timeline dynamically expands by 30 columns when scrolling near the end
- **Navigation**: "Today" button centers the timeline on the current day with zoom-aware positioning

## Project Structure

```
src/app/
├── core/
│   ├── models/           # TypeScript interfaces and types
│   └── services/         # Business logic services
│       ├── schedule.service.ts      # Work order/center data management
│       ├── timeline.service.ts      # Timeline calculations & zoom
│       └── validation.service.ts    # Overlap detection
├── features/
│   └── timeline/
│       ├── timeline-shell/          # Main container component
│       ├── timeline-grid/           # Scrollable grid container
│       ├── timeline-row/            # Individual work center row
│       ├── timeline-bar/            # Work order bar component
│       ├── timeline-header/         # Date header component
│       └── schedule-panel/          # Create/Edit side panel
└── assets/
    └── sample-data.json             # 700 work orders across 7 centers
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Navigate to
http://localhost:4200
```

### Build

```bash
# Production build
ng build --configuration production
```

## Sample Data

The application loads 700 work orders across 7 work centers from `src/assets/sample-data.json`:

- **Work Centers**: 7 manufacturing work centers (Genesis Hardware, Rodriques Electrics, etc.)
- **Work Orders**: 100 orders per center, spanning 2025-2027
- **Status Distribution**: All 4 statuses evenly distributed (Open, In Progress, Complete, Blocked)
- **No Overlaps**: Orders are scheduled sequentially within each work center

## Key Implementation Details

### Timeline Calculations

The `TimelineService` acts as a pure mathematical engine:
- Converts dates to pixel positions based on zoom level
- Calculates work order bar widths dynamically
- Manages visible date ranges for each zoom level
- Provides Observable streams for reactive updates

### Custom Dropdowns

Both the timescale and status dropdowns are custom implementations:
- Built with Angular components (not native `<select>`)
- Match Sketch design specifications exactly
- Include click-outside handlers for proper UX
- Support keyboard navigation

### Overlap Detection

The `ValidationService` prevents scheduling conflicts:
- Checks for date range overlaps within the same work center
- Excludes the current work order when editing
- Provides detailed error messages with conflicting order names

### Change Detection

All components use `OnPush` change detection strategy for optimal performance:
- Explicit `ChangeDetectorRef.markForCheck()` calls
- `trackBy` functions for `*ngFor` loops
- Observable streams with async pipe

## Design System

- **Font**: Circular Std (loaded from CDN)
- **Colors**: Custom color palette matching Sketch designs
- **Status Colors**:
  - Open: Cyan (rgba(228, 253, 255, 1))
  - In Progress: Yellow (rgba(255, 252, 241, 1))
  - Complete: Green (rgba(248, 255, 243, 1))
  - Blocked: Purple (rgba(237, 238, 255, 1))

## Testing

A comprehensive testing guide is available in `docs/TESTING_GUIDE.md` covering:
- Timeline scrolling and zoom level switching
- Click-to-create workflow
- Edit and delete operations
- Overlap detection scenarios
- Form validation

## Future Enhancements

- localStorage persistence for work orders
- Drag-and-drop to reschedule work orders
- Infinite horizontal scroll (dynamic date loading)
- "Jump to Today" button
- Keyboard shortcuts
- Export to PDF/Excel
- Multi-select and bulk operations

## License

This project is part of a technical assessment for Naologic.

## Author

Michael Ilerioluwa Adeniyi
