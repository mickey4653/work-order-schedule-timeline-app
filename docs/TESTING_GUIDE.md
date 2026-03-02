# Work Order Schedule Timeline - Manual Testing Guide

## Prerequisites
1. Start the development server: `ng serve` or `npm start`
2. Open browser to `http://localhost:4200`
3. Verify the application loads without console errors

---

## Test 1: Initial Page Load & Layout

### Steps:
1. Observe the page layout on load

### Expected Results:
- ✅ Logo appears at top left (NAOLOGIC or image)
- ✅ "Work Orders" heading displays below logo
- ✅ "Timescale" label with dropdown shows below heading
- ✅ Left panel shows "Work Centers" header with 7 work centers listed:
  - Assembly Line A
  - Assembly Line B
  - Welding Station
  - Paint Booth
  - Quality Control
  - Packaging Unit
  - Shipping Dock
- ✅ Right panel shows timeline grid with date columns
- ✅ Work order bars are visible in different colors:
  - Blue = Open
  - Orange = In Progress
  - Green = Complete
  - Red = Blocked
- ✅ Red vertical line indicates current day position

---

## Test 2: Horizontal Timeline Scrolling

### Steps:
1. Locate the timeline grid (right panel)
2. Use mouse wheel or trackpad to scroll horizontally
3. Alternatively, click and drag the horizontal scrollbar at bottom

### Expected Results:
- ✅ Timeline grid scrolls smoothly left/right
- ✅ Left panel (work centers) remains fixed and does NOT scroll
- ✅ Date header scrolls in sync with timeline grid
- ✅ Work order bars move with the timeline
- ✅ Current day indicator line moves with scroll
- ✅ No layout breaking or visual glitches
- ✅ Scrollbar appears at bottom of timeline panel

### What to Observe:
- Smooth scrolling performance (no lag or stuttering)
- Work center names stay visible while scrolling
- Date columns align properly with work order bars
- No horizontal overflow on left panel

---

## Test 3: Zoom Level Switching

### Test 3A: Switch to Hour View
1. Click the "Timescale" dropdown (currently shows "Day")
2. Select "Hour"

### Expected Results:
- ✅ Dropdown updates to show "Hour"
- ✅ Timeline columns become narrower (60px width)
- ✅ Date labels update to show hourly increments
- ✅ Work order bars adjust width proportionally
- ✅ Timeline re-centers on today's date
- ✅ All bars remain properly aligned with dates

### Test 3B: Switch to Week View
1. Click the "Timescale" dropdown
2. Select "Week"

### Expected Results:
- ✅ Dropdown updates to show "Week"
- ✅ Timeline columns become wider (120px width)
- ✅ Date labels update to show weekly increments
- ✅ Work order bars adjust width proportionally
- ✅ Timeline re-centers on today's date

### Test 3C: Switch to Month View
1. Click the "Timescale" dropdown
2. Select "Month"

### Expected Results:
- ✅ Dropdown updates to show "Month"
- ✅ Timeline columns become widest (160px width)
- ✅ Date labels update to show monthly increments
- ✅ Work order bars adjust width proportionally
- ✅ Timeline re-centers on today's date

### Test 3D: Switch Back to Day View
1. Click the "Timescale" dropdown
2. Select "Day"

### Expected Results:
- ✅ Timeline returns to default day view (80px columns)
- ✅ All work orders render correctly

### What to Observe:
- No console errors during zoom changes
- Smooth transition between zoom levels
- Work order bars never overlap incorrectly
- Date labels are readable and properly formatted
- Current day indicator line updates position

---

## Test 4: Row Hover Effect

### Steps:
1. Move mouse cursor over any work center row in the timeline grid
2. Move cursor to different rows

### Expected Results:
- ✅ Row background changes to light gray (#f0f0f0) on hover
- ✅ Hover effect applies to entire row width
- ✅ Hover effect disappears when cursor leaves row
- ✅ Work order bars remain visible during hover

---

## Test 5: Click-to-Create Scheduling Flow

### Test 5A: Open Create Panel
1. Click on an EMPTY area of the timeline grid (not on a work order bar)
2. Choose any work center row
3. Click on a date position

### Expected Results:
- ✅ Schedule panel slides in from the right side
- ✅ Backdrop overlay appears behind panel
- ✅ Panel header shows "Work Order Details"
- ✅ Subtitle shows "Specify the dates, name status for this order"
- ✅ Form contains 4 fields:
  - Work Order Name (empty)
  - Status (dropdown with colored badge)
  - Start Date (pre-filled with clicked date in YYYY-MM-DD format)
  - End Date (pre-filled with Start Date + 7 days)
- ✅ Two buttons in top right: "Cancel" and "Create"

### Test 5B: Verify Start Date Prefill
1. Note the date you clicked on the timeline
2. Check the "Start Date" field in the panel

### Expected Results:
- ✅ Start Date matches the clicked timeline date
- ✅ End Date is exactly 7 days after Start Date
- ✅ Dates are in YYYY-MM-DD format (e.g., 2025-03-15)

### Test 5C: Close Panel with Cancel
1. Click the "Cancel" button

### Expected Results:
- ✅ Panel slides out and closes
- ✅ Backdrop disappears
- ✅ Form resets to empty state

### Test 5D: Close Panel with Backdrop Click
1. Click empty timeline area to open panel again
2. Click on the dark backdrop (outside the panel)

### Expected Results:
- ✅ Panel closes
- ✅ Form resets

---

## Test 6: Create Work Order - Valid Submission

### Steps:
1. Click empty timeline area to open create panel
2. Fill in the form:
   - Work Order Name: "Test Order 001"
   - Status: Select "Open" (cyan badge)
   - Start Date: Keep pre-filled date
   - End Date: Keep pre-filled date (Start + 7 days)
3. Click "Create" button

### Expected Results:
- ✅ Panel closes
- ✅ New work order bar appears on timeline
- ✅ Bar is positioned at the correct date
- ✅ Bar shows blue color (Open status)
- ✅ Bar displays "Test Order 001" as name
- ✅ No error messages appear

---

## Test 7: Form Validation

### Test 7A: Required Field Validation
1. Open create panel
2. Leave "Work Order Name" empty
3. Click "Create" button

### Expected Results:
- ✅ Error message appears: "Work order name is required"
- ✅ Panel does NOT close
- ✅ Create button may be disabled

### Test 7B: Date Range Validation
1. Open create panel
2. Fill in Work Order Name: "Invalid Date Test"
3. Set Start Date: 2025-03-20
4. Set End Date: 2025-03-15 (BEFORE start date)
5. Click "Create" button

### Expected Results:
- ✅ Error message appears: "End date is required and must be after start date"
- ✅ Panel does NOT close
- ✅ Work order is NOT created

---

## Test 8: Status Dropdown with Colored Badges

### Steps:
1. Open create panel
2. Click on the Status dropdown
3. Observe the dropdown options

### Expected Results:
- ✅ Dropdown shows 4 options with colored badges:
  - "Open" - Cyan badge (border: rgba(206, 251, 255, 1), background: rgba(228, 253, 255, 1))
  - "In Progress" - Yellow badge
  - "Complete" - Green badge
  - "Blocked" - Red badge
- ✅ Selected status displays colored badge inside the field
- ✅ Badge colors match the work order bar colors on timeline

### Test Each Status:
1. Select "Open" - verify cyan badge appears
2. Select "In Progress" - verify yellow badge appears
3. Select "Complete" - verify green badge appears
4. Select "Blocked" - verify red badge appears

---

## Test 9: Overlap Detection Validation

### Test 9A: Create Overlapping Work Order
1. Identify an existing work order on the timeline
2. Note its work center and date range (e.g., Assembly Line A, 2025-01-05 to 2025-01-10)
3. Click on the SAME work center row within the existing order's date range
4. Panel opens with pre-filled dates
5. Fill in Work Order Name: "Overlap Test"
6. Ensure Start Date or End Date overlaps with existing order
7. Click "Create"

### Expected Results:
- ✅ Red error message appears at bottom of form
- ✅ Error message says: "This work order overlaps with existing orders: [order name]"
- ✅ Panel stays open (does NOT close)
- ✅ Work order is NOT created on timeline
- ✅ No console errors

### Test 9B: Create Non-Overlapping Work Order
1. Click on empty space AFTER the existing work order
2. Fill in Work Order Name: "No Overlap Test"
3. Verify dates do NOT overlap with any existing orders
4. Click "Create"

### Expected Results:
- ✅ No error message appears
- ✅ Panel closes
- ✅ New work order appears on timeline
- ✅ New order does NOT visually overlap with existing orders

---

## Test 10: Three-Dot Menu - Edit Action

### Test 10A: Open Edit Menu
1. Hover over any work order bar on the timeline
2. Locate the three-dot menu button (⋮) on the right side of the bar
3. Click the three-dot button

### Expected Results:
- ✅ Dropdown menu appears below the work order bar
- ✅ Menu shows two options:
  - "Edit" (black text)
  - "Delete" (red text)
- ✅ Menu has white background with shadow

### Test 10B: Edit Work Order
1. Click "Edit" from the menu

### Expected Results:
- ✅ Schedule panel slides in from right
- ✅ Panel header shows "Edit Work Order" (NOT "Work Order Details")
- ✅ Form is pre-filled with existing work order data:
  - Work Order Name shows current name
  - Status shows current status with colored badge
  - Start Date shows current start date
  - End Date shows current end date
- ✅ Button in top right shows "Update" (NOT "Create")

### Test 10C: Update Work Order
1. Change Work Order Name to "Updated Order Name"
2. Change Status to different value
3. Click "Update" button

### Expected Results:
- ✅ Panel closes
- ✅ Work order bar updates on timeline
- ✅ Bar shows new name
- ✅ Bar shows new status color
- ✅ Bar position updates if dates changed

### Test 10D: Cancel Edit
1. Open edit menu and click "Edit"
2. Make some changes to the form
3. Click "Cancel" button

### Expected Results:
- ✅ Panel closes
- ✅ Changes are NOT saved
- ✅ Work order remains unchanged on timeline

---

## Test 11: Three-Dot Menu - Delete Action

### Test 11A: Delete with Confirmation
1. Hover over a work order bar
2. Click the three-dot menu button (⋮)
3. Click "Delete" option

### Expected Results:
- ✅ Browser confirmation dialog appears
- ✅ Dialog message: "Are you sure you want to delete '[work order name]'?"
- ✅ Dialog has "OK" and "Cancel" buttons

### Test 11B: Confirm Deletion
1. Click "OK" in the confirmation dialog

### Expected Results:
- ✅ Confirmation dialog closes
- ✅ Work order bar disappears from timeline immediately
- ✅ No error messages appear
- ✅ Timeline layout adjusts smoothly

### Test 11C: Cancel Deletion
1. Open three-dot menu on different work order
2. Click "Delete"
3. Click "Cancel" in confirmation dialog

### Expected Results:
- ✅ Confirmation dialog closes
- ✅ Work order remains on timeline (NOT deleted)
- ✅ Menu closes

---

## Test 12: Edit Overlap Detection

### Steps:
1. Identify two adjacent work orders on the same work center
2. Edit the first work order (three-dot menu → Edit)
3. Change End Date to overlap with the second work order
4. Click "Update"

### Expected Results:
- ✅ Error message appears: "This work order overlaps with existing orders: [order name]"
- ✅ Panel stays open
- ✅ Work order is NOT updated
- ✅ Original work order remains unchanged on timeline

---

## Test 13: Multiple Work Orders Per Work Center

### Steps:
1. Scroll through the timeline
2. Observe each work center row

### Expected Results:
- ✅ Each work center has multiple work order bars
- ✅ Work orders are positioned sequentially (no overlaps)
- ✅ Different colored bars appear (all 4 statuses represented)
- ✅ Bars have 1-day gaps between them

---

## Test 14: Current Day Indicator

### Steps:
1. Locate the red vertical line on the timeline
2. Scroll the timeline left and right
3. Change zoom levels

### Expected Results:
- ✅ Red line represents today's date
- ✅ Line spans full height of timeline grid
- ✅ Line moves with horizontal scroll
- ✅ Line position updates when zoom level changes
- ✅ Line has subtle shadow effect

---

## Test 15: Responsive Behavior

### Steps:
1. Resize browser window to different widths
2. Observe layout behavior

### Expected Results:
- ✅ Left panel (work centers) maintains fixed width
- ✅ Timeline panel adjusts to available space
- ✅ Horizontal scrollbar appears when needed
- ✅ No horizontal overflow on page level
- ✅ Schedule panel maintains 591px width

---

## Test 16: Performance Check

### Steps:
1. Scroll timeline rapidly left and right
2. Switch zoom levels multiple times quickly
3. Open and close schedule panel repeatedly
4. Create several work orders in succession

### Expected Results:
- ✅ No lag or stuttering during scroll
- ✅ Zoom changes are smooth and immediate
- ✅ Panel animations are smooth
- ✅ No memory leaks (check browser DevTools)
- ✅ No console errors or warnings

---

## Test 17: Data Persistence (Session)

### Steps:
1. Create a new work order
2. Edit an existing work order
3. Delete a work order
4. Refresh the browser page (F5)

### Expected Results:
- ⚠️ Changes are LOST after refresh (expected behavior - no backend persistence)
- ✅ Application reloads with original sample data
- ✅ 700 work orders appear (100 per work center)

---

## Test 18: Browser Console Check

### Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all major actions (create, edit, delete, zoom, scroll)

### Expected Results:
- ✅ No error messages in console
- ✅ No warning messages (or only minor Angular warnings)
- ✅ No failed network requests
- ✅ No TypeScript compilation errors

---

## Test 19: Visual Design Verification

### Steps:
1. Compare application with design specifications

### Expected Results:
- ✅ Font family: Circular Std throughout
- ✅ Panel width: 591px
- ✅ Panel box-shadow matches design
- ✅ Button dimensions: 66px × 32px
- ✅ Button box-shadows match design
- ✅ Status badge colors match design
- ✅ Zoom dropdown has proper styling
- ✅ Logo displays correctly (NAOLOGIC or image)

---

## Test 20: Edge Cases

### Test 20A: Very Long Work Order Name
1. Create work order with name: "This is a very long work order name that should be truncated with ellipsis"
2. Observe the work order bar

### Expected Results:
- ✅ Name is truncated with ellipsis (...)
- ✅ Bar does not expand beyond normal size
- ✅ Full name visible in edit panel

### Test 20B: Same Day Start and End
1. Create work order with Start Date = End Date
2. Click "Create"

### Expected Results:
- ✅ Error message appears (End date must be after start date)
- ✅ Work order is NOT created

### Test 20C: Click on Work Order Bar (Not Empty Space)
1. Click directly on an existing work order bar

### Expected Results:
- ✅ Create panel does NOT open
- ✅ Only three-dot menu should trigger actions on bars

---

## Final Checklist

Before submission, verify:
- [ ] All 7 work centers display correctly
- [ ] Work orders render with correct colors (blue, orange, green, red)
- [ ] Horizontal scrolling works smoothly
- [ ] All 4 zoom levels work (Hour, Day, Week, Month)
- [ ] Click-to-create opens panel with pre-filled dates
- [ ] Form validation prevents invalid submissions
- [ ] Overlap detection works correctly
- [ ] Three-dot menu shows Edit and Delete options
- [ ] Edit workflow updates work orders correctly
- [ ] Delete workflow removes work orders with confirmation
- [ ] Current day indicator line is visible
- [ ] No console errors during any operation
- [ ] Panel animations are smooth
- [ ] Status badges show correct colors
- [ ] Design matches specifications (fonts, colors, spacing)

---

## Known Limitations (Expected Behavior)

1. **No Backend Persistence**: Data resets on page refresh
2. **No Drag-and-Drop**: Work orders cannot be dragged to new positions
3. **No Resize Handles**: Work order duration cannot be changed by dragging edges
4. **Session Only**: All changes exist only in browser memory

---

## Troubleshooting

### Issue: Timeline doesn't scroll horizontally
- Check that timeline grid width exceeds viewport width
- Verify `overflow-x: auto` is applied to timeline panel
- Check browser console for CSS errors

### Issue: Work orders don't appear
- Check browser console for errors
- Verify ScheduleService is generating data correctly
- Check that work orders array is not empty

### Issue: Panel doesn't open on click
- Verify clicking on empty space (not on work order bar)
- Check browser console for JavaScript errors
- Ensure click event handlers are properly bound

### Issue: Zoom doesn't work
- Check that TimelineService.setZoomLevel() is being called
- Verify Observable streams are updating
- Check that async pipes are used in template

---

## Success Criteria

✅ **Application is ready for submission when:**
1. All 20 tests pass without errors
2. No console errors during normal usage
3. Visual design matches specifications
4. All interactive features work as expected
5. Performance is smooth (no lag or stuttering)
6. Form validation prevents invalid data
7. Overlap detection works correctly
8. Edit and delete workflows function properly

---

**Testing Complete!** 🎉

If all tests pass, the application meets the technical requirements and is ready for submission.
