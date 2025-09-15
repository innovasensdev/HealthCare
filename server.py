import os
import asyncio
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware to allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClientCommand(BaseModel):
    command: str
    data: dict = {}

class OfferData(BaseModel):
    sdp: str
    type: str = "offer"

class WebRTCOffer(BaseModel):
    sdp: str
    type: str = "offer"

@app.get("/")
async def root():
    return {"message": "Pipecat Quickstart Backend"}

@app.post("/api/offer")
async def api_offer(offer: WebRTCOffer):
    """Handle WebRTC offer from PipecatService - forward to bot.py."""
    try:
        print(f"📡 Received WebRTC offer: {offer.sdp[:100]}...")
        
        # Forward the offer to your bot.py running on port 7860
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://localhost:7860/api/offer",
                    json={"sdp": offer.sdp, "type": offer.type},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    bot_response = response.json()
                    print(f"✅ Bot response: {bot_response}")
                    return bot_response
                else:
                    print(f"⚠️ Bot returned status {response.status_code}")
                    return {"error": f"Bot returned status {response.status_code}"}
                    
            except httpx.ConnectError as e:
                print(f"⚠️ Bot.py not running on port 7860: {e}")
                return {"error": "Bot.py not running"}
            except Exception as e:
                print(f"⚠️ Error connecting to bot: {e}")
                return {"error": str(e)}
        
    except Exception as e:
        print(f"❌ Error processing offer: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

@app.post("/client/connect")
async def client_connect():
    """Simulate client connection to Pipecat."""
    return {
        "url": "https://dummy-room.daily.co/fake-session",
        "token": "local-token-abc"
    }

@app.post("/client/command")
async def client_command(command: ClientCommand):
    """Handle client commands."""
    return {"status": "received", "command": command.command, "data": command.data}

@app.get("/client/status")
async def client_status():
    """Get client status."""
    return {"status": "connected", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/doctor/stream")
async def doctor_stream():
    """Return a static Heygen stream URL for testing."""
    return {"url": os.getenv("HEYGEN_STREAM_URL", "")}
    
@app.post("/start-session")
async def start_session():
    """Start a HeyGen session - check if bot.py is running."""
    try:
        api_key = os.getenv("HEYGEN_API_KEY")
        if not api_key:
            return {
                "error": "HeyGen API key not found",
                "status": "error"
            }
        
        print(f"🚀 Starting HeyGen session with API key: {api_key[:10]}...")
        
        # Check if bot.py is running by testing the /api/offer endpoint
        async with httpx.AsyncClient() as client:
            try:
                print("🔍 Testing bot.py connection...")
                response = await client.post(
                    "http://localhost:7860/api/offer",
                    json={"sdp": "test", "type": "offer"},
                    timeout=5.0
                )
                
                print(f"📊 Bot response status: {response.status_code}")
                
                if response.status_code == 200:
                    bot_data = response.json()
                    print(f"✅ Bot.py is running and responding: {bot_data}")
                    return {
                        "status": "success",
                        "session_id": "bot-session-123",
                        "stream_url": None,
                        "sdp": None,
                        "type": "offer",
                        "message": "Bot.py is running - HeyGen streaming will be handled through WebRTC",
                        "bot_running": True,
                        "api_key_set": True
                    }
                else:
                    print(f"❌ Bot returned status {response.status_code}")
                    return {
                        "status": "error",
                        "error": f"Bot.py returned status {response.status_code}",
                        "bot_running": False
                    }
                    
            except httpx.ConnectError as e:
                print(f"⚠️ Bot.py not running on port 7860: {e}")
                return {
                    "status": "error",
                    "error": "Bot.py is not running. Please start bot.py first to enable HeyGen streaming.",
                    "message": "Start your bot.py with: python3 bot.py",
                    "bot_running": False
                }
            except httpx.TimeoutException as e:
                print(f"⚠️ Bot.py timeout: {e}")
                return {
                    "status": "error",
                    "error": "Bot.py is not responding (timeout). Please check if bot.py is running.",
                    "bot_running": False
                }
            except Exception as e:
                print(f"⚠️ Error checking bot: {e}")
                return {
                    "status": "error",
                    "error": f"Error connecting to bot.py: {str(e)}",
                    "bot_running": False
                }
        
    except Exception as e:
        print(f"❌ Error creating HeyGen session: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

@app.post("/accept-offer")
async def accept_offer(offer: OfferData):
    """Accept WebRTC offer from client."""
    try:
        print(f"📡 Received WebRTC offer: {offer.sdp[:100]}...")
        
        # Here you would typically process the offer with HeyGen
        # For now, return a simple response
        return {
            "status": "accepted",
            "message": "Offer processed successfully"
        }
        
    except Exception as e:
        print(f"❌ Error processing offer: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

@app.post("/doctor/stream")
async def doctor_stream_start(body: dict | None = None):
    """Generate a Heygen video - this should connect to your bot.py."""
    try:
        api_key = os.getenv("HEYGEN_API_KEY")
        if not api_key:
            return {
                "error": "HeyGen API key not found",
                "status": "error"
            }
        
        # Check if bot.py is running and return its stream
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://localhost:7860/api/offer",
                    json={"sdp": "test", "type": "offer"},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return {
                        "url": None,
                        "status": "ready",
                        "message": "Connected to bot.py HeyGen stream",
                        "bot_running": True
                    }
            except httpx.ConnectError as e:
                print(f"⚠️ Bot.py not running: {e}")
            except Exception as e:
                print(f"⚠️ Error connecting to bot: {e}")
        
        return {
            "error": "Bot.py is not running. Please start bot.py first.",
            "status": "error",
            "bot_running": False
        }
        
    except Exception as e:
        print(f"❌ Error in doctor stream: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

@app.post("/api/test-speech")
async def test_speech(request: dict):
    """Test endpoint to trigger bot speech"""
    try:
        print(f"🗣️ Test speech requested: {request.get('message', 'No message')}")
        # For now, just return success - in a real implementation, 
        # this would send a message to the bot to speak
        return {"status": "success", "message": "Speech test triggered"}
    except Exception as e:
        print(f"❌ Error in test speech: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7861)  # Server on 7861, bot.py on 7860
