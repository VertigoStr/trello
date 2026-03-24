"""
Database connection module with get_db dependency.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session.
    
    Usage:
        @router.post("/")
        async def create_something(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_db_sync():
    """
    Synchronous database session getter (for tests).
    """
    return async_session_maker()
