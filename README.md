# Algo_project

## Autocomplete Suggestion Issue (Debug & Solution)

### Problem Faced
- The custom code editor used a Trie-based autocomplete system to suggest programming keywords and identifiers for Java, C++, and C.
- Users noticed that suggestions for keywords (e.g., `ArrayList`) were often shown in all lowercase (e.g., `arraylist`), even though the original keywords were added with correct casing.
- This was because the Trie implementation converted all words to lowercase on insert and search, losing the original casing.
- As a result, the suggestion dropdown in the editor did not match the expected keyword casing, reducing usability and clarity for users.
- Additionally, some important keywords (like `add`, `push_back`, etc.) were not appearing at the top of the suggestions, making the autocomplete less useful for coding.
- Monaco Editor's built-in suggestions were not prioritized, so custom suggestions would sometimes overshadow Monaco's context-aware completions.

### How It Was Solved
- The Trie implementation was updated to store the original casing of each word (as `originalWord`) at the end node when a word is first inserted.
- When collecting suggestions, the Trie now returns the original-cased word if available, ensuring that suggestions like `ArrayList` appear exactly as stored.
- The learning logic was also updated so that if a user types a word with a new casing (e.g., `ArrayListt`), the Trie updates the stored casing if the lowercased word matches an existing entry.
- This ensures that both keywords and user-learned words always appear in the suggestion dropdown with their correct, original casing.
- The keyword loading logic was enhanced to assign higher frequencies to the most coding-relevant keywords for each language, ensuring that common methods and data structures (like `add`, `push_back`, `printf`, etc.) always appear at the top.
- A one-time reset was performed to clear all previously learned words, so only the correct-case, high-priority keywords are loaded into the Trie.
- The suggestion merging logic was updated so that Monaco Editor's built-in suggestions are always shown at the top, followed by custom Trie-based suggestions.
- Debug logging was added to the code editor to help track learning and suggestion behavior.

### Result
- Suggestions now appear in their original, correct case (e.g., `ArrayList` instead of `arraylist`).
- The most relevant coding keywords are always suggested first.
- Monaco's built-in suggestions are prioritized, improving the overall coding experience.

## Java Solution.java Race Condition (Debug & Solution)

### Problem Faced
- When users submitted Java code, the backend saved the code as `Solution.java` and compiled/executed the `Solution` class.
- If multiple users (or the same user in quick succession) submitted code, a race condition occurred: files were overwritten or deleted while still in use, causing errors like `Could not find or load main class Solution` or file not found.
- This led to unpredictable failures, especially when running or testing code multiple times rapidly.

### How It Was Solved
- The backend was updated to generate a unique filename and public class name for each Java submission (e.g., `Solution_abc123.java` with class `Solution_abc123`).
- The code wrapping logic was modified to replace the public class name in the user's code with the unique class name.
- Compilation and execution commands were updated to use the unique class name and filename.
- After execution, the specific files were safely deleted, preventing conflicts between submissions.
- This approach ensures that each submission is isolated, eliminating race conditions and file/class name conflicts.

### Result
- Java code submissions are now reliably compiled and executed, even with rapid or concurrent submissions.
- The `Could not find or load main class Solution` and file not found errors are resolved.
- The system is robust against race conditions for Java code execution.

## Java Multi-User File Handling & Race Condition (Debug & Solution)

### Problem Faced
- When multiple users submitted Java code at the same time, the backend saved every submission as `Solution.java` in a shared directory.
- This caused submissions to overwrite each other, leading to unpredictable errors such as:
  - Compilation failures
  - Runtime errors
  - `ClassNotFoundException`
  - "Could not find or load main class Solution"
- The system was not safe for concurrent Java submissions, and users could interfere with each other's code execution.

### How It Was Solved
- The backend was updated to create a **unique subdirectory** for every Java submission (e.g., `user_codes/java_<uuid>/Solution.java`).
- Each submission's code is saved as `Solution.java` inside its own unique directory, ensuring complete isolation.
- Compilation and execution commands are run inside the unique directory, so each user's code is compiled and executed independently.
- After execution, the entire directory is deleted, cleaning up all files related to that submission.
- This approach guarantees that no two users can overwrite or interfere with each other's Java files, eliminating all race conditions.

### Result
- Multiple users can now submit and run Java code concurrently with no risk of file conflicts or race conditions.
- The system is robust, scalable, and safe for high-concurrency environments.
- Errors like `ClassNotFoundException` and file overwrites are fully resolved.

## User-Friendly Error Reporting and Highlighting (Debug & Solution)

### Problem Faced
- Users wrote only the function body (like on LeetCode), but compilation errors from the backend/compiler included extra wrapper code, so error line numbers did not match the user's code.
- Error messages were verbose, including file paths and irrelevant details, making it hard for users to understand what went wrong.
- Warnings were not always treated as errors, so some issues were missed.
- The frontend did not highlight error lines in the code editor, making it difficult for users to quickly locate and fix mistakes.

### How It Was Solved
- The backend wraps user code with a test harness, but now tracks the line offset so it can subtract the wrapper lines from compiler error line numbers, ensuring errors point to the correct line in the user's code.
- Compiler warnings are now treated as errors by passing `-Werror=...` flags to the compiler (e.g., g++), so all issues are surfaced immediately.
- The backend parses compiler error output using regex, extracting only the relevant error message and line number, and strips out file paths and bracketed warning codes for clarity.
- The backend returns both the cleaned error message and the adjusted error line numbers to the frontend.
- The frontend uses these line numbers to highlight error lines in the Monaco Editor, making it easy for users to spot and fix errors.

### Result
- Users see only the relevant error message, with the correct line number matching their code.
- All warnings are treated as errors, so users are alerted to all issues.
- Error lines are highlighted in the code editor, improving the debugging experience and closely mimicking the LeetCode workflow.

## Monaco Editor AI Suggestion Integration (Debug & Solution)

### Problem Faced
- Attempted to integrate Google Gemini AI-powered code suggestions into the Monaco Editor for Java, C, and C++.
- Faced several issues:
  - Gemini API model naming and endpoint mismatches (404 errors).
  - Gemini API responses wrapped JSON in Markdown code blocks, causing JSON parsing errors.
  - The AI suggestion dropdown in Monaco sometimes appeared cluttered due to default CSS.
  - Ultimately, the AI suggestion feature was removed as the integration was not required for the final workflow.

### How It Was Solved
- Debugged Gemini API errors by listing available models and updating the backend to use the correct model name.
- Fixed JSON parsing by stripping Markdown code block markers from Gemini responses before parsing.
- Improved Monaco suggestion dropdown appearance by customizing CSS for better spacing and readability.
- Cleanly removed all Gemini AI suggestion code from both frontend and backend when the feature was no longer needed, restoring Monaco Editor to its default, stable state.

### Result
- The codebase is now clean, with no unnecessary AI integration code.
- Monaco Editor provides a stable, user-friendly experience with improved suggestion dropdown styling.
- The system is ready for future AI integrations in other contexts if needed.