"""
In-memory rate limiter with sliding window.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import threading


class RateLimiter:
    """
    In-memory rate limiter using sliding window algorithm.
    
    Thread-safe implementation suitable for single-instance deployments.
    For production with multiple instances, consider Redis-based rate limiting.
    """
    
    def __init__(self, max_requests: int = 5, window_seconds: int = 900):
        """
        Initialize rate limiter.
        
        Args:
            max_requests: Maximum number of requests allowed in window
            window_seconds: Time window in seconds (default 900 = 15 minutes)
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[datetime]] = defaultdict(list)
        self._lock = threading.Lock()
    
    def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Check if request is allowed for given key.
        
        Args:
            key: Unique identifier (e.g., email, IP address)
        
        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        with self._lock:
            # Remove expired timestamps
            self._requests[key] = [
                ts for ts in self._requests[key]
                if ts > window_start
            ]
            
            # Check if under limit
            current_count = len(self._requests[key])
            remaining = self.max_requests - current_count
            
            if current_count < self.max_requests:
                # Add current request
                self._requests[key].append(now)
                return True, remaining - 1
            
            return False, 0
    
    def get_remaining(self, key: str) -> int:
        """
        Get remaining requests for key.
        
        Args:
            key: Unique identifier
        
        Returns:
            Number of remaining requests in current window
        """
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        with self._lock:
            # Count requests in current window
            count = sum(
                1 for ts in self._requests[key]
                if ts > window_start
            )
            
            return max(0, self.max_requests - count)
    
    def reset(self, key: str) -> None:
        """
        Reset rate limit for key.
        
        Args:
            key: Unique identifier to reset
        """
        with self._lock:
            self._requests[key] = []


# Global rate limiter instances
# Login rate limiter: 5 requests per 15 minutes per email
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=900)

# Register rate limiter: 10 requests per hour per IP
register_rate_limiter = RateLimiter(max_requests=10, window_seconds=3600)
