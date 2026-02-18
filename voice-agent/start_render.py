"""
Run both the token server (FastAPI) and the LiveKit agent for Render.
Token server runs in the main process; agent runs in a subprocess so run_app
is the main process of its own process tree (avoids thread/event-loop issues).
"""
import atexit
import os
import signal
import subprocess
import sys

from dotenv import load_dotenv

load_dotenv()

PORT = int(os.environ.get("PORT", 8080))
VOICE_AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

_agent_proc: subprocess.Popen | None = None


def _shutdown(_signum=None, _frame=None):
    """Terminate agent subprocess on shutdown."""
    global _agent_proc
    if _agent_proc and _agent_proc.poll() is None:
        _agent_proc.terminate()
        _agent_proc.wait(timeout=10)
        _agent_proc = None


def main():
    global _agent_proc
    import uvicorn
    from token_server import app

    _agent_proc = subprocess.Popen(
        [sys.executable, "agent.py", "start"],
        cwd=VOICE_AGENT_DIR,
        env=os.environ.copy(),
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    atexit.register(_shutdown)
    try:
        signal.signal(signal.SIGTERM, _shutdown)
    except (ValueError, OSError):
        pass  # SIGTERM not available on Windows
    try:
        signal.signal(signal.SIGINT, _shutdown)
    except (ValueError, OSError):
        pass

    uvicorn.run(app, host="0.0.0.0", port=PORT)


if __name__ == "__main__":
    main()
