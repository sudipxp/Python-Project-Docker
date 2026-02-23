# UI Application (HTML5) for Python FastAPI Backend

This is a lightweight HTML5/CSS/JavaScript single-page UI that connects to your existing FastAPI backend.
It lets you **view, create, edit, and delete** items using the `/items` endpoints of your Python API.

## Project Layout

```
ui/
  index.html   # Main page
  styles.css   # Modern responsive styling
  app.js       # API integration and interactivity
```

## Prerequisites

- Your FastAPI backend running locally at `http://localhost:8000`
  - Start it from the project root:

```bash
python main.py
# or
uvicorn main:app --reload
```

## How to Run the UI

### Option 1 – Open directly (for quick local testing)

1. Make sure the FastAPI backend is running.
2. Open `ui/index.html` in your browser (double-click or use "Open With" → browser).

> Note: For some browsers, direct file access can restrict `fetch` requests because of CORS or mixed-content rules.
> If you see errors in the browser console, use Option 2 (serve via a tiny HTTP server).

### Option 2 – Serve via a simple HTTP server (recommended)

From the project root (`E:\Python project`), run:

```bash
cd ui
python -m http.server 5500
```

Then open:

- `http://localhost:5500` → loads `index.html`

Ensure your FastAPI API is still running at `http://localhost:8000`.

## What the UI Does

- Shows live **API health** status (via `/health`).
- Lists items from `/items` in a responsive table.
- Lets you:
  - **Create** new items
  - **Edit** existing items
  - **Delete** items
- Shows friendly success/error messages at the top of the list panel.

## Changing the API URL

If your FastAPI runs on a different host/port, update the `API_BASE_URL` constant near the top of `app.js`:

```js
const API_BASE_URL = "http://your-host:your-port";
```

## Notes

- The UI is pure client-side and doesn’t require Node.js or any build tools.
- Styling is designed to look good on desktops and adapt nicely on tablets/phones.

