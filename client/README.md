# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Problem Faced & Solution

### The Problem

- **Monaco Editor** is a powerful code editor with advanced features, but its autocomplete/intellisense is highly optimized for JavaScript/TypeScript.
- For languages like **C, C++, and Java**, Monaco's default suggestions are:
  - Limited to basic keywords or in-buffer words
  - Lacking standard library, data structure, and algorithmic suggestions relevant to competitive programming
  - Not tailored for the needs of CP users (missing common patterns, variable names, etc.)
- This led to a suboptimal experience for users coding in C, C++, or Java, as they did not get helpful or contextually relevant autocomplete suggestions.

### The Solution

- **Custom Trie-Based Autocomplete**:
  - Built a trie data structure containing only the most relevant keywords, standard library functions, and common patterns for each language (Java, C++, C), focused on competitive programming.
  - Added learning capability: the trie learns new words and identifiers as the user codes, making suggestions more personalized over time.
- **Monaco Integration**:
  - Registered a custom Monaco completion provider that fetches suggestions from the trie based on the current prefix.
  - Merged these trie-based suggestions with Monaco's own (if any), so users get the best of both worlds: Monaco's UI/UX and our highly relevant, fast, and adaptive suggestions.
- **Result**:
  - Users now enjoy Monaco's advanced editing features (syntax highlighting, code folding, etc.)
  - Autocomplete is fast, relevant, and tailored for competitive programming in C, C++, and Java.
  - The system is extensible, lightweight, and can be further customized or expanded to other languages.
