"use client";

import type { GraphEdge, GraphNode } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";

type PositionedNode = GraphNode & { x: number; y: number; radius: number; color: string };

const relationPalette: Record<GraphEdge["relation_type"], string> = {
  reference: "#f59e0b",
  person_involved: "#10b981",
  speech: "#3b82f6",
  vote: "#ec4899",
};

const kindPalette: Record<GraphNode["kind"], string> = {
  document: "#f59e0b",
  person: "#0ea5e9",
};

function computeLayout(
  nodes: GraphNode[],
  focusId: string | null,
  width: number,
  height: number
): PositionedNode[] {
  if (width <= 0 || height <= 0) return [];
  const centerX = width / 2;
  const centerY = height / 2;
  const focusNode = nodes.find((n) => n.id === focusId) ?? nodes[0];

  const others = nodes.filter((n) => n.id !== focusNode?.id);
  const documents = others.filter((n) => n.kind === "document");
  const people = others.filter((n) => n.kind === "person");

  const radiusDoc = Math.min(width, height) * 0.28;
  const radiusPerson = Math.min(width, height) * 0.42;

  const placeOnRing = (items: GraphNode[], radius: number, startAngle = 0) =>
    items.map((node, idx) => {
      const angle = startAngle + (idx / Math.max(items.length, 1)) * Math.PI * 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        radius: node.kind === "document" ? 18 : 14,
        color: kindPalette[node.kind],
      };
    });

  const positioned: PositionedNode[] = [];
  if (focusNode) {
    positioned.push({
      ...focusNode,
      x: centerX,
      y: centerY,
      radius: 26,
      color: kindPalette[focusNode.kind] ?? "#f59e0b",
    });
  }
  positioned.push(...placeOnRing(documents, radiusDoc, Math.PI / 6));
  positioned.push(...placeOnRing(people, radiusPerson, Math.PI / 3));
  return positioned;
}

export function GraphViz({
  nodes,
  edges,
  focusId,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  focusId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 620 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(rect.width, 600),
        height: Math.max(rect.height, 420),
      });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const positioned = useMemo(
    () => computeLayout(nodes, focusId, size.width, size.height),
    [nodes, focusId, size.width, size.height]
  );
  const byId = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positioned.forEach((p) => map.set(p.id, p));
    return map;
  }, [positioned]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`}>
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {edges.map((edge, idx) => {
          const src = byId.get(edge.source);
          const tgt = byId.get(edge.target);
          if (!src || !tgt) return null;
          const color = relationPalette[edge.relation_type] ?? "url(#edgeGradient)";
          return (
            <line
              key={`${edge.id}-${edge.source}-${edge.target}-${idx}`}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={color}
              strokeWidth={1.6}
              strokeOpacity={0.6}
            />
          );
        })}

        {positioned.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              fillOpacity={0.9}
              stroke="#0f172a"
              strokeWidth={2}
              className="drop-shadow-lg"
            />
            <text
              x={node.x}
              y={node.y + node.radius + 16}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="12"
              fontWeight={600}
              style={{ pointerEvents: "none" }}
            >
              {node.label?.slice(0, 32)}
            </text>
            {node.kind === "document" && node.rm ? (
              <text
                x={node.x}
                y={node.y + node.radius + 30}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                style={{ pointerEvents: "none" }}
              >
                {node.rm} • {node.type || ""}
              </text>
            ) : null}
            {node.kind === "person" && (node.party || node.district) ? (
              <text
                x={node.x}
                y={node.y + node.radius + 30}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                style={{ pointerEvents: "none" }}
              >
                {[node.party, node.district].filter(Boolean).join(" • ")}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No nodes yet. Search for a document or person to start mapping.
        </div>
      )}
    </div>
  );
}

