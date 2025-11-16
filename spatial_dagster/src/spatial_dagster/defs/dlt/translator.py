import dagster as dg
from dagster_dlt import DagsterDltTranslator
from dagster_dlt.translator import DltResourceTranslatorData


class CustomDagsterDltTranslator(DagsterDltTranslator):
    def get_asset_spec(self, data: DltResourceTranslatorData) -> dg.AssetSpec:
        default_spec = super().get_asset_spec(data)
        return default_spec.replace_attributes(
            key=dg.AssetKey([data.pipeline.dataset_name, data.resource.name]),
        )
