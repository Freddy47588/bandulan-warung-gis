import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import { BANDULAN_BOUNDS, BANDULAN_CENTER, LAYER_CATALOG } from "../data/layers";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import type { BandulanDatasets, LayerId } from "../types/geo";
import { BASEMAPS, createBaseStyle } from "./basemaps";
import {
  buildVectorLayerSpecs,
  INTERACTIVE_INSPECT_LAYERS,
  VECTOR_LAYER_MAPPINGS,
} from "./layerStyles";
import { BASEMAP_THEMES } from "./themePalette";

export interface MapCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

const DASH_SEQUENCE: number[][] = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
  [0, 1, 3, 3],
  [0, 1.5, 3, 2.5],
  [0, 2, 3, 2],
  [0, 2.5, 3, 1.5],
  [0, 3, 3, 1],
  [0, 3.5, 3, 0.5],
];

function buildSpotlightMask(boundary: BandulanDatasets["boundary"]): FeatureCollection<Polygon> {
  const ft = boundary.features[0];
  if (!ft) return { type: "FeatureCollection", features: [] };

  const worldOuter: [number, number][] = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];

  const holes: number[][][] = [];
  if (ft.geometry.type === "Polygon") {
    holes.push(ft.geometry.coordinates[0]);
  } else if (ft.geometry.type === "MultiPolygon") {
    for (const poly of ft.geometry.coordinates) {
      if (poly[0]) holes.push(poly[0]);
    }
  }

  const maskFeature: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [worldOuter, ...holes],
    },
  };

  return { type: "FeatureCollection", features: [maskFeature] };
}

export const MapCanvas = forwardRef<MapCanvasHandle>(function MapCanvas(_, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLButtonElement }>>(
    new Map(),
  );
  const [mapReady, setMapReady] = useState(false);
  const tileErrorShownRef = useRef(false);
  const prevIs3DRef = useRef<boolean | null>(null);

  const { t, formatNumber } = useI18n();
  const {
    datasets,
    warungs,
    filteredWarungs,
    basemap,
    is3D,
    heatmapOn,
    visibleLayers,
    selectedWarungId,
    selectWarung,
    hoveredWarungId,
    setHoveredWarungId,
    activeTool,
    catchmentResult,
    nearestResult,
    runNearestAt,
    voronoiResult,
    measureResult,
    addMeasurePoint,
    cameraTarget,
    resetViewNonce,
    reportCamera,
    initialUrlCamera,
    showToast,
    storyChapterIndex,
  } = useAppState();

  const filteredWarungIdSet = useMemo(
    () => new Set(filteredWarungs.map((w) => w.id)),
    [filteredWarungs],
  );

  const activeToolRef = useRef(activeTool);
  const runNearestRef = useRef(runNearestAt);
  const addMeasureRef = useRef(addMeasurePoint);
  const tRef = useRef(t);
  const formatNumRef = useRef(formatNumber);
  const showToastRef = useRef(showToast);
  const reportCameraRef = useRef(reportCamera);
  const storyActiveRef = useRef(storyChapterIndex !== null);

  useEffect(() => {
    activeToolRef.current = activeTool;
    runNearestRef.current = runNearestAt;
    addMeasureRef.current = addMeasurePoint;
    tRef.current = t;
    formatNumRef.current = formatNumber;
    showToastRef.current = showToast;
    reportCameraRef.current = reportCamera;
    storyActiveRef.current = storyChapterIndex !== null;
  });

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn({ duration: prefersReducedMotion() ? 0 : 280 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: prefersReducedMotion() ? 0 : 280 }),
    resetView: () => {
      const m = mapRef.current;
      if (!m) return;
      m.fitBounds(BANDULAN_BOUNDS, {
        padding: { top: 90, bottom: 90, left: window.innerWidth >= 1024 ? 380 : 32, right: 64 },
        pitch: is3D ? 50 : 0,
        bearing: is3D ? -18 : 0,
        duration: prefersReducedMotion() ? 0 : 700,
      });
    },
  }));

  // 1. Initialize MapLibre GL map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createBaseStyle(basemap),
      center: initialUrlCamera
        ? [initialUrlCamera.lng, initialUrlCamera.lat]
        : BANDULAN_CENTER,
      zoom: initialUrlCamera?.zoom ?? 14.5,
      pitch: initialUrlCamera?.pitch ?? (is3D ? 52 : 0),
      bearing: initialUrlCamera?.bearing ?? (is3D ? -18 : 0),
      maxPitch: 70,
      minZoom: 11,
      maxZoom: 19.5,
      attributionControl: false,
    });

    const attribControl = new maplibregl.AttributionControl({ compact: true });
    map.addControl(attribControl, "bottom-right");
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 110, unit: "metric" }),
      "bottom-right",
    );

    map.on("load", () => {
      const attribEl = map.getContainer().querySelector(".maplibregl-ctrl-attrib");
      attribEl?.classList.remove("maplibregl-compact-show");
      attribEl?.removeAttribute("open");

      for (const layer of LAYER_CATALOG) {
        map.addSource(`src-${layer.id}`, {
          type: "geojson",
          data: EMPTY_FC,
        });
      }

      const overlayIds = [
        "overlay-spotlight",
        "overlay-voronoi",
        "overlay-gaps",
        "overlay-catchment",
        "overlay-nearest-line",
        "overlay-measure",
      ];
      for (const oid of overlayIds) {
        map.addSource(oid, {
          type: "geojson",
          data: EMPTY_FC,
        });
      }

      for (const spec of buildVectorLayerSpecs()) {
        map.addLayer(spec);
      }

      if (!initialUrlCamera) {
        map.fitBounds(BANDULAN_BOUNDS, {
          padding: {
            top: 90,
            bottom: 90,
            left: window.innerWidth >= 1024 ? 380 : 32,
            right: 64,
          },
          pitch: is3D ? 52 : 0,
          bearing: is3D ? -18 : 0,
          duration: 0,
        });
      }

      setMapReady(true);
    });

    map.on("moveend", () => {
      const c = map.getCenter();
      reportCameraRef.current({
        lng: c.lng,
        lat: c.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    map.on("error", (e) => {
      const sourceId = (e as { sourceId?: string }).sourceId;
      if (sourceId?.startsWith("basemap-") && !tileErrorShownRef.current) {
        tileErrorShownRef.current = true;
        showToastRef.current(tRef.current("status.tileError"), 6000);
      }
    });

    map.on("click", (e) => {
      const tool = activeToolRef.current;
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (tool === "nearest") {
        runNearestRef.current(coords, "click");
        return;
      }

      if (tool === "measure") {
        addMeasureRef.current(coords);
        return;
      }

      const presentLayers = INTERACTIVE_INSPECT_LAYERS.filter((id) => map.getLayer(id));
      const features = map.queryRenderedFeatures(e.point, { layers: presentLayers });
      if (!features.length) {
        popupRef.current?.remove();
        return;
      }

      const ft = features[0];
      const props = (ft.properties ?? {}) as Record<string, unknown>;
      const layerId = ft.layer.id;

      const card = document.createElement("div");
      card.className = "bandulan-popup-card";

      const badge = document.createElement("div");
      badge.className = "bandulan-popup-badge";

      const title = document.createElement("h3");
      title.className = "bandulan-popup-title";

      const dl = document.createElement("dl");
      dl.className = "bandulan-popup-dl";

      const addRow = (label: string, value: string) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value;
        dl.append(dt, dd);
      };

      const tr = tRef.current;
      const fmt = formatNumRef.current;

      if (layerId === "voronoi-fill") {
        badge.textContent = tr("popup.territory");
        title.textContent = String(props.warungName ?? "");
        addRow(tr("popup.area"), `${fmt(Number(props.areaHa ?? 0), 2)} ha`);
        addRow(tr("popup.share"), `${fmt(Number(props.sharePercent ?? 0), 1)}%`);
        addRow(tr("popup.buildingsInside"), String(props.buildingCount ?? 0));
      } else if (layerId === "amenities-dot") {
        const amType = String(props.amenityType ?? "civic");
        badge.textContent = tr(`amenity.${amType}` as Parameters<typeof tr>[0]);
        title.textContent = String(props.Nama ?? badge.textContent);
        if (props.osmTag) addRow(tr("popup.type"), String(props.osmTag));
      } else {
        const mapLayerKey: Record<string, LayerId> = {
          "schools-fill": "schools",
          "schools-3d": "schools",
          "factories-fill": "factories",
          "factories-3d": "factories",
          "green-spaces-fill": "green-spaces",
          "residential-areas-fill": "residential-areas",
          "village-roads-line": "village-roads",
          "residential-roads-line": "residential-roads",
          "alleys-line": "alleys",
          "rivers-line": "rivers",
          "buildings-fill": "buildings",
          "buildings-3d": "buildings",
        };
        const logicalId = mapLayerKey[layerId] ?? "buildings";
        badge.textContent = tr(`layer.${logicalId}` as Parameters<typeof tr>[0]);
        title.textContent =
          (props.Nama ? String(props.Nama) : null) ??
          (props.FID ? `${tr("popup.fid")} #${props.FID}` : badge.textContent);

        if (props.LuasHektar !== undefined && props.LuasHektar !== null) {
          addRow(
            tr("popup.area"),
            `${fmt(Number(props.LuasHektar), 2)} ha (${fmt(Number(props.LuasMeter ?? 0), 0)} m²)`,
          );
        }
        if (props.PanjangM !== undefined && props.PanjangM !== null) {
          addRow(tr("popup.length"), `${fmt(Number(props.PanjangM), 0)} m`);
        }
        if (props.buildingType) {
          addRow(tr("popup.type"), String(props.buildingType));
        }
        if (props.FID !== undefined && props.FID !== null) {
          addRow(tr("popup.fid"), String(props.FID));
        }
      }

      card.append(badge, title);
      if (dl.childElementCount > 0) card.append(dl);

      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "280px",
        className: "bandulan-glass-popup",
      })
        .setLngLat(e.lngLat)
        .setDOMContent(card)
        .addTo(map);
    });

    map.on("mousemove", (e) => {
      const tool = activeToolRef.current;
      if (tool === "nearest" || tool === "measure") {
        map.getCanvas().style.cursor = "crosshair";
        return;
      }
      const presentLayers = INTERACTIVE_INSPECT_LAYERS.filter((id) => map.getLayer(id));
      const hits = map.queryRenderedFeatures(e.point, { layers: presentLayers });
      map.getCanvas().style.cursor = hits.length ? "pointer" : "";
    });

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      originMarkerRef.current?.remove();
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Push GeoJSON data + inverted spotlight mask once datasets load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !datasets) return;

    for (const meta of LAYER_CATALOG) {
      const src = map.getSource(`src-${meta.id}`) as GeoJSONSource | undefined;
      if (src) src.setData(datasets[meta.id]);
    }

    const spotlightSrc = map.getSource("overlay-spotlight") as GeoJSONSource | undefined;
    if (spotlightSrc) {
      spotlightSrc.setData(buildSpotlightMask(datasets.boundary));
    }
  }, [datasets, mapReady]);

  // 3. Synchronize basemap visibility, sky fog, & adaptive cartographic palette
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    for (const bm of BASEMAPS) {
      const id = `basemap-layer-${bm.id}`;
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", bm.id === basemap ? "visible" : "none");
      }
    }

    const theme = BASEMAP_THEMES[basemap];
    try {
      map.setSky(theme.sky);
    } catch {
      // Ignore if browser WebGL context does not support sky layer
    }

    if (map.getLayer("spotlight-mask")) {
      map.setPaintProperty("spotlight-mask", "fill-color", theme.spotlightColor);
      map.setPaintProperty("spotlight-mask", "fill-opacity", theme.spotlightOpacity);
    }
    if (map.getLayer("village-roads-line")) {
      map.setPaintProperty("village-roads-line", "line-color", theme.villageRoadColor);
    }
    if (map.getLayer("village-roads-casing")) {
      map.setPaintProperty("village-roads-casing", "line-color", theme.villageRoadCasing);
    }
    if (map.getLayer("residential-roads-line")) {
      map.setPaintProperty("residential-roads-line", "line-color", theme.residentialRoadColor);
    }
    if (map.getLayer("alleys-line")) {
      map.setPaintProperty("alleys-line", "line-color", theme.alleyRoadColor);
      map.setPaintProperty("alleys-line", "line-opacity", theme.alleyRoadOpacity);
    }
    if (map.getLayer("village-roads-labels")) {
      map.setPaintProperty("village-roads-labels", "text-color", theme.villageLabelColor);
      map.setPaintProperty("village-roads-labels", "text-halo-color", theme.villageLabelHalo);
    }
    if (map.getLayer("residential-roads-labels")) {
      map.setPaintProperty("residential-roads-labels", "text-color", theme.residentialLabelColor);
      map.setPaintProperty("residential-roads-labels", "text-halo-color", theme.residentialLabelHalo);
    }
    if (map.getLayer("boundary-line")) {
      map.setPaintProperty("boundary-line", "line-color", theme.boundaryColor);
    }
    if (map.getLayer("boundary-glow")) {
      map.setPaintProperty("boundary-glow", "line-color", theme.boundaryGlow);
    }
  }, [basemap, mapReady]);

  // 4. Adaptive Building Palette + 3D Catchment Building Highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const theme = BASEMAP_THEMES[basemap];
    const highlightIds =
      activeTool === "catchment" && catchmentResult?.matchedBuildingIds.length
        ? catchmentResult.matchedBuildingIds
        : null;

    if (highlightIds) {
      if (map.getLayer("buildings-3d")) {
        map.setPaintProperty("buildings-3d", "fill-extrusion-color", [
          "case",
          ["in", ["get", "FID"], ["literal", highlightIds]],
          "#34d399",
          theme.buildings3DLow,
        ]);
        map.setPaintProperty("buildings-3d", "fill-extrusion-opacity", 0.88);
      }
      if (map.getLayer("buildings-fill")) {
        map.setPaintProperty("buildings-fill", "fill-color", [
          "case",
          ["in", ["get", "FID"], ["literal", highlightIds]],
          "#10b981",
          theme.buildingsFillColor,
        ]);
        map.setPaintProperty("buildings-fill", "fill-opacity", [
          "case",
          ["in", ["get", "FID"], ["literal", highlightIds]],
          0.62,
          0.14,
        ]);
      }
    } else {
      if (map.getLayer("buildings-3d")) {
        map.setPaintProperty("buildings-3d", "fill-extrusion-color", [
          "interpolate",
          ["linear"],
          ["get", "height"],
          4.5,
          theme.buildings3DLow,
          8.5,
          theme.buildings3DHigh,
        ]);
        map.setPaintProperty("buildings-3d", "fill-extrusion-opacity", theme.buildings3DOpacity);
      }
      if (map.getLayer("buildings-fill")) {
        map.setPaintProperty("buildings-fill", "fill-color", theme.buildingsFillColor);
        map.setPaintProperty("buildings-fill", "fill-opacity", theme.buildingsFillOpacity);
      }
      if (map.getLayer("buildings-outline")) {
        map.setPaintProperty("buildings-outline", "line-color", theme.buildingsOutlineColor);
      }
    }
  }, [basemap, activeTool, catchmentResult, mapReady]);

  // 5. Synchronize vector layer visibility, 2D/3D mode, and Heatmap toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    for (const mapping of VECTOR_LAYER_MAPPINGS) {
      const isLayerOn = visibleLayers[mapping.layerId];
      const use3D = is3D && Boolean(mapping.extrusionLayers?.length);

      for (const id of mapping.flatLayers) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, "visibility", isLayerOn && !use3D ? "visible" : "none");
        }
      }
      if (mapping.extrusionLayers) {
        for (const id of mapping.extrusionLayers) {
          if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", isLayerOn && use3D ? "visible" : "none");
          }
        }
      }
    }

    if (map.getLayer("warungs-heatmap")) {
      map.setLayoutProperty("warungs-heatmap", "visibility", heatmapOn ? "visible" : "none");
    }

    if (prevIs3DRef.current !== null && prevIs3DRef.current !== is3D && !storyActiveRef.current) {
      map.easeTo({
        pitch: is3D ? 54 : 0,
        bearing: is3D ? -18 : 0,
        duration: prefersReducedMotion() ? 0 : 650,
      });
    }
    prevIs3DRef.current = is3D;
  }, [visibleLayers, is3D, heatmapOn, mapReady]);

  // 6. Render category-coded interactive accessible HTML markers for all warungs
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !warungs.length) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    for (const w of warungs) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = `warung-beacon cat-${w.category} ${w.source === "osm" ? "is-osm" : "is-qgis"}`;
      el.setAttribute("aria-label", `${w.name} — ${w.address}`);
      el.dataset.warungId = w.id;

      const pulse = document.createElement("span");
      pulse.className = "warung-beacon-pulse";

      const dot = document.createElement("span");
      dot.className = "warung-beacon-dot";

      const tag = document.createElement("span");
      tag.className = "warung-beacon-label";
      tag.textContent = w.name;

      el.append(pulse, dot, tag);

      el.addEventListener("click", (evt) => {
        evt.stopPropagation();
        if (activeToolRef.current === "nearest") {
          runNearestRef.current(w.coordinates, "click");
          return;
        }
        if (activeToolRef.current === "measure") {
          addMeasureRef.current(w.coordinates);
          return;
        }
        selectWarung(w.id, true);
      });

      el.addEventListener("mouseenter", () => setHoveredWarungId(w.id));
      el.addEventListener("mouseleave", () => setHoveredWarungId(null));

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(w.coordinates)
        .addTo(map);

      markersRef.current.set(w.id, { marker, el });
    }

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
    };
  }, [warungs, mapReady, selectWarung, setHoveredWarungId]);

  // 7. Update warung marker states (layer visibility, active filter, selection, hover)
  useEffect(() => {
    const showWarungs = visibleLayers.warungs;
    markersRef.current.forEach(({ el }, id) => {
      const matchesFilter = filteredWarungIdSet.has(id) || id === selectedWarungId;
      el.style.display = showWarungs && matchesFilter ? "flex" : "none";
      const isSelected = id === selectedWarungId;
      el.classList.toggle("is-selected", isSelected);
      el.classList.toggle("is-hovered", id === hoveredWarungId);
      if (!isSelected && document.activeElement === el) {
        el.blur();
      }
    });
  }, [
    visibleLayers.warungs,
    filteredWarungIdSet,
    selectedWarungId,
    hoveredWarungId,
    mapReady,
    warungs,
  ]);

  // 8. Update spatial analysis overlays + Pulsing Origin Pin + Animated Flowing Route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const setSrc = (id: string, data: FeatureCollection) => {
      const s = map.getSource(id) as GeoJSONSource | undefined;
      s?.setData(data);
    };

    if (activeTool === "catchment" && catchmentResult) {
      setSrc("overlay-catchment", {
        type: "FeatureCollection",
        features: [catchmentResult.buffer],
      });
    } else {
      setSrc("overlay-catchment", EMPTY_FC);
    }

    // Nearest Route + Pulsing Origin Pin
    originMarkerRef.current?.remove();
    originMarkerRef.current = null;
    let rafId = 0;

    if (activeTool === "nearest" && nearestResult) {
      setSrc("overlay-nearest-line", {
        type: "FeatureCollection",
        features: [nearestResult.line],
      });

      const pinEl = document.createElement("div");
      pinEl.className = "origin-pulse-pin";
      const ring = document.createElement("span");
      ring.className = "origin-pulse-ring";
      const core = document.createElement("span");
      core.className = "origin-pulse-core";
      pinEl.append(ring, core);

      originMarkerRef.current = new maplibregl.Marker({ element: pinEl, anchor: "center" })
        .setLngLat(nearestResult.origin)
        .addTo(map);

      if (!prefersReducedMotion() && map.getLayer("nearest-line-dash")) {
        let step = 0;
        let lastTime = 0;
        const animateDash = (ts: number) => {
          if (ts - lastTime >= 55) {
            step = (step + 1) % DASH_SEQUENCE.length;
            if (map.getLayer("nearest-line-dash")) {
              map.setPaintProperty("nearest-line-dash", "line-dasharray", DASH_SEQUENCE[step]);
            }
            lastTime = ts;
          }
          rafId = requestAnimationFrame(animateDash);
        };
        rafId = requestAnimationFrame(animateDash);
      }
    } else {
      setSrc("overlay-nearest-line", EMPTY_FC);
    }

    if (activeTool === "voronoi" && voronoiResult) {
      setSrc("overlay-voronoi", voronoiResult.territories);
      setSrc("overlay-gaps", voronoiResult.underservedZones);
    } else {
      setSrc("overlay-voronoi", EMPTY_FC);
      setSrc("overlay-gaps", EMPTY_FC);
    }

    if (activeTool === "measure") {
      setSrc("overlay-measure", measureResult.geometry);
    } else {
      setSrc("overlay-measure", EMPTY_FC);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    mapReady,
    activeTool,
    catchmentResult,
    nearestResult,
    voronoiResult,
    measureResult,
  ]);

  // 9. Fly camera on cameraTarget changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !cameraTarget) return;
    map.flyTo({
      center: cameraTarget.center,
      zoom: cameraTarget.zoom,
      pitch: cameraTarget.pitch ?? map.getPitch(),
      bearing: cameraTarget.bearing ?? map.getBearing(),
      duration: prefersReducedMotion() ? 0 : 950,
      essential: true,
    });
  }, [cameraTarget, mapReady]);

  // 10. Reset view when triggered
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || resetViewNonce === 0) return;
    map.fitBounds(BANDULAN_BOUNDS, {
      padding: {
        top: 90,
        bottom: 90,
        left: window.innerWidth >= 1024 ? 380 : 32,
        right: 64,
      },
      pitch: is3D ? 50 : 0,
      bearing: is3D ? -18 : 0,
      duration: prefersReducedMotion() ? 0 : 750,
    });
  }, [resetViewNonce, mapReady, is3D]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="region"
      aria-label="Interactive Bandulan Warung GIS map"
    />
  );
});
