/**
 * Map tooltip utilities
 */

import type { MapDocumentPoint } from './mapData'

export function getMapTooltip(object: MapDocumentPoint | null) {
  if (!object) return null

  const {
    name,
    count,
    politician_count,
    party_count,
    question_count,
    proposition_count,
    report_count,
    motion_count,
  } = object

  return {
    html: `<div style="padding: 12px; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: system-ui; min-width: 200px;">
      <strong style="font-size: 14px; color: #1c1c1c; display: block; margin-bottom: 8px;">${name}</strong>
      <div style="border-top: 1px solid #e5e5e5; padding-top: 8px; margin-top: 8px;">
        <div style="font-size: 16px; font-weight: 600; color: #1c1c1c; margin-bottom: 4px;">${count} documents</div>
        <div style="font-size: 11px; color: #6b6b6b; margin-top: 8px;">
          <div>${politician_count} politicians • ${party_count} parties</div>
          <div style="margin-top: 4px;">
            ${question_count} questions • ${proposition_count} propositions<br/>
            ${report_count} reports • ${motion_count} motions
          </div>
        </div>
      </div>
    </div>`,
    style: {
      backgroundColor: 'transparent',
    },
  }
}

