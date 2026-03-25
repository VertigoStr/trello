"""
Database cleanup script for soft-deleted tasks.

This script removes tasks that have been soft-deleted for more than 30 days.
Run periodically (e.g., daily via cron) to clean up old data.

Usage:
    python -m src.scripts.cleanup_tasks
"""
import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.db.database import DATABASE_URL
from src.models.task import Task

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def cleanup_soft_deleted_tasks(
    days_old: int = 30,
    batch_size: int = 1000,
) -> int:
    """
    Remove soft-deleted tasks older than specified days.
    
    Args:
        days_old: Remove tasks deleted more than this many days ago
        batch_size: Number of records to delete in each batch
    
    Returns:
        Number of deleted tasks
    """
    engine = create_async_engine(DATABASE_URL)
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    deleted_count = 0
    
    try:
        async with async_session_maker() as session:
            # Delete soft-deleted tasks older than cutoff date
            while True:
                # Get batch of soft-deleted tasks
                stmt = (
                    delete(Task)
                    .where(Task.is_deleted == True)
                    .where(Task.updated_at < cutoff_date)
                    .limit(batch_size)
                )
                
                result = await session.execute(stmt)
                await session.commit()
                
                batch_deleted = result.rowcount
                deleted_count += batch_deleted
                
                logger.info(f"Deleted {batch_deleted} soft-deleted tasks")
                
                # Stop if no more tasks to delete
                if batch_deleted < batch_size:
                    break
        
        logger.info(f"Cleanup complete. Total deleted: {deleted_count}")
        return deleted_count
    
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise
    finally:
        await engine.dispose()


async def cleanup_expired_tokens(
    hours_old: int = 24,
) -> int:
    """
    Remove expired tokens from blacklist.
    
    Args:
        hours_old: Remove tokens expired more than this many hours ago
    
    Returns:
        Number of deleted tokens
    """
    from src.models.token import AccessToken
    
    engine = create_async_engine(DATABASE_URL)
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    cutoff_date = datetime.utcnow() - timedelta(hours=hours_old)
    deleted_count = 0
    
    try:
        async with async_session_maker() as session:
            stmt = (
                delete(AccessToken)
                .where(AccessToken.expires_at < cutoff_date)
            )
            
            result = await session.execute(stmt)
            await session.commit()
            
            deleted_count = result.rowcount
        
        logger.info(f"Removed {deleted_count} expired tokens")
        return deleted_count
    
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise
    finally:
        await engine.dispose()


async def main():
    """Main cleanup function."""
    logger.info("Starting task cleanup...")
    
    # Clean soft-deleted tasks older than 30 days
    deleted = await cleanup_soft_deleted_tasks(days_old=30)
    
    # Clean expired tokens older than 24 hours
    tokens_deleted = await cleanup_expired_tokens(hours_old=24)
    
    logger.info(f"Cleanup finished. Deleted {deleted} tasks, {tokens_deleted} tokens.")


if __name__ == "__main__":
    asyncio.run(main())
