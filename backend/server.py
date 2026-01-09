"""
Proxy Backend pour Emergent Platform
Redirige les requêtes /api/* vers Next.js 3000
"""
import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEXTJS_URL = "http://localhost:3000"

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    """Proxy all requests to Next.js"""
    try:
        # Remove /api prefix if present (Emergent adds it)
        clean_path = path
        
        async with httpx.AsyncClient() as client:
            # Forward the request to Next.js
            url = f"{NEXTJS_URL}/{clean_path}"
            
            # Get body for non-GET requests
            body = None
            if request.method != "GET":
                body = await request.body()
            
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                content=body,
                follow_redirects=False,
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
    except Exception as e:
        return Response(
            content=str(e),
            status_code=500,
        )

@app.get("/health")
def health():
    return {"status": "ok"}
