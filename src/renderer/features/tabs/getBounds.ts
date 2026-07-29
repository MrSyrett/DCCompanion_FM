import { drawerWidth } from "../../common/ActionDrawer";

/**
 * Bounds for the active web view.
 *
 * In focus mode the chrome (drawer + tab/URL bar) is hidden, so the view fills
 * the entire window. Otherwise it sits to the right of the drawer and below the
 * controls, as normal.
 */
export function getBounds(focus = false) {
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
  return {
    x: drawerWidth,
    y,
    width: window.innerWidth - drawerWidth,
    height: window.innerHeight - y,
  };
}
