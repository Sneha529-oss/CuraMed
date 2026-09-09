import io
import os
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse
from schemas.analytics import (
    AnalyticsResponse,
    DatasetOverview,
    ColumnSummary,
    CorrelationData
)

router = APIRouter(prefix="/analytics", tags=["Dataset Analytics"])

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "datasets"))
SAMPLE_DATASET_PATH = os.path.join(DATASET_DIR, "diabetes.csv")

def analyze_dataframe(df: pd.DataFrame, filename: str = "dataset.csv") -> AnalyticsResponse:
    total_rows = len(df)
    total_cols = len(df.columns)
    missing_cells = int(df.isna().sum().sum())
    total_cells = total_rows * total_cols if total_cols > 0 else 1
    missing_pct = round((missing_cells / total_cells) * 100, 2)
    duplicate_rows = int(df.duplicated().sum())
    memory_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)

    overview = DatasetOverview(
        filename=filename,
        total_rows=total_rows,
        total_columns=total_cols,
        column_names=list(df.columns),
        missing_cells_total=missing_cells,
        missing_cells_percentage=missing_pct,
        duplicate_rows_total=duplicate_rows,
        memory_usage_kb=memory_kb
    )

    column_summaries: List[ColumnSummary] = []
    numeric_cols = []

    for col in df.columns:
        series = df[col]
        is_num = pd.api.types.is_numeric_dtype(series)
        col_missing = int(series.isna().sum())
        col_missing_pct = round((col_missing / total_rows) * 100, 2) if total_rows > 0 else 0.0
        unique_cnt = int(series.nunique())

        if is_num:
            numeric_cols.append(col)
            clean_series = series.dropna()
            mean_val = float(clean_series.mean()) if len(clean_series) > 0 else None
            std_val = float(clean_series.std()) if len(clean_series) > 1 else None
            min_val = float(clean_series.min()) if len(clean_series) > 0 else None
            q25_val = float(clean_series.quantile(0.25)) if len(clean_series) > 0 else None
            med_val = float(clean_series.median()) if len(clean_series) > 0 else None
            q75_val = float(clean_series.quantile(0.75)) if len(clean_series) > 0 else None
            max_val = float(clean_series.max()) if len(clean_series) > 0 else None
            skew_val = float(clean_series.skew()) if len(clean_series) > 2 else None

            # Calculate 7-bin distribution histogram
            histogram = []
            if len(clean_series) > 0 and min_val is not None and max_val is not None and max_val > min_val:
                counts, bin_edges = np.histogram(clean_series, bins=7)
                for i in range(len(counts)):
                    histogram.append({
                        "bin": f"{round(float(bin_edges[i]), 1)} - {round(float(bin_edges[i+1]), 1)}",
                        "count": int(counts[i])
                    })

            summary = ColumnSummary(
                column_name=col,
                data_type=str(series.dtype),
                is_numeric=True,
                count=int(len(clean_series)),
                missing_count=col_missing,
                missing_percentage=col_missing_pct,
                unique_values_count=unique_cnt,
                mean=round(mean_val, 2) if mean_val is not None else None,
                std=round(std_val, 2) if std_val is not None else None,
                min=round(min_val, 2) if min_val is not None else None,
                q25=round(q25_val, 2) if q25_val is not None else None,
                median=round(med_val, 2) if med_val is not None else None,
                q75=round(q75_val, 2) if q75_val is not None else None,
                max=round(max_val, 2) if max_val is not None else None,
                skewness=round(skew_val, 2) if skew_val is not None else None,
                distribution_histogram=histogram
            )
        else:
            # Categorical breakdown
            top_cats = []
            val_counts = series.value_counts(dropna=False).head(5)
            for val, cnt in val_counts.items():
                top_cats.append({
                    "category": str(val),
                    "count": int(cnt)
                })

            summary = ColumnSummary(
                column_name=col,
                data_type=str(series.dtype),
                is_numeric=False,
                count=int(total_rows - col_missing),
                missing_count=col_missing,
                missing_percentage=col_missing_pct,
                unique_values_count=unique_cnt,
                top_categories=top_cats
            )

        column_summaries.append(summary)

    # Correlation Matrix for numerical columns
    correlation_data = None
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr().fillna(0.0)
        matrix_rows = []
        for row_col in numeric_cols:
            row_vals = [round(float(corr_matrix.loc[row_col, c]), 3) for c in numeric_cols]
            matrix_rows.append(row_vals)
        
        correlation_data = CorrelationData(
            numeric_columns=numeric_cols,
            matrix=matrix_rows
        )

    # Sample records (top 15)
    sample_records = df.head(15).replace({np.nan: None}).to_dict(orient="records")

    return AnalyticsResponse(
        overview=overview,
        column_summaries=column_summaries,
        correlations=correlation_data,
        sample_records=sample_records
    )

@router.post("/upload", response_model=AnalyticsResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.CSV')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are currently supported for dataset analytics."
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        if df.empty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV file is empty.")
        return analyze_dataframe(df, filename=file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV dataset: {str(e)}"
        )

@router.get("/sample-data", response_model=AnalyticsResponse)
async def get_sample_analytics():
    if not os.path.exists(SAMPLE_DATASET_PATH):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample dataset not found.")
    df = pd.read_csv(SAMPLE_DATASET_PATH)
    return analyze_dataframe(df, filename="diabetes_clinical_dataset.csv")

@router.post("/clean")
async def clean_dataset(
    file: UploadFile = File(...),
    remove_duplicates: bool = True,
    impute_strategy: str = "median"  # 'median', 'mean', 'drop'
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        initial_rows = len(df)
        duplicates_removed = 0
        if remove_duplicates:
            df = df.drop_duplicates()
            duplicates_removed = initial_rows - len(df)

        imputed_cells = 0
        if impute_strategy == "drop":
            df = df.dropna()
        else:
            for col in df.select_dtypes(include=[np.number]).columns:
                missing_in_col = df[col].isna().sum()
                if missing_in_col > 0:
                    imputed_cells += int(missing_in_col)
                    fill_val = df[col].median() if impute_strategy == "median" else df[col].mean()
                    df[col] = df[col].fillna(fill_val)

        # Output cleaned CSV stream
        output_stream = io.StringIO()
        df.to_csv(output_stream, index=False)
        output_stream.seek(0)

        response = StreamingResponse(
            io.BytesIO(output_stream.getvalue().encode('utf-8')),
            media_type="text/csv"
        )
        clean_name = f"cleaned_{file.filename or 'dataset.csv'}"
        response.headers["Content-Disposition"] = f'attachment; filename="{clean_name}"'
        response.headers["X-Duplicates-Removed"] = str(duplicates_removed)
        response.headers["X-Cells-Imputed"] = str(imputed_cells)
        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error cleaning dataset: {str(e)}"
        )
