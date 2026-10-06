# AI Prompt Manager

AI Prompt Manager is a free, open-source personal prompt management application that helps users save, organize, search, edit, copy, favorite, import, and export prompts for AI tools (such as ChatGPT, Claude, Gemini, and image generators).

## Features

- **No Account Required:** Everything is stored locally in your browser using LocalStorage.
- **Privacy First:** No backend, no external databases. Your prompts never leave your device unless you export them.
- **Organization:** Categorize and tag your prompts.
- **Search & Filter:** Instantly find prompts by title, content, tags, or categories.
- **Favorites:** Mark your most-used prompts for quick access.
- **Import/Export:** Easily backup your data to a JSON file or migrate to another browser.

## How to Run Locally

Since this application uses vanilla HTML, CSS, and JavaScript with no build steps or backend dependencies, running it locally is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/boytamim/ai-prompt-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ai-prompt-manager
   ```
3. Open `index.html` in your web browser. You can just double-click the file, or use a local server for a better experience (e.g., using python or Live Server in VS Code):
   ```bash
   # If you have python installed
   python3 -m http.server
   ```
   Then open `http://localhost:8000` in your browser.

## Tech Stack

- HTML5
- CSS3 (Vanilla, CSS Variables for Dark Mode styling)
- JavaScript (Vanilla, ES6+)
- Phosphor Icons

## License

This project is open-source. See the LICENSE file for details.
