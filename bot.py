############################################################################################
######################################## Installation ######################################
############################################################################################
# git clone https://github.com/pipecat-ai/pipecat-quickstart.git
# uv sync
# uv run botVision.py
# Deploy to Production
# docker login
# File: pcc-deploy.toml # bot’s name in Pipecat Cloud
# agent_name = "botVision"
# image = "DOCKERHUB_USERNAME:0.1" # Docker image to deploy (format: username/image:version)
# secret_set = "quickstart-secrets" # Where API keys are stored securely
# [scaling]
#   min_agents = 1 # Number of bot instances to keep ready (1 = instant start)
# Terminal Run
# uv run pcc secrets set quickstart-secrets --file .env
# uv run pcc docker build-push
# uv run pcc deploy # Deploy on Pipecat Cloud: https://pipecat.daily.co
# pip install --upgrade certifi
# export SSL_CERT_FILE=$(python -m certifi)
# /Applications/Python\ 3.13/Install\ Certificates.command
# uv add "pipecat-ai[whisper]"
# uv add -U aiortc
# uv add "pipecat-ai[heygen]"
# uv add "pipecat-ai[elevenlabs]"
# uv add ffmpeg => important
# uv add "pipecat-ai[remote-smart-turn]"
# pip install "pipecat-ai[local-smart-turn-v3]"clear

import os
import httpx
import aiohttp
import warnings
from loguru import logger
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.audio.turn.smart_turn.base_smart_turn import SmartTurnParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

from SystemPrompt import system_prompt

from openai.types.chat import ChatCompletionSystemMessageParam

from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema
from pipecat.audio.vad.silero import SileroVADAnalyzer

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext, OpenAILLMContextFrame
from pipecat.processors.aggregators.user_response import UserResponseAggregator
from pipecat.processors.filters.wake_check_filter import WakeCheckFilter
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor

from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig, RTVIObserver
from pipecat.runner.types import RunnerArguments
from pipecat.services.cartesia.stt import CartesiaLiveOptions, CartesiaSTTService
from pipecat.services.cartesia.tts import CartesiaTTSService  # Needed for audio output
from pipecat.services.llm_service import FunctionCallParams
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.transcriptions.language import Language
from pipecat.services.heygen.api import AvatarQuality, NewSessionRequest
from pipecat.services.heygen.video import HeyGenVideoService
from pipecat.frames.frames import (
    Frame, TextFrame, TTSSpeakFrame, UserImageRawFrame,
    UserImageRequestFrame, LLMContextFrame, BotStartedSpeakingFrame, LLMRunFrame)
from pipecat.runner.utils import (
    create_transport, get_transport_client_id, maybe_capture_participant_camera)

warnings.filterwarnings("ignore", category=RuntimeWarning, module="faster_whisper.feature_extractor")
load_dotenv(override=True)


class UserImageRequester(FrameProcessor):
    """Converts incoming text into requests for user images ONLY when patient asks to show something."""

    def __init__(self, participant_id: Optional[str] = None):
        super().__init__()
        self._participant_id = participant_id

    def set_participant_id(self, participant_id: str):
        self._participant_id = participant_id

    def _should_request_image(self, text: str) -> bool:
        """Check if the text indicates patient wants to show something visually."""
        visual_keywords = [
            "can you see", "look at", "show you", "see it", "see this",
            "look at this", "see my", "look at my", "show me", "visible",
            "bruise", "rash", "swelling", "wound", "cut", "injury"
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in visual_keywords)

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if self._participant_id and isinstance(frame, TextFrame):
            # Only request image if patient is asking to show something
            if self._should_request_image(frame.text):
                logger.info(f"Visual examination requested: {frame.text}")
                await self.push_frame(
                    UserImageRequestFrame(self._participant_id, context=frame.text),
                    FrameDirection.UPSTREAM,
                )
                # Don't pass the text frame through when requesting image to avoid double response
                return

        await self.push_frame(frame, direction)


class UserImageProcessor(FrameProcessor):
    """Converts incoming user images into context frames."""

    def __init__(self):
        super().__init__()

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, UserImageRawFrame):
            logger.info(f"Processing user image for visual examination")
            if frame.request and frame.request.context:
                # Create context that includes the system prompt with the image
                context = LLMContext()

                # Add a system message to ensure proper behavior with images
                context.add_message({
                    "role": "system",
                    "content": f"{system_prompt()}\n\nThe patient is showing you an image and asking: {frame.request.context}"
                })

                # Add the image message
                context.add_image_frame_message(
                    image=frame.image,
                    text=frame.request.context,
                    size=frame.size,
                    format=frame.format,
                )

                frame = LLMContextFrame(context)
                await self.push_frame(frame)
        else:
            await self.push_frame(frame, direction)


async def run_bot(transport: BaseTransport, runner_args: RunnerArguments):
    logger.info(f"Starting optimized bot")
    async with aiohttp.ClientSession() as session:
        ########################################################################################
        ####################################### AI Services ####################################
        ########################################################################################
        user_response = UserResponseAggregator()
        # Smart image processing - only when the patient asks to show something
        image_requester = UserImageRequester()
        image_processor = UserImageProcessor()

        # Custom configuration with live options
        live_options = CartesiaLiveOptions(
            model="ink-whisper",
            language=Language.EN,
        )
        stt = CartesiaSTTService(
            api_key=os.getenv("CARTESIA_API_KEY"),
            base_url="api.cartesia.ai",
            live_options=live_options,
            streaming=True,
        )
        openai = OpenAILLMService(
            model="gpt-4o",  # Using gpt-4o for full vision capabilities
            api_key=os.getenv("OPENAI_API_KEY"),
            params=OpenAILLMService.InputParams(
                temperature=0.3,  # Increased temperature to allow more helpful responses
                max_tokens=150,  # Reduced tokens for more concise responses
            )
        )
        # TTS for audio output - HeyGen handles video, Cartesia handles audio
        tts = CartesiaTTSService(
            api_key=os.getenv("CARTESIA_API_KEY"),
            voice_id="f9836c6e-a0bd-460e-9d3c-f7299fa60f94",
            # f9836c6e-a0bd-460e-9d3c-f7299fa60f94, 5ee9feff-1265-424a-9d7f-8e4d431a12c7
            model="sonic-2",
            params=CartesiaTTSService.InputParams(
                language=Language.EN,
                speed="fast"
            ),
            aggregate_sentences=False,
        )
        heyGen = HeyGenVideoService(
            api_key=os.getenv("HEYGEN_API_KEY"),
            session=session,
            session_request=NewSessionRequest(
                avatar_id="Katya_Chair_Sitting_public",
                version="v2",
                quality=AvatarQuality.medium,
                # voice_id="your_preferred_voice_id",
            ),
        )
        ########################################################################################
        ##################################### Function Calling #################################
        ########################################################################################
        N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL')
        N8N_USER = os.getenv('N8N_USER')
        N8N_PASS = os.getenv('N8N_PASS')

        # Define function schema
        assistant = FunctionSchema(
            name="medical_assistant",
            description="Get information from the medical assistant.",
            properties={
                "query": {
                    "type": "string",
                    "description": "User query to forward to the webhook"
                }
            },
            required=["query"]
        )
        tools = ToolsSchema(standard_tools=[assistant])
        # Initialize the LLM context first
        messages = [
            ChatCompletionSystemMessageParam(
                role="system",
                content=system_prompt()
            )
        ]
        context = OpenAILLMContext(messages=messages, tools=tools)
        context_aggregator = openai.create_context_aggregator(context)

        async def medical_assistant(params: FunctionCallParams):
            # Immediately send a holding message
            await task.queue_frame(TTSSpeakFrame("Ok."))
            query = None
            if isinstance(params.arguments, dict):
                query = params.arguments.get("query")
            if not query:
                await params.result_callback({"error": "missing 'query' argument"})
                return

            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    resp = await client.get(
                        N8N_WEBHOOK_URL,
                        params={"query": query},
                        auth=(N8N_USER, N8N_PASS),
                        headers={"Accept": "application/json"},
                    )
                resp.raise_for_status()

                try:
                    data = resp.json()
                except ValueError:
                    data = {"text": resp.text}
                await params.result_callback(data)
            except Exception as e:
                await params.result_callback({"error": str(e)})

        openai.register_function("medical_assistant", medical_assistant)

        ########################################################################################
        ################################# Pipeline Configuration ###############################
        ########################################################################################
        rtvi = RTVIProcessor(config=RTVIConfig(config=[]))
        pipeline = Pipeline(
            [
                transport.input(),
                rtvi,
                stt,
                image_requester,  # only triggers when the patient asks to show something
                image_processor,
                context_aggregator.user(),
                user_response,
                openai,
                tts,
                heyGen,
                transport.output(),
                context_aggregator.assistant(),
            ]
        )
        task = PipelineTask(
            pipeline,
            params=PipelineParams(
                enable_metrics=True,
                enable_usage_metrics=True,
                allow_interruptions=True,
                audio_in_sample_rate=16000,
                audio_out_sample_rate=24000,
                enable_heartbeats=True,
                heartbeats_period_secs=2.0,
                start_metadata={
                    "conversation_id": "conv-7",
                    "session_data": {
                        "user_id": "user-samuel",
                        "start_time": datetime.now(),
                    }
                },
            ),
            idle_timeout_secs=300,  # Reduced timeout
            cancel_on_idle_timeout=False,
            observers=[RTVIObserver(rtvi)],
        )
        ########################################################################################
        ##################################### Event Handlers ###################################
        ########################################################################################
        @transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            logger.info(f"Client connected: {client}")

            # Enable camera for visual examination when requested
            await maybe_capture_participant_camera(transport, client)
            client_id = get_transport_client_id(transport, client)
            image_requester.set_participant_id(client_id)

            # Introduction
            await task.queue_frame(TTSSpeakFrame(
                "Hello! I'm Dr. Sarah, and I'm here to help you with your health concerns. What symptoms are you experiencing today?"))

            # Kick off the conversation - let the main system prompt handle the greeting
            await task.queue_frames([LLMRunFrame()])

        @transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            logger.info(f"Client disconnected")
            await task.cancel()

        @task.event_handler("on_idle_timeout")
        async def on_idle_timeout(task):
            logger.info("Pipeline idle timeout")

        ########################################################################################
        ################################## Running the Pipeline ################################
        ########################################################################################
        runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)
        await runner.run(task)

############################################################################################
###################################### Bot Entry Point #####################################
############################################################################################
async def bot(runner_args: RunnerArguments):
    """Main bot entry point compatible with Pipecat Cloud."""
    transport_params = {
        "daily": lambda: DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_in_enabled=True,
            video_out_enabled=True,
            video_out_is_live=True,
            video_out_width=1280,
            video_out_height=720,
            video_out_bitrate=2_000_000,
            vad_analyzer=SileroVADAnalyzer(
                params=VADParams(stop_secs=0.2),
            ),
            turn_analyzer=LocalSmartTurnAnalyzerV3(
                params=SmartTurnParams(
                    stop_secs=2.0,
                    pre_speech_ms=900,  # e.g. 900 ms
                    max_duration_secs=30.0  # e.g. 30 seconds
                )
            ),
        ),
        "webrtc": lambda: TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_in_enabled=True,
            video_out_enabled=True,
            video_out_is_live=True,
            video_out_width=1280,
            video_out_height=720,
            vad_analyzer=SileroVADAnalyzer(
                params=VADParams(stop_secs=0.2),
            ),
            turn_analyzer=LocalSmartTurnAnalyzerV3(
                params=SmartTurnParams(
                    stop_secs=2.0,
                    pre_speech_ms=900,
                    max_duration_secs=30.0
                )
            ),
        ),
    }
    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()