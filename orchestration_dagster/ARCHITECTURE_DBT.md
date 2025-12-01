# DBT Integration Architecture

## The Challenge

We want:
1. ✅ **DBT models as assets in Dagster UI** (for visibility, lineage, monitoring)
2. ✅ **Execution via Docker containers** (for isolation, consistency, deployment)

## The Solution

### How DbtProjectComponent Works

`DbtProjectComponent` does two things:
1. **Reads dbt manifest** → Creates asset definitions (metadata, UI, lineage)
2. **Creates default ops** → Executes dbt via CLI (we want to customize this)

### Architecture Options

#### Option 1: Keep Component + Customize Execution (Recommended)

**How it works:**
- `DbtProjectComponent` reads `dbt_project.yml` and `manifest.json`
- Creates asset definitions for all dbt models
- Assets show up in Dagster UI with proper lineage ✅
- Execution can be customized via:
  - Custom resources that wrap Docker execution
  - Or post-processing assets to wrap execution

**Pros:**
- All dbt models automatically appear as assets
- Full lineage tracking
- Can customize execution per asset

**Cons:**
- Requires customizing execution (not default behavior)

#### Option 2: Manual Asset Definitions

**How it works:**
- Manually define assets for each dbt model
- Each asset executes via Docker container

**Pros:**
- Full control over execution

**Cons:**
- Must manually maintain asset definitions
- No automatic lineage from dbt manifest
- Duplicates dbt project structure

## Recommended Approach

Use **Option 1**: Keep `DbtProjectComponent` for asset definitions, customize execution.

### Implementation Strategy

1. **Keep DbtProjectComponent** - It reads manifest and creates assets
2. **Create DbtDockerResource** - Resource that executes dbt via Docker
3. **Wrap asset execution** - Use the resource in asset materialization

### Example Flow

```
DbtProjectComponent
  ↓ (reads manifest)
Creates Assets: [stg_personlista, stg_dokumentlista, ...]
  ↓ (each asset has an op)
Custom Op → DbtDockerResource.execute_dbt_command()
  ↓
docker run transformations_dbt:latest run --select stg.personlista
  ↓
dbt executes in container
  ↓
Results written to DW
```

## Current Status

- ✅ `CustomDbtProjectComponent` - Reads manifest, creates assets
- ✅ `DbtDockerResource` - Executes dbt via Docker
- ⏳ Need to wire them together (customize asset execution)

## Next Steps

1. Test that `DbtProjectComponent` creates assets correctly
2. Customize asset execution to use `DbtDockerResource`
3. Test end-to-end: Dagster UI → Asset execution → Docker container → DW

