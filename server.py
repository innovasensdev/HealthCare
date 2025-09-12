from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from bot import bot  # Import your existing bot function
from pipecat.runner.types import RunnerArguments

app = FastAPI()

# Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global bot runner task
bot_runner_task = None

@app.post("/client/connect")
async def connect():
    """
    Start Pipecat bot if not already running.
    Return a mock session for frontend to connect.
    """
    global bot_runner_task
    if not bot_runner_task:
        runner_args = RunnerArguments()  # Default args
        bot_runner_task = asyncio.create_task(bot(runner_args))

    # DailyTransport expects "url" + "token"
    # These are placeholders for local testing
    return {
        "url": "https://dummy-room.daily.co/fake-session",
        "token": "local-token-abc"
    }

@app.post("/client/command")
async def command(payload: dict):
    """Stub endpoint to accept frontend commands (customize as needed)."""
    # For now, just echo the command back
    return {"ok": True, "received": payload}

@app.get("/client/status")
async def status():
    """Optional endpoint to check bot status"""
    return {
        "status": "running" if bot_runner_task else "stopped"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
