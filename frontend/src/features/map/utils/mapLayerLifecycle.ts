import L from 'leaflet';

export function isMapAlive(map: L.Map | null | undefined): map is L.Map {
  if (!map) return false;
  try {
    const container = map.getContainer();
    return !!(container && container.parentNode);
  } catch {
    return false;
  }
}

export function safeRemoveLayer(map: L.Map, layer: L.Layer | null | undefined): void {
  if (!layer || !isMapAlive(map)) return;
  try {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  } catch {
    // Map or layer already destroyed
  }
}

export function safeClearGroup(map: L.Map, group: L.LayerGroup | null | undefined): void {
  if (!group) return;
  try {
    group.clearLayers();
  } catch {
    // ignore
  }
  safeRemoveLayer(map, group);
}

export function safeClearCanvasRenderer(renderer: L.Canvas | null | undefined, map: L.Map): void {
  if (!renderer) return;
  try {
    (renderer as L.Canvas & { _clear?: () => void })._clear?.();
  } catch {
    // Canvas context may already be destroyed
  }
  safeRemoveLayer(map, renderer);
}

/** One route canvas renderer per live map instance. */
let routeCanvasRenderer: L.Canvas | null = null;
let routeCanvasMap: L.Map | null = null;

export function acquireRouteCanvasRenderer(map: L.Map): L.Canvas | null {
  if (!isMapAlive(map)) return null;

  if (routeCanvasRenderer && routeCanvasMap && routeCanvasMap !== map) {
    safeClearCanvasRenderer(routeCanvasRenderer, routeCanvasMap);
    routeCanvasRenderer = null;
    routeCanvasMap = null;
  }

  if (!routeCanvasRenderer) {
    routeCanvasRenderer = L.canvas({ padding: 0.5 });
  }

  if (!map.hasLayer(routeCanvasRenderer)) {
    routeCanvasRenderer.addTo(map);
  }

  routeCanvasMap = map;
  return routeCanvasRenderer;
}

export function releaseRouteCanvasRenderer(map: L.Map): void {
  if (!routeCanvasRenderer || routeCanvasMap !== map) return;
  safeClearCanvasRenderer(routeCanvasRenderer, map);
  routeCanvasRenderer = null;
  routeCanvasMap = null;
}

export function purgeOrphanedRouteDom(map: L.Map): void {
  if (!isMapAlive(map)) return;
  const overlay = map.getPanes().overlayPane;
  if (!overlay) return;

  overlay
    .querySelectorAll('path.ebh-route, path.ebh-route-core, path.ebh-route-base')
    .forEach((el) => el.remove());

  const canvases = overlay.querySelectorAll('.leaflet-zoom-animated canvas');
  if (canvases.length > 1) {
    for (let i = 1; i < canvases.length; i++) {
      canvases[i].remove();
    }
  }
}
