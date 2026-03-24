"""
Logging configuration with structured logging.
"""
import logging
import sys
from typing import Optional
from pythonjsonlogger import jsonlogger


def setup_logging(
    level: str = "INFO",
    format_type: str = "json",
) -> None:
    """
    Configure application logging.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        format_type: Log format type ('json' or 'text')
    """
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    
    # Set formatter based on format type
    if format_type == "json":
        formatter = JsonFormatter()
    else:
        formatter = TextFormatter()
    
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Set loggers for specific modules
    logging.getLogger("uvicorn").setLevel("WARNING")
    logging.getLogger("asyncio").setLevel("WARNING")


class JsonFormatter(jsonlogger.JsonFormatter):
    """JSON log formatter for structured logging."""
    
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["timestamp"] = log_record.get("timestamp", record.created)


class TextFormatter(logging.Formatter):
    """Text log formatter for development."""
    
    format_string = (
        "%(asctime)s | %(levelname)-8s | %(name)s | "
        "%(message)s"
    )
    
    def __init__(self):
        super().__init__(
            fmt=self.format_string,
            datefmt="%Y-%m-%d %H:%M:%S",
        )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the given name.
    
    Usage:
        logger = get_logger(__name__)
        logger.info("Something happened")
    """
    return logging.getLogger(name)
