############################################################################################
######################################## Installation ######################################
############################################################################################
#git clone https://github.com/pipecat-ai/pipecat-quickstart.git
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

import os
import warnings
from datetime import datetime
from typing import Optional

import aiohttp
import httpx
from dotenv import load_dotenv
from loguru import logger
from openai.types.chat import ChatCompletionSystemMessageParam
from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import (
    Frame,
    TextFrame,
    TTSSpeakFrame,
    UserImageRawFrame,
    UserImageRequestFrame, LLMContextFrame,
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext, OpenAILLMContextFrame
from pipecat.processors.aggregators.user_response import UserResponseAggregator
from pipecat.processors.filters.wake_check_filter import WakeCheckFilter
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import (
    create_transport,
    get_transport_client_id,
    maybe_capture_participant_camera,
)
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.elevenlabs import ElevenLabsTTSService
from pipecat.services.llm_service import FunctionCallParams
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.daily.transport import DailyParams
from pipecat.services.whisper.stt import WhisperSTTService, Model
from pipecat.services.deepgram.stt import DeepgramSTTService, LiveOptions
from pipecat.transcriptions.language import Language
from pipecat.services.heygen.api import AvatarQuality, NewSessionRequest
from pipecat.services.heygen.video import HeyGenVideoService

warnings.filterwarnings("ignore", category=RuntimeWarning, module="faster_whisper.feature_extractor")
load_dotenv(override=True)


class UserImageRequester(FrameProcessor):
    """Converts incoming text into requests for user images."""

    def __init__(self, participant_id: Optional[str] = None):
        super().__init__()
        self._participant_id = participant_id

    def set_participant_id(self, participant_id: str):
        self._participant_id = participant_id

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if self._participant_id and isinstance(frame, TextFrame):
            await self.push_frame(
                UserImageRequestFrame(self._participant_id, context=frame.text),
                FrameDirection.UPSTREAM,
            )
        else:
            await self.push_frame(frame, direction)



class UserImageProcessor(FrameProcessor):
    """Converts incoming user images into context frames."""

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, UserImageRawFrame):
            if frame.request and frame.request.context:
                context = LLMContext()
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
        # Initialize the image requester without setting the participant ID yet
        image_requester = UserImageRequester()
        image_processor = UserImageProcessor()

        # Initialize the LLM context first
        messages = [
            ChatCompletionSystemMessageParam(
                role="system",
                content=(
                    "You are a helpful medical assistant. "
                    "Speak naturally and conversationally. "
                    "Keep responses concise."
                    "Speak in a natural way omitting any unnecessary words such as 1., #, etc."
                    "If the user asks a medical question or a question related to health, then call the `medical_assistant` tool with a concise `query`."
                ),
            )
        ]

        # Define function schema
        assistant = FunctionSchema(
            name="medical_assistant",
            description="Get information from the medical assistant (n8n webhook).",
            properties={
                "query": {
                    "type": "string",
                    "description": "User query to forward to n8n"
                }
            },
            required=["query"]
        )
        tools = ToolsSchema(standard_tools=[assistant])
        context = OpenAILLMContext(messages=messages, tools=tools)

        # stt = DeepgramSTTService(
        #     api_key=os.getenv("DEEPGRAM_API_KEY"),
        #     live_options=LiveOptions(
        #         model="nova-3-general",
        #         language=Language.EN,
        #         smart_format=True,
        #         # interim_results = True,
        #     )
        # )
        stt = WhisperSTTService(
            model=Model.SMALL,
            no_speech_prob=0.7,  # Higher threshold to reduce false positives
            language=Language.EN,
            vad_filter=True,  # Enable VAD filtering
        )
        # OpenAI GPT-4o with optimized parameters
        openai = OpenAILLMService(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
            params=OpenAILLMService.InputParams(
                temperature=0.7,
                max_tokens=100,  # Limit response length
            )
        )
        tts = CartesiaTTSService(
            api_key=os.getenv("CARTESIA_API_KEY"),
            voice_id="5ee9feff-1265-424a-9d7f-8e4d431a12c7",  # f9836c6e-a0bd-460e-9d3c-f7299fa60f94
            model="sonic-2",
            params=CartesiaTTSService.InputParams(
                language=Language.EN,
                speed="fast"
            ),
        )
        heyGen = HeyGenVideoService(
            api_key=os.getenv("HEYGEN_API_KEY"),
            session=session,
            session_request=NewSessionRequest(
                avatar_id="Shawn_Therapist_public", version="v2", quality=AvatarQuality.medium
            ),
        )
        # Create filter with wake phrases
        wake_filter = WakeCheckFilter(
            wake_phrases=["Hi Sofia", "hey Sofia", "ok Sofia"],
            keepalive_timeout=30.0,  # Reduced timeout
        )

        ########################################################################################
        ##################################### Function Calling #################################
        ########################################################################################
        N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL')
        N8N_USER = os.getenv('N8N_USER')
        N8N_PASS = os.getenv('N8N_PASS')

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
                async with httpx.AsyncClient(timeout=15) as client:  # Reduced timeout
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
        context_aggregator = openai.create_context_aggregator(context)

        ########################################################################################
        ################################# Pipeline Configuration ###############################
        ########################################################################################
        rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

        pipeline = Pipeline(
            [
                transport.input(),
                rtvi,
                stt,
                # wake_filter,
                image_requester,
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
                    "conversation_id": "conv-1",
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

            await maybe_capture_participant_camera(transport, client)
            client_id = get_transport_client_id(transport, client)
            image_requester.set_participant_id(client_id)

            # Quick welcome message
            # await task.queue_frame(TTSSpeakFrame("Hello! I'm ready to help."))

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
            vad_analyzer=SileroVADAnalyzer(),
        ),
        "webrtc": lambda: TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_in_enabled=True,
            video_out_enabled=True,
            video_out_is_live=True,
            video_out_width=1280,
            video_out_height=720,
            vad_analyzer=SileroVADAnalyzer(),
        ),
    }
    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()