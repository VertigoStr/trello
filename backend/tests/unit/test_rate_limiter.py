"""
Unit tests for rate limiter.
"""
import pytest
import time
from src.middleware.rate_limiter import RateLimiter


class TestRateLimiter:
    """Tests for in-memory rate limiter."""
    
    def test_rate_limiter_allows_under_limit(self):
        """Test that requests under limit are allowed."""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        
        for i in range(5):
            is_allowed, remaining = limiter.is_allowed("user1")
            assert is_allowed is True
            assert remaining == 5 - i - 1
    
    def test_rate_limiter_blocks_over_limit(self):
        """Test that requests over limit are blocked."""
        limiter = RateLimiter(max_requests=3, window_seconds=60)
        
        # Make 3 requests
        for i in range(3):
            is_allowed, _ = limiter.is_allowed("user2")
            assert is_allowed is True
        
        # 4th request should be blocked
        is_allowed, remaining = limiter.is_allowed("user2")
        assert is_allowed is False
        assert remaining == 0
    
    def test_rate_limiter_different_keys(self):
        """Test that rate limiting is per-key."""
        limiter = RateLimiter(max_requests=2, window_seconds=60)
        
        # User 1 makes 2 requests
        limiter.is_allowed("user1")
        limiter.is_allowed("user1")
        
        # User 2 should still be allowed
        is_allowed, _ = limiter.is_allowed("user2")
        assert is_allowed is True
    
    def test_rate_limiter_window_expires(self):
        """Test that rate limit resets after window expires."""
        limiter = RateLimiter(max_requests=2, window_seconds=1)  # 1 second window
        
        # Make 2 requests
        limiter.is_allowed("user3")
        limiter.is_allowed("user3")
        
        # Should be blocked
        is_allowed, _ = limiter.is_allowed("user3")
        assert is_allowed is False
        
        # Wait for window to expire
        time.sleep(1.1)
        
        # Should be allowed again
        is_allowed, remaining = limiter.is_allowed("user3")
        assert is_allowed is True
        assert remaining == 1
    
    def test_rate_limiter_sliding_window(self):
        """Test sliding window behavior."""
        limiter = RateLimiter(max_requests=3, window_seconds=2)
        
        # Make 2 requests at t=0
        limiter.is_allowed("user4")
        limiter.is_allowed("user4")
        
        # Wait 1 second
        time.sleep(1)
        
        # Make 1 more request at t=1
        limiter.is_allowed("user4")
        
        # Should be at limit now
        is_allowed, _ = limiter.is_allowed("user4")
        assert is_allowed is False
        
        # Wait 1.1 more seconds (first 2 requests should expire)
        time.sleep(1.1)
        
        # Should be allowed again (only 1 request in current window)
        is_allowed, remaining = limiter.is_allowed("user4")
        assert is_allowed is True
