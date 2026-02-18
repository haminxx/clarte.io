"""
Run both the token server (FastAPI) and the LiveKit agent for Render.
One process: token server on PORT, agent in a background thread.
"""
import os
import sys
import threading

# Load env before importing agent (which uses LIVEKIT_*, OPENAI_*, EXA_*)
from dotenv import load_dotenv
load_dotenv()

# Render sets PORT
PORT = int(os.environ.get("PORT", 8080))


def run_agent():
    """Run the LiveKit agent (blocks until process exits)."""
    # #region agent log
    import json
    import time
    def _log(msg: str, data: dict | None = None):
        p = {"location": "start_render.py:run_agent", "message": msg, "data": data or {}, "timestamp": int(time.time() * 1000), "hypothesisId": "H1"}
        line = json.dumps(p) + "\n"
        base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        import tempfile
        for path in (os.environ.get("DEBUG_LOG_PATH"), os.path.join(base, ".cursor", "debug.log"), r"c:\Users\wildk\OneDrive\Important files\Project Source\App Development\Clarte.io\.cursor\debug.log", os.path.join(tempfile.gettempdir(), "clarte-agent.log")):
            if path:
                try:
                    d = os.path.dirname(path)
                    if d:
                        os.makedirs(d, exist_ok=True)
                    with open(path, "a", encoding="utf-8") as f:
                        f.write(line)
                    return
                except Exception:
                    pass
        print(f"[agent-dbg] {line.strip()}")
    _log("run_agent started")
    # #endregion
    try:
        from agent import server
        _log("agent import OK")
        from livekit import agents
        # Run agent in dev mode so it connects to LiveKit and waits for jobs
        sys.argv = ["agent.py", "start"]
        agents.cli.run_app(server)
    except Exception as e:
        _log("run_agent FAILED", {"error": str(e)})
        raise


def main():
    import uvicorn
    from token_server import app

    # Start agent in background so it registers with LiveKit
    agent_thread = threading.Thread(target=run_agent, daemon=True)
    agent_thread.start()

    # Run token server (handles /token and /health)
    uvicorn.run(app, host="0.0.0.0", port=PORT)


if __name__ == "__main__":
    main()
