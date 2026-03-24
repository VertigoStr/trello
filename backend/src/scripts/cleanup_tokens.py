"""
Database cleanup script for expired tokens.

This script removes expired tokens from the access_tokens table.
Run periodically (e.g., daily via cron) to clean up old data.

Usage:
    python -m src.scripts.cleanup_tokens
"""
import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.db.database import DATABASE_URL, Base
from src.models.token import AccessToken

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def cleanup_expired_tokens(
    days_old: int = 7,
    batch_size: int = 1000,
) -> int:
    """
    Remove expired tokens older than specified days.
    
    Args:
        days_old: Remove tokens expired more than this many days ago
        batch_size: Number of records to delete in each batch
    
    Returns:
        Number of deleted tokens
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
            # Delete expired tokens in batches
            while True:
                # Get batch of expired tokens
                stmt = (
                    delete(AccessToken)
                    .where(AccessToken.expires_at < cutoff_date)
                    .execution_options(synchronize_session=False)
                    .limit(batch_size)
                )
                
                result = await session.execute(stmt)
                await session.commit()
                
                batch_deleted = result.rowcount
                deleted_count += batch_deleted
                
                logger.info(f"Deleted {batch_deleted} expired tokens")
                
                # Stop if no more tokens to delete
                if batch_deleted < batch_size:
                    break
        
        logger.info(f"Cleanup complete. Total deleted: {deleted_count}")
        return deleted_count
    
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise
    finally:
        await engine.dispose()


async def cleanup_old_blacklisted_tokens(
    hours_old: int = 24,
) -> int:
    """
    Remove old blacklisted tokens (for maintenance).
    
    Args:
        hours_old: Remove tokens revoked more than this many hours ago
    
    Returns:
        Number of deleted tokens
    """
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
                .where(AccessToken.revoked_at < cutoff_date)
                .execution_options(synchronize_session=False)
            )
            
            result = await session.execute(stmt)
            await session.commit()
            
            deleted_count = result.rowcount
        
        logger.info(f"Removed {deleted_count} old blacklisted tokens")
        return deleted_count
    
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise
    finally:
        await engine.dispose()


async def main():
    """Main cleanup function."""
    logger.info("Starting token cleanup...")
    
    # Clean expired tokens older than 7 days
    deleted = await cleanup_expired_tokens(days_old=7)
    
    logger.info(f"Cleanup finished. Deleted {deleted} tokens.")


if __name__ == "__main__":
    asyncio.run(main())
