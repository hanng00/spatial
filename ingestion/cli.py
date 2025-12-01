#!/usr/bin/env python3
"""
CLI interface for ingestion container.

Usage:
    ingestion-cli run <resource> [--start-date=YYYY-MM-DD] [--end-date=YYYY-MM-DD] [--database=NAME]
"""
import argparse
import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dlt import pipeline
from ingestion.motherduck import create_motherduck_destination
from ingestion.sources.riksdagen.resources import (
    anforandelista,
    dokumentlista,
    personlista,
    voteringlista,
)


def get_database_name() -> str:
    """Get database name from env or default."""
    return os.environ.get("DATABASE_NAME", "spatial_dagster")


def run_resource(
    resource_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
    database_name: str | None = None,
):
    """Run ingestion for a specific resource."""
    database_name = database_name or get_database_name()
    
    # Map resource names to source creators
    resource_map = {
        "anforandelista": anforandelista.create_source,
        "dokumentlista": dokumentlista.create_source,
        "personlista": personlista.create_source,
        "voteringlista": voteringlista.create_source,
    }
    
    if resource_name not in resource_map:
        raise ValueError(f"Unknown resource: {resource_name}. Available: {list(resource_map.keys())}")
    
    # Create source
    create_source_fn = resource_map[resource_name]
    if resource_name in ["anforandelista", "dokumentlista", "voteringlista"]:
        source = create_source_fn(start_date=start_date, end_date=end_date)
    else:
        source = create_source_fn()
    
    # Create pipeline
    dlt_pipeline = pipeline(
        pipeline_name=f"raw_riksdagen_{resource_name}",
        dataset_name="raw_riksdagen",
        destination=create_motherduck_destination(database_name=database_name),
        progress="log",
    )
    
    # Run pipeline
    info = dlt_pipeline.run(source)
    print(f"Pipeline completed: {info}")
    return info


def main():
    parser = argparse.ArgumentParser(description="Ingestion CLI for DLT-based data ingestion")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Run ingestion for a resource")
    run_parser.add_argument("resource", choices=["anforandelista", "dokumentlista", "personlista", "voteringlista"])
    run_parser.add_argument("--start-date", help="Start date (YYYY-MM-DD) for backfill")
    run_parser.add_argument("--end-date", help="End date (YYYY-MM-DD) for backfill")
    run_parser.add_argument("--database", help="Database name (default: from DATABASE_NAME env or 'spatial_dagster')")
    
    args = parser.parse_args()
    
    if args.command == "run":
        try:
            run_resource(
                resource_name=args.resource,
                start_date=args.start_date,
                end_date=args.end_date,
                database_name=args.database,
            )
            sys.exit(0)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

