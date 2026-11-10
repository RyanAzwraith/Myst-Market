from fastapi import APIRouter, Depends

from app.api.dependencies import get_db
from app.api.paths import Paths
from app.core.Base import Base

from .schema import ItemResolution, ItemSummary

items_router = APIRouter()


# Resolve Items
class ResolveItemsResponse(Base):
    items: list[ItemResolution]
    total_cent: int

class ResolveItemsRequest(Base):
    items: list[ItemSummary]

@items_router.post(
    Paths.Items.resolve,
    status_code=200,
    response_model=ResolveItemsResponse,
)
async def resolve_items_handler(
    req: ResolveItemsRequest,
    db=Depends(get_db),
):
    items, total_cent = db.item.resolve(req.items)
    return ResolveItemsResponse(items=items, total_cent=total_cent)