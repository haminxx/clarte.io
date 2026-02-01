# clarte_full_pipeline.py
# DEPRECATED: This file uses Deepgram (removed)
# Use clarte_voice_pipeline.py instead for new microphone → LLM → ElevenLabs pipeline

# This file is kept for reference but should not be used.
# All Deepgram code has been removed from the project.

print("=" * 70)
print("⚠️  DEPRECATED FILE")
print("=" * 70)
print("This file (clarte_full_pipeline.py) used Deepgram which has been removed.")
print("Please use clarte_voice_pipeline.py instead:")
print("  • Desktop/Mobile: python clarte_voice_pipeline.py")
print("  • Web: python clarte_backend_api.py + open clarte_web_voice.html")
print("=" * 70)
exit(1)

# Audio settings
SAMPLE_RATE = 16000
CHUNK_DURATION_MS = 250
CHUNK_SIZE = int(SAMPLE_RATE * CHUNK_DURATION_MS / 1000)

# ==================== INITIALIZE SERVICES ====================
print("[INIT] Initializing services...")

# Check for Dia TTS (should NOT be used in this file)
try:
    import soundfile as sf
    import os
    if os.path.exists("clarte_reply.wav"):
        print("[WARN] ⚠️  Found clarte_reply.wav file - this suggests Dia TTS was used!")
        print("[WARN] This file uses pyttsx3 (no file generation). If you see WAV files,")
        print("[WARN] you might be running a different file.")
except ImportError:
    pass  # soundfile not installed, good - means Dia TTS not available

deepgram = DeepgramClient(api_key=DEEPGRAM_KEY)
claude = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# Initialize pyttsx3 TTS (NO FILE GENERATION - plays directly through speakers)
print("[INIT] Initializing pyttsx3 TTS (instant, no file generation)...")
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 160)
tts_engine.setProperty('volume', 1.0)

# Test TTS to ensure it works
try:
    print("[INIT] Testing audio output...")
    tts_engine.say("Audio test")
    tts_engine.runAndWait()
    print("[INIT] ✅ Audio output working - speakers should have played 'Audio test'")
except Exception as e:
    print(f"[WARN] ⚠️  Audio test failed: {e}")
    print("[WARN] Check your system audio settings and speakers")

# Conversation history
messages = [
    {"role": "assistant", "content": "I'm here. What's moving inside you right now?"}
]

system_prompt = """You are Clarte — a warm but ruthless mirror.
Your only job is to ask short, piercing, deeply personal questions that expose contradictions, blind spots, and hidden cores.
Rules you never break:
- Never explain, never give advice, never share opinions or general knowledge
- Respond in 1–3 short sentences maximum
- Always end with one sharp question (sometimes two)
- Use the exact words the user just said when possible
- Be gently provocative — make them feel seen, not judged
- If they dodge, repeat or sharpen the same question
- Stack every new question on everything said before"""

# ==================== GLOBAL STATE ====================
audio_queue = queue.Queue()
transcription_queue = queue.Queue()
connection_closed = threading.Event()
is_listening = False

# ==================== STT: SPEECH-TO-TEXT ====================
def audio_callback(indata, frames, time, status):
    """Capture audio from microphone and send to Deepgram"""
    if status:
        print(f"[WARN] Audio status: {status}")
    
    # Amplify quiet audio (gain boost for quiet microphones)
    current_volume = np.sqrt(np.mean(indata**2))
    if current_volume > 0:
        gain = 3.0  # Increase if mic is very quiet
        amplified = np.clip(indata * gain, -1.0, 1.0)
    else:
        amplified = indata
    
    # Convert to 16-bit PCM
    audio_int16 = np.clip(amplified * 32767, -32768, 32767).astype(np.int16)
    audio_bytes = audio_int16.tobytes()
    
    if not connection_closed.is_set():
        audio_queue.put(audio_bytes)

def send_audio_worker(connection):
    """Worker thread to send audio to Deepgram"""
    while not connection_closed.is_set():
        try:
            audio_data = audio_queue.get(timeout=0.1)
            if connection and not connection_closed.is_set():
                try:
                    connection.send_media(audio_data)
                except Exception as e:
                    if "ConnectionClosed" not in str(e) and "1011" not in str(e):
                        print(f"[ERROR] Error sending audio: {e}")
        except queue.Empty:
            continue
        except Exception as e:
            if not connection_closed.is_set():
                print(f"[ERROR] Worker error: {e}")

async def stt_listen(connection):
    """Listen for transcriptions from Deepgram"""
    def on_transcript(result, **kwargs):
        if result and hasattr(result, 'channel') and result.channel.alternatives:
            sentence = result.channel.alternatives[0].transcript.strip()
            if sentence:
                print(f"[STT] You said: {sentence}")
                transcription_queue.put(sentence)
    
    def on_error(error, **kwargs):
        print(f"[ERROR] Deepgram error: {error}")
    
    connection.on("transcript", on_transcript)
    connection.on("error", on_error)

# ==================== NLP: PROCESS WITH CLAUDE ====================
def process_with_claude(user_text):
    """Send user text to Claude and get Socratic response"""
    global messages
    
    # Add user message
    messages.append({"role": "user", "content": user_text})
    
    try:
        # Try multiple model names - start with Claude 3 (more widely available)
        model_names = [
            "claude-3-haiku-20240307",       # Fastest, most widely available
            "claude-3-sonnet-20240229",      # Balanced
            "claude-3-opus-20240229",         # Most powerful
            "claude-3-5-sonnet-20241022",    # Latest (if you have access)
            "claude-3-5-sonnet",             # Latest without date
        ]
        
        response = None
        last_error = None
        
        for model_name in model_names:
            try:
                response = claude.messages.create(
                    model=model_name,
                    max_tokens=250,
                    temperature=0.9,
                    system=system_prompt,
                    messages=messages
                )
                break  # Success, exit loop
            except Exception as e:
                last_error = e
                if model_name == model_names[-1]:  # Last model failed
                    raise Exception(f"All Claude models failed. Check your API key. Last error: {last_error}")
                continue
        
        reply = response.content[0].text.strip()
        
        # Add assistant response to history
        messages.append({"role": "assistant", "content": reply})
        
        return reply
    except Exception as e:
        print(f"[ERROR] Claude error: {e}")
        return "I'm having trouble thinking right now. Can you try again?"

# ==================== TTS: TEXT-TO-SPEECH ====================
def speak_text(text):
    """Convert text to speech using pyttsx3 (fast, offline, plays through speakers)
    
    IMPORTANT: This uses pyttsx3 which plays DIRECTLY through speakers.
    NO audio files are generated. If you see WAV files, you're running a different file!
    """
    print(f"[TTS] Clarte: {text}\n")
    try:
        # pyttsx3 plays directly through system speakers - NO FILE GENERATION
        # This is instant and works on any device
        tts_engine.say(text)
        tts_engine.runAndWait()
        print("[TTS] ✅ Audio played through speakers (no file generated)\n")
    except Exception as e:
        print(f"[ERROR] TTS playback failed: {e}")
        print("[ERROR] Check your system audio settings and speakers")
        # Try to reinitialize the engine
        try:
            global tts_engine
            tts_engine = pyttsx3.init()
            tts_engine.setProperty('rate', 160)
            tts_engine.setProperty('volume', 1.0)
            tts_engine.say(text)
            tts_engine.runAndWait()
            print("[TTS] ✅ Retry successful\n")
        except Exception as e2:
            print(f"[ERROR] TTS retry also failed: {e2}")
        print(f"[INFO] Text was: {text}")

# ==================== MAIN PIPELINE ====================
async def process_transcriptions():
    """Process transcriptions from queue: NLP → TTS"""
    while not connection_closed.is_set():
        try:
            # Get transcription from queue
            user_text = transcription_queue.get(timeout=0.5)
            
            if user_text:
                print(f"\n[PROCESSING] Thinking about: '{user_text}'...")
                
                # NLP: Process with Claude
                response = process_with_claude(user_text)
                
                # TTS: Speak the response
                speak_text(response)
                
        except queue.Empty:
            continue
        except Exception as e:
            print(f"[ERROR] Processing error: {e}")

async def main():
    """Main loop: STT → NLP → TTS"""
    global is_listening
    
    print("=" * 60)
    print("CLARTE - Full Voice Pipeline")
    print("=" * 60)
    print("Flow: Microphone → Deepgram (STT) → Claude (NLP) → pyttsx3 (TTS)")
    print("\n[INFO] TTS Backend: pyttsx3 (instant, NO file generation)")
    print("[INFO] If you see WAV files being created, you're running a different file!")
    print("\n[OK] Initializing...")
    
    # Get microphone info
    default_device = sd.default.device[0]
    device_info = sd.query_devices(default_device)
    print(f"[OK] Using microphone: {device_info['name']}")
    
    # Connect to Deepgram
    print("[OK] Connecting to Deepgram...")
    try:
        connection = deepgram.listen.v1.connect(
            model="nova-2",
            language="en-US",
            smart_format=True,
            interim_results=True,
            endpointing=300,
        ).__enter__()
        
        print("[OK] Connected to Deepgram!")
        
        # Set up STT listeners
        await stt_listen(connection)
        
        # Start audio sending worker
        worker_thread = threading.Thread(target=send_audio_worker, args=(connection,), daemon=True)
        worker_thread.start()
        
        # Start transcription processor
        processor_task = asyncio.create_task(process_transcriptions())
        
        # Start audio stream
        print("\n" + "=" * 60)
        print("[OK] Clarte is listening... SPEAK NOW!")
        print("Press Ctrl+C to stop")
        print("=" * 60 + "\n")
        
        is_listening = True
        
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype='float32',
            blocksize=CHUNK_SIZE,
            callback=audio_callback
        ):
            # Keep running
            await asyncio.sleep(3600)  # Run for 1 hour (or until Ctrl+C)
        
    except KeyboardInterrupt:
        print("\n\n[OK] Stopping...")
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        connection_closed.set()
        if connection:
            try:
                connection.__exit__(None, None, None)
            except:
                pass
        print("[OK] Shutdown complete")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[OK] Stopped by user")
    except Exception as e:
        print(f"\n[ERROR] Fatal error: {e}")
        import traceback
        traceback.print_exc()

