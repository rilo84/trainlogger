import type { Activity } from './types'

// Palette shared by the hours chart and the activity cards. Validated against the
// dark card surface (#171a21): all 8 slots clear the CVD/contrast checks for
// adjacent series (see dataviz skill palette.md).
export const SERIES_COLORS = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
]

export const OTHER_COLOR = '#898781'

// Stable activity -> colour assignment by creation order (the stored array order,
// since new activities are appended). The palette cycles past 8 activities.
// "Stable" means an activity keeps its colour no matter which time window the
// chart is showing, so a card border and its chart bar always agree.
export function buildActivityColorMap(activities: Activity[]): Map<string, string> {
  const map = new Map<string, string>()
  activities.forEach((activity, index) => {
    map.set(activity.id, SERIES_COLORS[index % SERIES_COLORS.length])
  })
  return map
}
