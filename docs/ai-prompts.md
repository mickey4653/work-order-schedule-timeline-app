<!-- Used AI to scaffold timeline math functions, then manually refactored to centralize zoom config. -->

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

🟢 Prompt 1.5 — Refine Timeline Structure
Refactor the timeline feature structure.

Inside features/timeline, create:

timeline-shell/
  - timeline-shell.component.ts
  - timeline-shell.component.html
  - timeline-shell.component.scss

timeline-grid/
  - timeline-grid.component.ts

timeline-row/
  - timeline-row.component.ts

timeline-header/
  - timeline-header.component.ts

timeline-bar/
  - timeline-bar.component.ts

schedule-panel/
  - schedule-panel.component.ts

Goal:
- timeline-shell = orchestration container
- grid = scrollable area
- row = one work center row
- bar = one work order
- header = date header
- schedule-panel = create/edit panel

Remove the single timeline.component.
Keep architecture scalable and clean.
Do not implement business logic yet.
Only restructure.


🟢 Prompt 2A — Enforce OnPush + Clear Contracts
Refactor all timeline feature components to:

1. Use ChangeDetectionStrategy.OnPush
2. Add explicit @Input() and @Output() placeholders for their responsibilities
3. Add clear comments at top of each component describing its responsibility boundary
4. Do NOT implement business logic yet

We are enforcing clean architecture contracts before adding logic.