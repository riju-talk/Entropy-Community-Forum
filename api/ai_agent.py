import os
import sys

# Ensure the ai-agent app directory is on sys.path so we can import the FastAPI app
ROOT = os.path.dirname(os.path.dirname(__file__))
APP_PATH = os.path.join(ROOT, 'apps', 'ai-agent', 'app')
if APP_PATH not in sys.path:
    sys.path.insert(0, APP_PATH)

try:
    # The app's main module should expose `app` (FastAPI instance)
    from main import app
except Exception as e:
    # If import fails, raise a clear error so Vercel logs show it
    raise RuntimeError(f"Failed to import FastAPI app from apps/ai-agent/app/main.py: {e}")

from mangum import Mangum

# Mangum handler for Vercel to call
handler = Mangum(app)
