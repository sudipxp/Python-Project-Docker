"""
FastAPI Application - Entry Point

This module simply re-exports the FastAPI `app` from the structured backend
package and provides a convenient way to run the server with `python main.py`
or `uvicorn main:app --reload`.
"""

from backend.app import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
