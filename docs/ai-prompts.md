🚀 PHASE 1 — Project Scaffold
🟢 Prompt 1 — Create Angular Foundation


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

You get structure

No messy monolith component

No premature logic

🚀 PHASE 2 — Data Layer (Deterministic Dataset)
🟢 Prompt 2 — Models + Dataset
Create TypeScript interfaces for:

WorkCenterDocument
WorkOrderDocument
WorkOrderStatus

All documents follow this structure:

{
  docId: string;
  docType: string;
  data: {...}
}

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

🚀 PHASE 3 — Timeline Math Engine (CRITICAL)

This is where most candidates fail.

🟢 Prompt 3 — Timeline Service
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

🚀 PHASE 4 — Static Timeline Grid (No Work Orders Yet)

Now we build layout only.

🟢 Prompt 4 — Timeline Shell Layout
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

You’re building in layers.
This is senior workflow.

Commit.

🚀 PHASE 5 — Work Order Bars
🟢 Prompt 5 — Render Work Orders
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

🚀 PHASE 6 — Click-to-Create Flow

Now interaction.

🟢 Prompt 6 — Detect Click Position
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

🚀 PHASE 7 — Slide-Out Panel (Reactive Forms)
🟢 Prompt 7 — Schedule Panel
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

🚀 PHASE 8 — Overlap Detection
🟢 Prompt 8 — Validation Logic
Implement overlap detection inside schedule.service.

Rules:
- Only check within same work center
- Exclude current order when editing
- Prevent save if overlap exists
- Return validation error message

Algorithm:
Overlap if:
newStart <= existingEnd && newEnd >= existingStart

Integrate this into panel submit handler.
Display error message in UI.

This is your logic test moment.

Commit.

🚀 PHASE 9 — Zoom Switching
🟢 Prompt 9
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

🚀 PHASE 10 — Polish Phase

Only now ask Kiro:

Refactor code for:
- Strict typing improvements
- Performance improvements
- Clean separation of concerns
- Remove duplication
- Improve SCSS structure