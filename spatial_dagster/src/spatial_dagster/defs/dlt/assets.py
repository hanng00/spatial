import dagster as dg
from dagster import AssetExecutionContext
from dagster_dlt import DagsterDltResource, dlt_assets
from dlt import pipeline

from spatial_dagster.defs.dlt.constants import DATABASE_NAME
from spatial_dagster.defs.dlt.translator import CustomDagsterDltTranslator
from spatial_dagster.lib.motherduck import create_motherduck_destination
from spatial_dagster.utils.partition_helpers import get_partition_date_range

from .sources.riksdagen.resources import (
    anforandelista,
    dokumentlista,
    personlista,
    voteringlista,
)

GROUP_NAME = "raw_riksdagen"
date_partition = dg.DailyPartitionsDefinition(start_date="1990-01-01")


def create_raw_riksdagen_pipeline(table_name: str):
    return pipeline(
        pipeline_name=f"{GROUP_NAME}_{table_name}",
        dataset_name=GROUP_NAME,
        destination=create_motherduck_destination(database_name=DATABASE_NAME),
        progress="log",
    )


@dlt_assets(
    dlt_source=anforandelista.create_source(),
    dlt_pipeline=create_raw_riksdagen_pipeline("anforandelista"),
    group_name=GROUP_NAME,
    dagster_dlt_translator=CustomDagsterDltTranslator(),
    partitions_def=date_partition,
)
def anforandelista_assets(
    context: AssetExecutionContext,
    dlt: DagsterDltResource,
):
    start_date, end_date = get_partition_date_range(context)
    source = (
        anforandelista.create_source(start_date=start_date, end_date=end_date)
        if start_date and end_date
        else anforandelista.create_source()
    )
    configured_dlt = DagsterDltResource()
    configured_dlt._source = source
    yield from configured_dlt.run(context=context)


@dlt_assets(
    dlt_source=dokumentlista.create_source(),
    dlt_pipeline=create_raw_riksdagen_pipeline("dokumentlista"),
    group_name=GROUP_NAME,
    dagster_dlt_translator=CustomDagsterDltTranslator(),
    partitions_def=date_partition,
)
def dokumentlista_assets(
    context: AssetExecutionContext,
    dlt: DagsterDltResource,
):
    start_date, end_date = get_partition_date_range(context)
    source = (
        dokumentlista.create_source(start_date=start_date, end_date=end_date)
        if start_date and end_date
        else dokumentlista.create_source()
    )
    configured_dlt = DagsterDltResource()
    configured_dlt._source = source
    yield from configured_dlt.run(context=context)


@dlt_assets(
    dlt_source=personlista.create_source(),
    dlt_pipeline=create_raw_riksdagen_pipeline("personlista"),
    group_name=GROUP_NAME,
    dagster_dlt_translator=CustomDagsterDltTranslator(),
)
def personlista_assets(context: AssetExecutionContext, dlt: DagsterDltResource):
    yield from dlt.run(context=context)


@dlt_assets(
    dlt_source=voteringlista.create_source(incremental=True),
    dlt_pipeline=create_raw_riksdagen_pipeline("voteringlista"),
    group_name=GROUP_NAME,
    dagster_dlt_translator=CustomDagsterDltTranslator(),
    partitions_def=date_partition,
)
def voteringlista_assets(
    context: AssetExecutionContext,
    dlt: DagsterDltResource,
):
    start_date, end_date = get_partition_date_range(context)
    source = (
        voteringlista.create_source(
            incremental=False, start_date=start_date, end_date=end_date
        )
        if start_date and end_date
        else voteringlista.create_source(incremental=True)
    )
    configured_dlt = DagsterDltResource()
    configured_dlt._source = source
    yield from configured_dlt.run(context=context)
