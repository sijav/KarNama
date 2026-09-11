1. The 4px bleed is sufficient for the actual 3px card-focus spread and hover shadow in a normal-height column. The add row remains pinned while the card region has space to flex. It fails on a short board: below 116px, the non-shrinking header, two gaps, padding, and 36px add row exceed the frame, and `overflow: hidden` clips the add row.

2. Yes. `Children.count([null])`, `Children.count([false])`, and a filtered map such as `jobs.map(job => job.visible && <JobCard />)` are nonzero even when no card renders. The result is an empty scroll region with no empty-state message. `count` and `children` are also two competing sources of truth.

3. The collapsed header is keyboard-operable and its visible name plus `aria-expanded="false"` gives screen readers the status and locale-formatted count. That part is sound.

4. The open-header geometry is internally consistent: the 32px trigger is deliberately laid out as a 16px icon, and the long-name flex constraints preserve the count/menu gap. The stories do not actually test the long English case, but I found no code-level layout failure there.

Findings:

- critical — The pinned Add Card control is not visible on a short board. With a parent height below 116px, the fixed 40px header, 36px add button, 24px frame padding, and two 8px gaps cannot fit; the frame then clips its own bottom because it has `overflow: hidden`. This violates the required pinned Add Card behavior for a short board. [KanbanColumn.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\kanban-column\KanbanColumn.tsx:224), [KanbanColumn.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\kanban-column\KanbanColumn.tsx:281)

- critical — A column with no rendered cards does not reliably render its empty state. For example, `children={[null]}`, `children={[false]}`, or `children={jobs.map(job => job.visible && <JobCard ... />)}` makes `Children.count` positive, so the component renders blank content rather than the required empty-column message. [KanbanColumn.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\kanban-column\KanbanColumn.tsx:176)

- critical — Size=M is not exclusive to this column, despite being an explicit completion condition and design contract. `StatusChoice` uses the same large chip, so the task cannot truthfully be marked done until that use is removed or the contract is changed by the owner. [StatusPicker.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.tsx:59)

Lint and TypeScript checks pass.

VERDICT
score: 4.0
criticals: 3
one-line: Make the column preserve a visible Add Card control at constrained heights, then fix empty-child detection and remove the other Size=M StatusChip use.