# Debug & Solution Journey: Submission History and Statistics

This document summarizes the main problems encountered while building and refining the submission history, recent submissions, and statistics features for the Online Judge project, and how each was solved.

---

## 1. **Recent Submissions Only Showed Accepted Ones**

**Problem:**
- The recent submissions API was only returning accepted submissions, even though the backend query did not filter by status.

**Root Cause:**
- Submissions with status `wrong_answer` or `runtime_error` were not being saved to the database. The backend only created a submission record for accepted solutions.
- Compilation errors also did not create a submission record.

**Solution:**
- Updated the backend (`submitSolution` controller) to always create a `Submission` document for every attempt, including wrong answers and runtime errors (and optionally compilation errors).
- Now, all attempts are visible in the recent submissions list.

---

## 2. **Performance by Difficulty Counted Attempts, Not Unique Problems**

**Problem:**
- The "Performance by Difficulty" bar showed the number of attempts (submissions) instead of the number of unique problems attempted/solved.
- Submitting the same problem multiple times inflated the denominator and numerator.

**Root Cause:**
- The backend aggregation grouped by submission, not by unique problem.

**Solution:**
- Changed the MongoDB aggregation to first group by `{ problem, difficulty }` and then by `difficulty`, counting unique problems attempted and solved.
- Now, the stats reflect unique problems, not attempts.

---

## 3. **Recent Submissions API Not Called or Not Showing All Statuses**

**Problem:**
- The recent submissions API was not always being called, or was not returning all expected statuses.

**Root Cause:**
- Needed to verify API calls and check what was being returned.

**Solution:**
- Added a `console.log` in the backend API to confirm when the endpoint is called and with what parameters.
- Added a log to print the statuses of returned submissions for debugging.

---

## 4. **Frontend Used Mongoose Methods on Plain Objects**

**Problem:**
- The frontend tried to call Mongoose instance methods (like `getFormattedExecutionTime()`) on plain objects returned from the backend, resulting in empty or broken UI for the "Best" field.

**Solution:**
- Switched to using formatting helper functions on raw values (e.g., `formatExecutionTime(ms)`) in the frontend.
- Now, the UI displays the best stats correctly.

---

## 5. **Recent Submissions Only Showed a Limited Number**

**Problem:**
- By default, only the most recent 4 submissions were shown.

**Solution:**
- Made the limit configurable in both backend and frontend. To show all, increase or remove the limit.

---

## 6. **Auto-Refresh of Recent Submissions After New Submission**

**Problem:**
- Recent submissions did not auto-refresh after a new submission.

**Solution:**
- Added a `refreshTrigger` state in the problem page, incremented after each submission, and passed as a prop to the `RecentSubmissions` component to trigger a re-fetch.

---

## 7. **Expandable Code View for Recent Submissions**

**Problem:**
- Needed a user-friendly way to view the code for each recent submission.

**Solution:**
- Implemented an expand/collapse feature in the `RecentSubmissions` component, with a modern UI and syntax highlighting.

---

## 8. **General Debugging Steps**
- Used API logs and direct database queries to verify what was stored and returned.
- Used browser dev tools to inspect API responses and frontend state.
- Added error handling and fallback UI for missing or unexpected data.

---

## **Summary**
- All submission attempts (accepted, wrong answer, runtime error, etc.) are now saved and visible.
- Statistics reflect unique problems, not attempts.
- The UI is modern, user-friendly, and auto-refreshes as expected.
- Debugging was done systematically, with logs and database checks at each step.

---

**This document can be used as a reference for future debugging and feature improvements.** 