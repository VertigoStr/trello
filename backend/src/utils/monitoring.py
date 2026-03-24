"""
Performance monitoring decorators and utilities.
"""
import time
import asyncio
import logging
from functools import wraps
from typing import Callable, Any
from datetime import datetime

logger = logging.getLogger(__name__)


def timing_decorator(func: Callable = None, *, log_level: int = logging.INFO):
    """
    Decorator to measure function execution time.
    
    Usage:
        @timing_decorator
        async def my_function():
            ...
        
        @timing_decorator(log_level=logging.DEBUG)
        def sync_function():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                elapsed_time = time.time() - start_time
                logger.log(
                    log_level,
                    f"{func.__name__} executed in {elapsed_time:.4f}s"
                )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                elapsed_time = time.time() - start_time
                logger.log(
                    log_level,
                    f"{func.__name__} executed in {elapsed_time:.4f}s"
                )
        
        return async_wrapper if time.iscoroutinefunction(func) else sync_wrapper
    
    if func:
        return decorator(func)
    return decorator


def performance_monitor(func: Callable = None, *, threshold: float = 1.0):
    """
    Decorator to monitor and warn about slow function execution.
    
    Usage:
        @performance_monitor(threshold=0.5)  # Warn if > 500ms
        async def slow_function():
            ...
    
    Args:
        func: Function to decorate
        threshold: Time in seconds after which to log warning
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                return await func(*args, **kwargs)
            finally:
                elapsed_time = time.time() - start_time
                if elapsed_time > threshold:
                    logger.warning(
                        f"Slow execution detected: {func.__name__} "
                        f"took {elapsed_time:.4f}s (threshold: {threshold}s)"
                    )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                return func(*args, **kwargs)
            finally:
                elapsed_time = time.time() - start_time
                if elapsed_time > threshold:
                    logger.warning(
                        f"Slow execution detected: {func.__name__} "
                        f"took {elapsed_time:.4f}s (threshold: {threshold}s)"
                    )
        
        return async_wrapper if time.iscoroutinefunction(func) else sync_wrapper
    
    if func:
        return decorator(func)
    return decorator


def retry_decorator(
    max_attempts: int = 3,
    delay: float = 1.0,
    exceptions: tuple = (Exception,),
):
    """
    Decorator to retry function on failure.
    
    Usage:
        @retry_decorator(max_attempts=3, delay=0.5)
        async def flaky_function():
            ...
    
    Args:
        max_attempts: Maximum number of retry attempts
        delay: Delay between retries in seconds
        exceptions: Tuple of exceptions to catch and retry
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_attempts} failed for {func.__name__}: {e}"
                        )
                        await asyncio.sleep(delay)
            
            logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            import time
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_attempts} failed for {func.__name__}: {e}"
                        )
                        time.sleep(delay)
            
            logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            raise last_exception
        
        return async_wrapper if time.iscoroutinefunction(func) else sync_wrapper
    
    return decorator


class PerformanceMetrics:
    """
    Context manager for measuring code block performance.
    
    Usage:
        with PerformanceMetrics("database_query"):
            result = await db.execute(query)
    """
    
    def __init__(self, operation_name: str, log_level: int = logging.DEBUG):
        self.operation_name = operation_name
        self.log_level = log_level
        self.start_time: float = 0
    
    def __enter__(self) -> 'PerformanceMetrics':
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        elapsed_time = time.time() - self.start_time
        logger.log(
            self.log_level,
            f"{self.operation_name} completed in {elapsed_time:.4f}s"
        )
    
    @property
    def elapsed(self) -> float:
        """Get elapsed time since context entered."""
        return time.time() - self.start_time
