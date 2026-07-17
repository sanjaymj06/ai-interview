import time
from collections import defaultdict
from typing import Dict, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.config import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = None, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests or settings.RATE_LIMIT_PER_MINUTE
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup_old_requests(self, client_ip: str, now: float) -> None:
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip]
            if now - ts < self.window_seconds
        ]

    def _is_rate_limited(self, client_ip: str) -> Tuple[bool, int, int]:
        now = time.time()
        self._cleanup_old_requests(client_ip, now)
        request_count = len(self.requests[client_ip])
        if request_count >= self.max_requests:
            oldest = self.requests[client_ip][0]
            retry_after = int(self.window_seconds - (now - oldest)) + 1
            return True, request_count, retry_after
        self.requests[client_ip].append(now)
        return False, request_count + 1, 0

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if request.url.path in ("/api/health", "/docs", "/openapi.json", "/redoc"):
            return await call_next(request)
        client_ip = self._get_client_ip(request)
        is_limited, count, retry_after = self._is_rate_limited(client_ip)
        if is_limited:
            return Response(
                content='{"detail":"Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json",
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                },
            )
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(self.max_requests - count)
        return response
