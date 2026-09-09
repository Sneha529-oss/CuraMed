from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DatasetOverview(BaseModel):
    filename: str
    total_rows: int
    total_columns: int
    column_names: List[str]
    missing_cells_total: int
    missing_cells_percentage: float
    duplicate_rows_total: int
    memory_usage_kb: float

class ColumnSummary(BaseModel):
    column_name: str
    data_type: str
    is_numeric: bool
    count: int
    missing_count: int
    missing_percentage: float
    unique_values_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    median: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None
    skewness: Optional[float] = None
    distribution_histogram: Optional[List[Dict[str, Any]]] = None
    top_categories: Optional[List[Dict[str, Any]]] = None

class CorrelationData(BaseModel):
    numeric_columns: List[str]
    matrix: List[List[float]]

class AnalyticsResponse(BaseModel):
    overview: DatasetOverview
    column_summaries: List[ColumnSummary]
    correlations: Optional[CorrelationData] = None
    sample_records: List[Dict[str, Any]]
