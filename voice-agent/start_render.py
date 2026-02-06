"""
Run both the LiveKit agent and the token server for Render.
Token server starts first (so health checks get 200 quickly); agent starts in background.
Limits: WEB_CONCURRENCY=1 to reduce RAM on free tier.
"""
import os
import subprocess
import sys
import threading
import time
import urllib.request

def _wait_for_health(port: int, timeout: float = 60.0) -> bool:
    """Wait for token server to respond to GET /health so Render sees 200 quickly."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            req = urllib.request.Request(f"http://127.0.0.1:{port}/health", method="GET")
            with urllib.request.urlopen(req, timeout=2) as r:
                if r.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    agent_env = os.environ.copy()
    agent_env.setdefault("WEB_CONCURRENCY", "1")

    # Start token server in a thread so we can wait for it, then start agent
    def run_uvicorn():
        import uvicorn
        uvicorn.run(
            "token_server:app",
            host="0.0.0.0",
            port=port,
            log_level="info",
        )

    server_thread = threading.Thread(target=run_uvicorn, daemon=False)
    server_thread.start()

    # Give Render a 200 on health check as soon as possible (agent can start after)
    if _wait_for_health(port):
        pass  # server is up
    # Start agent in background (heavy; runs after server is already responding)
    agent_proc = subprocess.Popen(
        [sys.executable, "agent.py", "start"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=agent_env,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    server_thread.join()
