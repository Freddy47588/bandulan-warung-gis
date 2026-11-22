import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

export type LayerId =
  | "warungs"
  | "boundary"
  | "village-roads"
  | "residential-roads"
  | "alleys"
  | "buildings"
  | "residential-areas"
  | "green-spaces"
  | "schools"
  | "factories"
  | "amenities"
  | "rivers";

export type LayerGroupId =
  | "business"
  | "administrative"
  | "infrastructure"
  | "urban"
  | "facilities"
  | "environment";

export type BasemapId = "satellite" | "dark" | "light" | "osm";

export type AnalysisTool =
  | "explore"
  | "catchment"
  | "nearest"
  | "voronoi"
  | "measure";

export type CatchmentRadius = 100 | 250 | 500;
export type MeasureMode = "distance" | "area";
export type RouteMode = "road" | "straight";

export type WarungCategory = "food" | "grocery" | "cafe" | "produce";
export type WarungSource = "qgis" | "osm";
export type AmenityType = "worship" | "health" | "civic" | "education";

export interface WarungProperties {
  id: string;
  Lokasi: string;
  Alamat: string;
  source?: WarungSource;
  category?: WarungCategory;
}

export interface AmenityProperties {
  id: string;
  Nama: string;
  amenityType: AmenityType;
  osmTag: string;
  source: "osm";
}

export interface NamedAreaProperties {
  id: string;
  Nama: string;
  LuasMeter: number;
  LuasHektar: number;
  height?: number;
}

export interface BuildingProperties {
  FID: string;
  height: number;
  buildingType?: string;
  source?: string;
}

export interface NamedLineProperties {
  id: string;
  Nama: string | null;
  highway?: string;
  source?: string;
  PanjangM: number;
  PanjangKM: number;
}

export type WarungFeature = Feature<Point, WarungProperties>;
export type AmenityFeature = Feature<Point, AmenityProperties>;
export type AreaFeature = Feature<Polygon | MultiPolygon, NamedAreaProperties>;
export type BuildingFeature = Feature<Polygon | MultiPolygon, BuildingProperties>;
export type LineFeature = Feature<LineString | MultiLineString, NamedLineProperties>;

export interface BandulanDatasets {
  warungs: FeatureCollection<Point, WarungProperties>;
  boundary: FeatureCollection<Polygon | MultiPolygon, NamedAreaProperties>;
  "village-roads": FeatureCollection<LineString | MultiLineString, NamedLineProperties>;
  "residential-roads": FeatureCollection<LineString | MultiLineString, NamedLineProperties>;
  alleys: FeatureCollection<LineString | MultiLineString, NamedLineProperties>;
  buildings: FeatureCollection<Polygon | MultiPolygon, BuildingProperties>;
  "residential-areas": FeatureCollection<Polygon | MultiPolygon, NamedAreaProperties>;
  "green-spaces": FeatureCollection<Polygon | MultiPolygon, NamedAreaProperties>;
  schools: FeatureCollection<Polygon | MultiPolygon, NamedAreaProperties>;
  factories: FeatureCollection<Polygon | MultiPolygon, NamedAreaProperties>;
  amenities: FeatureCollection<Point, AmenityProperties>;
  rivers: FeatureCollection<LineString | MultiLineString, NamedLineProperties>;
}

export interface SpatialRef {
  name: string;
  distanceMeters: number;
}

export interface EnrichedWarung {
  id: string;
  name: string;
  address: string;
  source: WarungSource;
  category: WarungCategory;
  coordinates: [number, number];
  feature: WarungFeature;
  nearestRoad: SpatialRef;
  nearestSchool: SpatialRef;
  nearestFactory: SpatialRef;
  nearestAmenity: SpatialRef;
  nearestRiver: SpatialRef;
  nearestWarung: SpatialRef;
  buildingsWithin250m: number;
}

export interface CatchmentResult {
  warungId: string;
  warungName: string;
  radiusMeters: CatchmentRadius;
  buffer: Feature<Polygon | MultiPolygon>;
  counts: {
    buildings: number;
    schools: number;
    factories: number;
    amenities: number;
    residentialAreas: number;
    greenSpaces: number;
    otherWarungs: number;
  };
  schoolNames: string[];
  factoryNames: string[];
  amenityNames: string[];
  otherWarungNames: string[];
  matchedBuildingIds: string[];
}

export interface NearestWarungRanking {
  id: string;
  name: string;
  address: string;
  distanceMeters: number;
  walkMinutes: number;
  coordinates: [number, number];
  viaRoad: boolean;
}

export interface NearestResult {
  origin: [number, number];
  source: "click" | "gps";
  routeMode: RouteMode;
  viaRoad: boolean;
  nearest: NearestWarungRanking;
  topThree: NearestWarungRanking[];
  line: Feature<LineString>;
  originPoint: Feature<Point>;
}

export interface VoronoiTerritoryProps {
  warungId: string;
  warungName: string;
  areaHa: number;
  sharePercent: number;
  buildingCount: number;
  color: string;
}

export interface CoverageGapZone {
  id: string;
  name: string;
  areaHa: number;
  distanceToNearestWarungMeters: number;
  nearestWarungName: string;
  underserved: boolean;
  feature: Feature<Polygon | MultiPolygon>;
}

export interface VoronoiAnalysisResult {
  territories: FeatureCollection<Polygon | MultiPolygon, VoronoiTerritoryProps>;
  underservedZones: FeatureCollection<Polygon | MultiPolygon, { id: string; name: string; distanceMeters: number }>;
  allResidentialCoverage: CoverageGapZone[];
  maxGapMeters: number;
  avgDistanceMeters: number;
  underservedThresholdMeters: number;
}

export interface SpatialInsights {
  boundaryAreaHa: number;
  warungCount: number;
  qgisWarungCount: number;
  osmWarungCount: number;
  warungDensityPerKm2: number;
  totalRoadKm: number;
  roadBreakdown: Array<{
    layerId: "village-roads" | "residential-roads" | "alleys";
    lengthKm: number;
    featureCount: number;
    color: string;
  }>;
  landUseBreakdown: Array<{
    layerId: "residential-areas" | "factories" | "green-spaces" | "schools" | "buildings";
    areaHa: number;
    shareOfBoundaryPct: number;
    featureCount: number;
    color: string;
  }>;
  amenityCount: number;
  amenityBreakdown: Array<{
    type: AmenityType;
    count: number;
    color: string;
  }>;
  riverLengthKm: number;
  nearestNeighborAvgM: number;
  nearestNeighborMinM: number;
  nearestNeighborMaxM: number;
}

export interface MeasureResult {
  mode: MeasureMode;
  points: [number, number][];
  totalDistanceMeters: number;
  areaSqm: number;
  perimeterMeters: number;
  geometry: FeatureCollection<Geometry>;
}

export interface GlobalSearchHit {
  id: string;
  kind: "warung" | "road" | "school" | "factory" | "amenity" | "green";
  name: string;
  subtitle: string;
  coordinates: [number, number];
  zoom: number;
  warungId?: string;
}
