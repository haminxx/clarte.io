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
    from agent import server
    from livekit import agents
    # Run agent in dev mode so it connects to LiveKit and waits for jobs
    sys.argv = ["agent.py", "start"]
    agents.cli.run_app(server)


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
