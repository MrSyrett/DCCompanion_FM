import { drawerWidth } from "../../common/ActionDrawer";

/**
 * Bounds for the active web view.
 *
 * - Focus mode: the view fills the whole window (chrome hidden entirely).
 * - Panel open: the view insets by the drawer width to reveal the controls panel.
 * - Panel closed (default): the view slides left to x:0 so the site gets the full
 *   width, with only the top bar above it. (The panel can't truly float over the
 *   view — it's a native layer — so closing it reclaims the space.)
 */
export function getBounds(focus = false, panelOpen = false) {
  if (focus) {
    return {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const controls = document.getElementById("controls");
  const y = controls?.clientHeight || 0;
  const x = panelOpen ? drawerWidth : 0;
  return {
    x,
    y,
    width: window.innerWidth - x,
    height: window.innerHeight - y,
  };
}
