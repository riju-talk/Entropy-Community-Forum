Deploying the `ai-agent` backend (recommended separate service)

Why separate deploy?
- Vercel serverless functions have a size limit for unzipped functions. The `ai-agent`'s `requirements.txt` pulls in large native packages (ONNX, chromadb, gpt4all, etc.) which exceed that limit.
- Deploying the backend as a standalone service (Render, Railway, Fly, or a container host) avoids the serverless size constraint and is better for long-running ML workloads.

Quick Docker build & run (local test):

```powershell
# From repo root
docker build -t entropy-ai-agent:latest -f apps/ai-agent/Dockerfile apps/ai-agent
docker run -p 8080:8080 -e PORT=8080 entropy-ai-agent:latest
```

Recommended hosts:
- Render: create a new Web Service using Docker, point to your GitHub repo and the `apps/ai-agent` Dockerfile.
- Railway / Fly / Fly.io: similar Docker-based deployment works.

Environment variables:
- Copy any `.env` values used by the backend (OPENAI_API_KEY, CHROMA_* etc.) into the host's environment configuration.

Optional improvements:
- Remove heavy optional packages (e.g. `gpt4all`, `onnxruntime`) from `requirements.txt` if you don't need them in production to reduce image size.
- Use multi-stage Dockerfile or explicitly pin only the packages your runtime actually uses.

Proxying from the Next.js frontend (apps/app):
- Keep the Next.js app deployed on Vercel.
- Set `NEXT_PUBLIC_API_URL` to the public URL of the deployed `ai-agent` service so frontend API calls go there instead of trying to run the Python backend inside a Vercel function.

If you prefer serverless on Vercel:
- You must reduce the function size below Vercel limits by slimming `requirements.txt` drastically (keep only very small deps like `fastapi` and `mangum`) and move heavy logic into other hosted services or external APIs.

Next steps I can do for you:
- Create a minimal `requirements-min.txt` and a tiny Python shim to serve limited features from Vercel (if you want a serverless approach).
- Create a GitHub Actions workflow that builds and deploys the Docker image to Render or Docker Hub.
# Deployment Guide for AI Agent Backend

## Architecture

