"""
Run both the LiveKit agent and the token server in one process for Render.
Agent runs in a subprocess; uvicorn runs in the main process (so Render can send HTTP to it).
"""
import os
import subprocess
import sys

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    # Start agent in background (connects to LiveKit, joins rooms)
    agent_proc = subprocess.Popen(
        [sys.executable, "agent.py", "start"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=os.environ.copy(),
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    # Run token server in foreground so Render routes HTTP here
    import uvicorn
    uvicorn.run(
        "token_server:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
    )
