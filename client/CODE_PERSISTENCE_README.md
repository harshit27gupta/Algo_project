# Code Persistence and Reset Features

## Overview
This implementation adds code persistence and reset functionality to the online judge platform, similar to LeetCode's behavior.

## Features

### 1. Code Persistence
- **Automatic Saving**: User code is automatically saved to localStorage as they type
- **Per-Problem Storage**: Each problem and language combination has its own storage key
- **Cross-Session Persistence**: Code persists across browser refreshes and sessions
- **Smart Template Detection**: Automatically clears storage when code matches the template

### 2. Reset Functionality
- **Reset Button**: Click the undo icon (↶) in the editor header to reset to template
- **Keyboard Shortcut**: Use `Ctrl+R` (or `Cmd+R` on Mac) to reset code
- **Confirmation Dialog**: Prevents accidental resets when there are unsaved changes
- **Visual Feedback**: Toast notification confirms successful reset

### 3. Unsaved Changes Indicator
- **Visual Indicator**: Orange dot (•) appears when there are unsaved changes
- **Page Leave Warning**: Browser warns user before leaving with unsaved changes
- **Real-time Updates**: Indicator updates as user types

## Technical Implementation

### Storage Structure
```
localStorage Key: algo_judge_code_{problemId}_{language}
Example: algo_judge_code_123_java
```

### Files Modified
1. **`src/utils/codePersistence.js`** - New utility functions for localStorage management
2. **`src/pages/Problem.jsx`** - Main component with persistence logic
3. **`src/pages/Problem.css`** - Styles for reset button and unsaved indicator

### Key Functions
- `saveCode(problemId, language, code)` - Save code to localStorage
- `loadCode(problemId, language)` - Load code from localStorage
- `clearCode(problemId, language)` - Clear saved code
- `hasSavedCode(problemId, language)` - Check if saved code exists

### State Management
- `hasUnsavedChanges` - Tracks whether current code differs from template
- Automatic saving on code changes
- Template comparison to determine if code should be saved

## Usage

### For Users
1. **Start Coding**: Begin typing in any language - code is automatically saved
2. **Switch Languages**: Your code is preserved when switching between Java, C++, and C
3. **Refresh Page**: Your code will be restored when you return
4. **Reset Code**: Click the reset button or use Ctrl+R to return to template
5. **Leave Page**: Browser will warn you if you have unsaved changes

### For Developers
The implementation is modular and can be easily extended:
- Add new languages by updating the `languages` array
- Modify storage keys by changing the `STORAGE_PREFIX`
- Add more keyboard shortcuts in the `handleKeyDown` function
- Customize the confirmation dialog behavior

## Browser Compatibility
- Uses standard localStorage API
- Works in all modern browsers
- Graceful fallback if localStorage is unavailable
- Error handling for storage quota exceeded

## Performance Considerations
- Code is saved on every change (debouncing could be added for optimization)
- Storage is per-problem and per-language to avoid conflicts
- Automatic cleanup when code matches template
- Minimal impact on editor performance 