from fastapi import APIRouter, Depends

from app.api.dependencies import get_admin_user, get_db
from app.api.paths import Paths
from app.core.Base import Base
from app.features.order.schema import Status

from .schema import Attention, GraphPoint, Performance, Stats

app_router = APIRouter()


# Get Stats
class GetStatsResponse(Base):
    stats: Stats

@app_router.get(
    Paths.App.stats,
    status_code=200,
    response_model=GetStatsResponse,
)
async def get_stats_handler(
    db=Depends(get_db),
):
    return GetStatsResponse(
        stats=Stats(
            product_count=db.product.count(),
            customer_count=db.user.count_customers(),
            total_average_rating=db.review.get_average_rating(),
        )
    )


# Get Attention
class GetAttentionResponse(Base):
    attention: Attention

@app_router.get(
    Paths.App.attention,
    status_code=200,
    response_model=GetAttentionResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_attention_handler(
    db=Depends(get_db),
):
    return GetAttentionResponse(
        attention=Attention(
            pending_orders=db.order.count_by_status(Status.pending.value),
            out_of_stock_products=db.product.count_out_of_stock(),
            sales_ending=db.sale.count_ending_within(7),
        )
    )


# Get Graph
class GetGraphResponse(Base):
    graph_points: list[GraphPoint]

@app_router.get(
    Paths.App.graph,
    status_code=200,
    response_model=GetGraphResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_graph_handler(
    db=Depends(get_db),
):
    return GetGraphResponse(
        graph_points=db.order.get_graph(12)
    )


# Retrieve Performance
class RetrievePerformanceResponse(Base):
    performance: Performance

class RetrievePerformanceRequest(Base):
    period: int

@app_router.post(
    Paths.App.performance,
    status_code=200,
    response_model=RetrievePerformanceResponse,
    dependencies=[Depends(get_admin_user)],
)
async def retrieve_performance_handler(
    req: RetrievePerformanceRequest,
    db=Depends(get_db),
):
    return RetrievePerformanceResponse(
        performance=db.order.get_performance(req.period)
    )