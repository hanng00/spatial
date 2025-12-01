"""
Dokumentlista resource configuration.

API endpoint: https://data.riksdagen.se/dokumentlista/
Provides documents from Riksdagen including decisions, propositions, motions, and protocols.
Supports both incremental and backfill modes.
"""

from dlt.sources.rest_api import rest_api_source

INITIAL_INCREMENTAL_VALUE = "2025-01-01"
DEFAULT_END_DATE = "2025-06-01"


def get_resource(start_date: str | None = None, end_date: str | None = None) -> dict:
    """
    Get dokumentlista resource configuration.

    Args:
        start_date: Optional start date for backfill (format: YYYY-MM-DD).
        end_date: Optional end date for backfill (format: YYYY-MM-DD).

    Returns:
        Resource configuration dict for dlt rest_api_source.

    Note:
        - Backfill mode: Both dates provided → replace disposition
        - Incremental mode: No dates → append disposition with cursor
        - Requires pagination via JSONLinkPaginator
    """
    # Backfill mode
    if start_date and end_date:
        return {
            "name": "dokumentlista",
            "endpoint": {
                "path": "dokumentlista/",
                "params": {
                    "utformat": "json",
                    "from": start_date,
                    "tom": end_date,
                    "sort": "datum",
                    "sortorder": "asc",
                    "antal": 1000,
                },
                "data_selector": "dokumentlista.dokument",
            },
            "write_disposition": "replace",
            "max_table_nesting": 1,
        }

    # Incremental mode
    return {
        "name": "dokumentlista",
        "endpoint": {
            "path": "dokumentlista/",
            "params": {
                "utformat": "json",
                "tom": DEFAULT_END_DATE,
                "sort": "datum",
                "sortorder": "asc",
                "antal": 1000,
                "from": "{incremental.start_value}",
            },
            "data_selector": "dokumentlista.dokument",
            "incremental": {
                "cursor_path": "datum",
                "initial_value": INITIAL_INCREMENTAL_VALUE,
            },
        },
        "write_disposition": "append",
        "max_table_nesting": 1,
    }


def requires_pagination() -> bool:
    """Returns True if this resource requires pagination."""
    return True


def get_paginator():
    """Get the paginator for this resource."""
    from dlt.sources.helpers.rest_client.paginators import JSONLinkPaginator

    return JSONLinkPaginator(next_url_path="dokumentlista.@nasta_sida")


def get_paginator_config() -> dict:
    """Get paginator configuration for this resource."""
    return {"type": "json_link", "next_url_path": "dokumentlista.@nasta_sida"}


def create_source(
    start_date: str | None = None, end_date: str | None = None, verbose: bool = False
):
    """
    Create a dlt source for dokumentlista resource.

    Args:
        start_date: Optional start date for backfill (format: YYYY-MM-DD).
        end_date: Optional end date for backfill (format: YYYY-MM-DD).
        verbose: Whether to enable verbose logging.

    Returns:
        Configured dlt source with dokumentlista resource and paginator.
    """
    # Get resource configuration
    resource_config = get_resource(start_date, end_date)

    # Get paginator
    paginator = get_paginator()

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
