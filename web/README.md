# Web

## Architecture
src/features/
├── map/                          ← Raw map infrastructure
│   ├── components/
│   │   ├── BaseMapLayer.tsx      # deck.gl wrapper
│   │   ├── ClientMap.tsx         # Main map orchestrator
│   │   ├── LayerComposer.tsx     # Layer composition
│   │   ├── MapControlsPanel.tsx
│   │   └── MapHeader.tsx
│   ├── hooks/
│   │   ├── useMapLayerComposition.ts
│   │   └── useMapLayersSetup.ts
│   ├── layers/
│   │   ├── base/types.ts         # Base layer types
│   │   └── registry/             # Layer registry system
│   ├── lib/
│   │   ├── mapTooltip.ts
│   │   └── mapUtils.ts
│   └── stores/
│       ├── layerRegistryStore.ts
│       └── mapStore.ts           # View state + global filters only
│
└── datalayers/
    └── documentGeography/        ← Specific data layer (co-located)
        ├── adapters/
        ├── components/
        │   ├── DistrictMotionsSheet.tsx
        │   └── MotionDetailDialog.tsx
        ├── hooks/
        ├── layers/
        │   └── DocumentGeographyLayer.tsx
        ├── lib/
        ├── stores/
        │   └── districtStore.ts  # District-specific state
        └── index.ts              # Public exports