"""
Anforandelista resource configuration.

API endpoint: https://data.riksdagen.se/anforandelista/
Provides speeches (anföranden) from Riksdagen debates.
Supports both incremental and backfill modes using systemnyckel as cursor.
"""

from dlt.sources.rest_api import rest_api_source

INITIAL_INCREMENTAL_VALUE = "0"  # Start from beginning
DEFAULT_PAGE_SIZE = 20000  # Maximum allowed page size (soft limit)


def get_resource(start_date: str | None = None, end_date: str | None = None) -> dict:
    """
    Get anforandelista (speeches) resource configuration.

    Args:
        start_date: Optional start date for backfill (format: YYYY-MM-DD).
        end_date: Optional end date for backfill (format: YYYY-MM-DD).

    Returns:
        Resource configuration dict for dlt rest_api_source.

    Note:
        - Backfill mode: Both dates provided → replace disposition with date filter
        - Incremental mode: No dates → append disposition with systemnyckel cursor
        - Uses systemnyckel as incremental cursor (unique sequential key)
        - Maximum page size is 20000 records per request
        - Data selector: anforandelista.anforande
        - Custom pagination uses dok_datum to set 'd' parameter for next page
        - Deduplication handled by systemnyckel uniqueness
    """
    # Backfill mode
    if start_date and end_date:
        return {
            "name": "anforandelista",
            "endpoint": {
                "path": "anforandelista/",
                "params": {
                    "utformat": "json",
                    "sz": DEFAULT_PAGE_SIZE,
                    "d": start_date,  # Date filter for backfill
                },
                "data_selector": "anforandelista.anforande",
            },
            "write_disposition": "replace",
            "max_table_nesting": 1,
        }

    # Incremental mode - use systemnyckel as cursor for deduplication
    return {
        "name": "anforandelista",
        "endpoint": {
            "path": "anforandelista/",
            "params": {
                "utformat": "json",
                "sz": DEFAULT_PAGE_SIZE,
                # Custom paginator will add 'd' parameter based on latest dok_datum
            },
            "data_selector": "anforandelista.anforande",
            "incremental": {
                "cursor_path": "systemnyckel",
                "initial_value": INITIAL_INCREMENTAL_VALUE,
            },
        },
        "write_disposition": "append",
        "max_table_nesting": 1,
    }


def requires_pagination() -> bool:
    """Returns True as this resource uses Riksmöte-based pagination to traverse all ~600K speeches."""
    return True


def get_paginator(start_date: str | None = None, end_date: str | None = None):
    """Get the paginator for this resource."""
    from ..paginators import RiksmotePaginator

    return RiksmotePaginator(start_date=start_date, end_date=end_date)


def get_paginator_config() -> dict:
    """Get paginator configuration for this resource."""
    return {
        "type": "riksmote",
        "description": "Paginates through parliamentary sessions using rm parameter",
    }


def create_source(
    start_date: str | None = None, end_date: str | None = None, verbose: bool = False
):
    """
    Create a dlt source for anforandelista resource.

    Args:
        start_date: Optional start date for backfill (format: YYYY-MM-DD).
        end_date: Optional end date for backfill (format: YYYY-MM-DD).
        verbose: Whether to enable verbose logging.

    Returns:
        Configured dlt source with anforandelista resource and paginator.
    """
    # Get resource configuration
    resource_config = get_resource(start_date, end_date)

    # Get paginator with date filtering
    paginator = get_paginator(start_date, end_date)

    # Create source configuration
    source_config = {
        "client": {
            "base_url": "https://data.riksdagen.se/",
            "headers": {
                "User-Agent": "riksbevakning-dagster/1.0",
            },
        },
        "resources": [resource_config],
    }

    # Add paginator to client if needed
    if paginator:
        source_config["client"]["paginator"] = paginator

    return rest_api_source(source_config)
