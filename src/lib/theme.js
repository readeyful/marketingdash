// Per-workspace visual tweaks that go beyond the brandColor / accentColor
// already stored on the workspace object.

const HEADING_FONTS = {
  'ride-home-re': "'Anton', sans-serif",
}

export function getHeadingFont(workspaceId) {
  return HEADING_FONTS[workspaceId] ?? "'Inter', ui-sans-serif, system-ui, sans-serif"
}

export function getWorkspaceThemeVars(workspace) {
  if (!workspace) return {}
  return {
    '--brand-color': workspace.brandColor,
    '--accent-color': workspace.accentColor,
    '--font-heading': getHeadingFont(workspace.id),
  }
}
