# AI Prompts Documentation

This document contains the AI prompts used during development and the problem-solving process.

---

## Original Development Prompts

### 🚀 PHASE 1 — Project Scaffold

#### 🟢 Prompt 1 — Create Angular Foundation

We are building a frontend technical test project.

Stack requirements:
- Angular 17+
- Standalone components
- Strict TypeScript
- SCSS
- Reactive Forms
- ng-select
- @ng-bootstrap/ng-bootstrap

Create:
1. Angular 17 project setup structure
2. Core folder with:
   - models/
   - services/
3. features/timeline folder
4. shared folder

Do NOT implement business logic yet.
Only scaffold folder and file structure with minimal placeholder components.
Keep architecture clean and scalable.

This ensures:
- You get structure
- No messy monolith component
- No premature logic

---

### 🚀 PHASE 2 — Data Layer (Deterministic Dataset)

#### 🟢 Prompt 2 — Models + Dataset

Create TypeScript interfaces for:
- WorkCenterDocument
- WorkOrderDocument
- WorkOrderStatus

All documents follow this structure:
```typescript
{
  docId: string;
  docType: string;
  data: {...}
}
```

Then:
1. Create 7 deterministic work centers
2. Create a deterministic generator function that creates 100 work orders per center
3. Guarantee no overlapping dates per work center
4. Spread dates across year 2025
5. No randomness allowed

Put dataset inside a schedule.service.ts file.
Do not implement UI yet.

Now your data layer is clean and controlled.

Commit.

---

### 🚀 PHASE 3 — Timeline Math Engine (CRITICAL)

This is where most candidates fail.

#### 🟢 Prompt 3 — Timeline Service

Create a timeline.service.ts responsible ONLY for:
1. Managing zoom levels: 'day' | 'week' | 'month'
2. Calculating visible date range centered on today
3. Converting date -> pixel position
4. Calculating bar width from start and end dates
5. Calculating current day indicator position

Requirements:
- No UI code
- Pure functions
- Fully typed
- Scalable for large datasets
- Avoid hardcoding magic numbers

Assume:
- Day column width: 80px
- Week column width: 120px
- Month column width: 160px

Keep separation of concerns clean.

This makes Kiro build your most complex layer in isolation.

Commit.

---

### 🚀 PHASE 4 — Static Timeline Grid (No Work Orders Yet)

Now we build layout only.

#### 🟢 Prompt 4 — Timeline Shell Layout

Create timeline-shell.component with layout:
- Left fixed panel for work center names
- Right horizontally scrollable timeline grid
- Sticky header row for dates
- Current day vertical indicator line

Requirements:
- Use CSS Grid or Flexbox
- Left panel must not scroll horizontally
- Right panel scrolls horizontally
- No work order bars yet
- Render static header columns from timeline.service

Focus ONLY on layout and scrolling behavior.
No form logic.
No create/edit logic.

You're building in layers.
This is senior workflow.

Commit.

---

### 🚀 PHASE 5 — Work Order Bars

#### 🟢 Prompt 5 — Render Work Orders

Now integrate work orders into timeline grid.

For each work center row:
- Render its work orders
- Use absolute positioning inside the row
- Calculate left and width using timeline.service
- Render status badge with correct color mapping

Requirements:
- No create/edit logic yet
- No overlap detection yet
- Pure rendering only
- Use ChangeDetectionStrategy.OnPush
- Use trackBy for performance

At this point, your UI will look real.

Commit.

---

### 🚀 PHASE 6 — Click-to-Create Flow

Now interaction.

#### 🟢 Prompt 6 — Detect Click Position

Implement click handling on empty timeline area.

When user clicks:
1. Determine clicked work center row
2. Determine date from x position
3. Emit event to open schedule panel in create mode
4. Pre-fill start date from clicked position
5. Default end date = start date + 7 days

Do NOT implement panel UI yet.
Just emit structured event with required data.

Commit.

---

### 🚀 PHASE 7 — Slide-Out Panel (Reactive Forms)

#### 🟢 Prompt 7 — Schedule Panel

Create schedule-panel.component:

Features:
- Slide-in from right
- Overlay backdrop
- Close on outside click
- Cancel button closes

Form:
- name (required)
- status (ng-select)
- startDate (ngb-datepicker)
- endDate (ngb-datepicker)

Modes:
- 'create'
- 'edit'

Behavior:
- Patch form if edit
- Reset form if create

No overlap validation yet.

Commit.

---

### 🚀 PHASE 8 — Overlap Detection

#### 🟢 Prompt 8 — Validation Logic

Implement overlap detection inside schedule.service.

Rules:
- Only check within same work center
- Exclude current order when editing
- Prevent save if overlap exists
- Return validation error message

Algorithm:
Overlap if:
```
newStart <= existingEnd && newEnd >= existingStart
```

Integrate this into panel submit handler.
Display error message in UI.

This is your logic test moment.

Commit.

---

### 🚀 PHASE 9 — Zoom Switching

#### 🟢 Prompt 9

Implement zoom dropdown:

Options:
- Day
- Week
- Month

When zoom changes:
- Recalculate visible date range
- Recalculate column width
- Re-render bars correctly
- Maintain horizontal scroll center near today

Avoid page reload.
Use reactive pattern.

Commit.

---

### 🚀 PHASE 10 — Polish Phase

Only now ask Kiro:

Refactor code for:
- Strict typing improvements
- Performance improvements
- Clean separation of concerns
- Remove duplication
- Improve SCSS structure

---

---

## Detailed Problem-Solving Process

### Table of Contents

1. [Initial Setup & Architecture](#initial-setup--architecture)
2. [Component Structure Design](#component-structure-design)
3. [Timeline Calculations & Positioning](#timeline-calculations--positioning)
4. [Form Implementation & Validation](#form-implementation--validation)
5. [Styling & Design System](#styling--design-system)
6. [Library Integration Challenges](#library-integration-challenges)
7. [Key Technical Decisions](#key-technical-decisions)

---

## Initial Setup & Architecture

### Problem: How to structure an Angular 17+ application for a timeline component?

**Approach:**
- Used Angular 17 standalone components (no NgModule)
- Organized by feature (timeline) and core (services, models)
- Separated concerns: presentation vs business logic

**Key Decisions:**
1. **Standalone Components**: Chose standalone over module-based for modern Angular best practices
2. **Strict TypeScript**: Enabled strict mode for type safety
3. **SCSS**: Used SCSS for nested styling and variables

**File Structure Created:**
```
src/app/
├── core/
│   ├── models/           # All TypeScript interfaces
│   └── services/         # Business logic (no UI)
├── features/
│   └── timeline/         # Timeline feature components
└── assets/
    └── sample-data.json  # 700 work orders
```

---

## Component Structure Design

### Problem: How to break down a complex timeline into manageable components?

**Initial Analysis:**
- Timeline has multiple concerns: layout, data display, interactions
- Need separation between container logic and presentation
- Must handle horizontal scrolling while keeping left panel fixed

**Component Breakdown:**

1. **timeline-shell** (Smart Component)
   - **Responsibility**: Orchestration and state management
   - **Why**: Coordinates data flow, handles events, manages panel state
   - **Key Features**: 
     - Loads data from ScheduleService
     - Manages zoom level state
     - Opens/closes schedule panel
     - Handles create/edit/delete operations

2. **timeline-grid** (Container Component)
   - **Responsibility**: Scrollable grid container
   - **Why**: Manages the scrollable area and renders rows
   - **Key Features**:
     - Handles horizontal/vertical scrolling
     - Renders timeline-row components
     - Propagates click events upward

3. **timeline-row** (Presentation Component)
   - **Responsibility**: Single work center row
   - **Why**: Encapsulates row-specific logic and rendering
   - **Key Features**:
     - Renders work order bars for one work center
     - Handles click-to-create on empty areas
     - Calculates click position to date

4. **timeline-bar** (Presentation Component)
   - **Responsibility**: Individual work order visualization
   - **Why**: Reusable component for each work order
   - **Key Features**:
     - Displays work order name and status
     - Three-dot menu for actions
     - Dynamic width based on date range

5. **timeline-header** (Presentation Component)
   - **Responsibility**: Date column headers
   - **Why**: Separate component for sticky header behavior
   - **Key Features**:
     - Shows date labels based on zoom level
     - Sticky positioning during scroll

6. **schedule-panel** (Smart Component)
   - **Responsibility**: Create/Edit form
   - **Why**: Complex form logic deserves its own component
   - **Key Features**:
     - Reactive Forms with validation
     - Dual mode (create/edit)
     - Slide-in animation

**Why This Structure?**
- **Separation of Concerns**: Each component has one clear responsibility
- **Reusability**: timeline-bar can be reused for any work order
- **Testability**: Smaller components are easier to test
- **Performance**: OnPush change detection works better with smaller components

---

## Timeline Calculations & Positioning

### Problem: How to convert dates to pixel positions on a timeline?

**Challenge:**
- Work orders have start/end dates (e.g., "2025-01-15" to "2025-01-22")
- Timeline shows columns for each day/week/month
- Need to position bars accurately based on dates

**Solution: TimelineService as Pure Math Engine**

```typescript
// Core calculation: Date to pixel position
dateToPosition(date: Date, visibleStartDate: Date, columnWidth: number): number {
  const daysDifference = this.differenceInDays(date, visibleStartDate);
  return daysDifference * columnWidth;
}
```

**How It Works:**
1. Calculate days between work order start and timeline start
2. Multiply by column width (80px for Day, 120px for Week, 160px for Month)
3. Result is the left position in pixels

**Example:**
- Timeline starts: Jan 1, 2025
- Work order starts: Jan 15, 2025
- Difference: 14 days
- Column width (Day view): 80px
- Position: 14 × 80 = 1120px from left

**Bar Width Calculation:**
```typescript
calculateBarWidth(startDate: Date, endDate: Date, columnWidth: number): number {
  const daysDifference = this.differenceInDays(endDate, startDate);
  return daysDifference * columnWidth;
}
```

**Why This Approach?**
- **Pure Functions**: No side effects, easy to test
- **Observable Streams**: Reactive updates when zoom changes
- **Separation**: Math logic separate from UI components

---

## Form Implementation & Validation

### Problem: How to implement create/edit functionality with proper validation?

**Requirements:**
- All fields required
- End date must be after start date
- No overlapping work orders on same work center
- Single panel for both create and edit modes

**Solution: Reactive Forms with Custom Validators**

**1. Form Structure:**
```typescript
this.form = this.fb.group({
  name: ['', Validators.required],
  workCenterId: ['', Validators.required],
  status: ['open', Validators.required],
  startDate: ['', Validators.required],
  endDate: ['', Validators.required]
}, {
  validators: this.dateRangeValidator  // Cross-field validation
});
```

**2. Date Range Validator:**
```typescript
private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end > start ? null : { dateRange: true };
}
```

**3. Overlap Detection:**
```typescript
// In ValidationService
checkOverlap(workCenterId, startDate, endDate, existingOrders) {
  const conflictingOrders = existingOrders.filter(order => {
    // Only check same work center
    if (order.data.workCenterId !== workCenterId) return false;
    
    // Overlap formula: (start < orderEnd) AND (end > orderStart)
    return start < orderEnd && end > orderStart;
  });
  
  return {
    hasOverlap: conflictingOrders.length > 0,
    conflictingOrders
  };
}
```

**4. Dual Mode (Create/Edit):**
- Track editing state with `editingWorkOrderId`
- Pre-populate form in edit mode
- Change button text dynamically
- Exclude current order from overlap check when editing

**Why This Approach?**
- **Reactive Forms**: Angular best practice for complex forms
- **Cross-Field Validation**: Validates relationships between fields
- **Service-Based Validation**: Business logic separate from UI
- **User Feedback**: Clear error messages with conflicting order names

---

## Styling & Design System

### Problem: How to achieve pixel-perfect design matching Sketch specifications?

**Challenge:**
- Sketch file provided with exact measurements
- Custom font (Circular Std)
- Specific colors, shadows, spacing
- Custom dropdown and status badge designs

**Solution: SCSS with Design Tokens**

**1. Font Loading:**
```html
<!-- In index.html -->
<link rel="stylesheet" href="https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css">
```

**2. Color System:**
```scss
// Status colors from design
.status-badge--open {
  background-color: rgba(228, 253, 255, 1);
  border: 1px solid rgba(206, 251, 255, 1);
  color: rgba(0, 176, 191, 1);
}

.status-badge--in-progress {
  background-color: rgba(214, 216, 255, 1);
  border: 1px solid rgba(210, 215, 255, 1);
  color: rgba(62, 64, 219, 1);
}
```

**3. Layout Measurements:**
- Work centers panel: 382px fixed width
- Schedule panel: 591px slide-in width
- Timeline row height: 60px
- Work order bar height: 38px
- Border radius: 8px for bars, 5px for badges

**4. Shadows:**
```scss
box-shadow: 0 0 0 1px rgba(104, 113, 150, 0.1), 
            0 2.5px 3px -1.5px rgba(200, 207, 233, 1), 
            0 4.5px 5px -1px rgba(216, 220, 235, 1);
```

**Why This Approach?**
- **Exact Measurements**: Inspected Sketch file for precise values
- **SCSS Variables**: Could be extracted for reusability
- **Component Scoping**: Styles scoped to components
- **Design Consistency**: All measurements from single source of truth

---

## Library Integration Challenges

### Problem: How to integrate ng-select and ngb-datepicker while maintaining custom design?

**Initial Challenge:**
- Requirements specify ng-select for dropdowns
- Requirements specify ngb-datepicker for dates
- Default library styles don't match design
- Library CSS overrides custom styles

**Attempted Solutions:**

**Attempt 1: Global Styles with ::ng-deep**
```scss
// In styles.scss
::ng-deep .ng-select .ng-select-container {
  // Custom styles
}
```
**Problem**: Styles not applying due to specificity issues

**Attempt 2: appendTo="body" with panelClass**
```html
<ng-select appendTo="body" panelClass="custom-panel">
```
**Problem**: Dropdown renders outside component, harder to style

**Final Solution: ViewEncapsulation.None**
```typescript
@Component({
  selector: 'app-timeline-shell',
  encapsulation: ViewEncapsulation.None,  // Key change
  // ...
})
```

**Why This Works:**
- Removes Angular's view encapsulation
- Allows component styles to penetrate ng-select's internal elements
- Keeps styles in component SCSS (not global)
- Uses `!important` flags to override library defaults

**Custom SVG Arrow:**
```scss
.ng-arrow {
  border: none !important;
  background-image: url('data:image/svg+xml;utf8,<svg>...</svg>') !important;
}
```

**Date Picker Integration:**
```html
<input 
  ngbDatepicker 
  #datePicker="ngbDatepicker"
  (click)="datePicker.toggle()">
```

**Key Learnings:**
- ViewEncapsulation.None is necessary for deep library customization
- Data URLs work well for inline SVG icons
- NgbDateStruct requires conversion to/from ISO date strings
- `!important` flags needed to override library specificity

---

## Key Technical Decisions

### 1. **Why Observable Streams Instead of Signals?**

**Decision**: Used RxJS BehaviorSubject and Observables

**Reasoning:**
- Angular 17 supports both Observables and Signals
- RxJS provides powerful operators (combineLatest, map)
- Team might be more familiar with Observables
- Async pipe in templates handles subscriptions automatically

**Trade-off**: Signals would be more modern, but Observables are proven

---

### 2. **Why OnPush Change Detection?**

**Decision**: All components use `ChangeDetectionStrategy.OnPush`

**Reasoning:**
- Performance optimization for large datasets (700 work orders)
- Forces explicit change detection with `markForCheck()`
- Encourages immutable data patterns
- Works well with Observable streams

**Implementation:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineShellComponent {
  constructor(private cdr: ChangeDetectorRef) {}
  
  someMethod() {
    // Explicit change detection
    this.cdr.markForCheck();
  }
}
```

---

### 3. **Why JSON File for Sample Data?**

**Decision**: Load data from `assets/sample-data.json` via HttpClient

**Reasoning:**
- Easier to edit and maintain than TypeScript arrays
- Simulates real API response
- Can be replaced with actual API call later
- 700 work orders would clutter component file

**Implementation:**
```typescript
// In ScheduleService
constructor(private http: HttpClient) {
  this.loadSampleData();
}

private loadSampleData(): void {
  this.http.get<any>('assets/sample-data.json')
    .subscribe(data => {
      this.workCenters$.next(data.workCenters);
      this.workOrders$.next(data.workOrders);
    });
}
```

---

### 4. **Why Separate ValidationService?**

**Decision**: Created dedicated service for overlap detection

**Reasoning:**
- Business logic separate from UI components
- Reusable across create and edit flows
- Easier to test in isolation
- Single responsibility principle

**Alternative Considered**: Inline validation in component
**Why Rejected**: Would mix UI and business logic

---

### 5. **Why trackBy Functions?**

**Decision**: Used trackBy for all `*ngFor` loops

**Reasoning:**
- Performance optimization for large lists
- Prevents unnecessary DOM re-renders
- Angular best practice for dynamic lists

**Implementation:**
```typescript
trackByWorkCenter(index: number, center: WorkCenterDocument): string {
  return center.docId;
}

trackByWorkOrder(index: number, order: WorkOrderDocument): string {
  return order.docId;
}
```

---

## Challenges Overcome

### Challenge 1: Dropdown Styling with ng-select

**Problem**: ng-select default styles overriding custom design

**Solution Process:**
1. Tried global styles with ::ng-deep → Didn't work
2. Tried appendTo="body" with panelClass → Partial success
3. Used ViewEncapsulation.None → Success!
4. Added !important flags for specificity

**Lesson**: Library integration requires understanding Angular's view encapsulation

---

### Challenge 2: Date Conversion for ngb-datepicker

**Problem**: ngb-datepicker uses NgbDateStruct, form uses ISO strings

**Solution**: Created conversion methods
```typescript
private isoToNgbDate(isoDate: string): NgbDateStruct | null {
  const parts = isoDate.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10)
  };
}

private ngbDateToIso(date: NgbDateStruct): string {
  const year = date.year;
  const month = date.month.toString().padStart(2, '0');
  const day = date.day.toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**Lesson**: Always check library data formats and plan conversions

---

### Challenge 3: Fixed Left Panel with Scrollable Timeline

**Problem**: Left panel must stay fixed while timeline scrolls horizontally

**Solution**: Flexbox layout with overflow control
```scss
.timeline-layout {
  display: flex;
  overflow: hidden;
}

.work-centers-panel {
  width: 382px;
  flex-shrink: 0;  // Prevents shrinking
  overflow-x: hidden;  // No horizontal scroll
}

.timeline-panel {
  flex: 1;
  overflow-x: auto;  // Horizontal scroll
}
```

**Lesson**: Flexbox with overflow control is perfect for split-panel layouts

---

## Performance Optimizations

1. **OnPush Change Detection**: Reduces unnecessary checks
2. **trackBy Functions**: Prevents DOM thrashing
3. **Pure Pipes**: All calculations in services, not templates
4. **Observable Streams**: Efficient reactive updates
5. **Lazy Rendering**: Only visible work orders rendered (via scrolling)

---

## Future Improvements

### Identified During Development:

1. **Virtual Scrolling**: For thousands of work orders
2. **Infinite Horizontal Scroll**: Load dates dynamically
3. **Drag-and-Drop**: Reschedule by dragging bars
4. **localStorage Persistence**: Save changes locally
5. **Undo/Redo**: Action history management
6. **Keyboard Shortcuts**: Power user features
7. **Accessibility**: ARIA labels, focus management
8. **Unit Tests**: Component and service tests
9. **E2E Tests**: Full user flow testing

---

## Conclusion

This project demonstrated:
- Angular 17 standalone component architecture
- Complex date calculations and positioning
- Form validation with cross-field dependencies
- Library integration with custom styling
- Performance optimization techniques
- Clean code organization and separation of concerns

The AI-assisted development process helped with:
- Architecture decisions and component breakdown
- Complex CSS styling and library integration
- TypeScript type definitions and interfaces
- Problem-solving for technical challenges
- Best practices and performance optimizations

**Total Development Time**: ~8-10 hours
**Lines of Code**: ~2,500
**Components**: 6 main components
**Services**: 3 core services
**Sample Data**: 700 work orders across 7 work centers
