# Elimu Kenya
Pages: index.html (website) -> apply.html (details + submit) -> pay.html (processing fee).
Fees by band: 5=KSh 100, 4=150, 3=200, 2=250, 1=300 (shown only on the last review step and payment page).

## Institution lists
institutions.js holds the universities, TVET colleges and polytechnics shown on apply.html. Pick a type, tap a name and it fills the Institution name box. A student can still type a name that is not listed. To add or fix a name, edit institutions.js.

## Setup
1. Supabase: open SQL Editor, paste all of schema.sql and run it (safe to run again on an existing project).
2. Open config.js and paste your Supabase Project URL and anon / publishable key into `window.ELIMU={url:'...',key:'...'}`.
3. Render: New > Static Site, connect the repo, set Build Command to `echo done` (or leave the render.yaml values) and Publish Directory to `.` (a dot). index.html must be in the folder you publish. No web service is needed.

Verifying payments: open Table Editor > payments, read the M-Pesa message and code, then set applications.status = 'verified'. The student's pay page then shows the success notice.
Leaving config.js blank runs a local preview mode. Never deploy that way.
