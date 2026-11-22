import type { MessageKey } from "../i18n/messages";
import type { AnalysisTool, CatchmentRadius, LayerId } from "../types/geo";

export interface StoryChapter {
  id: number;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  camera: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
  is3D: boolean;
  visibleLayers: LayerId[];
  tool: AnalysisTool;
  selectedWarungId?: string;
  catchmentRadius?: CatchmentRadius;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    titleKey: "story.ch1.title",
    bodyKey: "story.ch1.body",
    camera: {
      center: [112.6012, -7.9845],
      zoom: 14.3,
      pitch: 15,
      bearing: 0,
    },
    is3D: false,
    visibleLayers: ["boundary", "rivers", "warungs"],
    tool: "explore",
  },
  {
    id: 2,
    titleKey: "story.ch2.title",
    bodyKey: "story.ch2.body",
    camera: {
      center: [112.6025, -7.9845],
      zoom: 14.9,
      pitch: 24,
      bearing: -10,
    },
    is3D: false,
    visibleLayers: [
      "boundary",
      "village-roads",
      "residential-roads",
      "alleys",
      "warungs",
    ],
    tool: "explore",
  },
  {
    id: 3,
    titleKey: "story.ch3.title",
    bodyKey: "story.ch3.body",
    camera: {
      center: [112.6032, -7.9822],
      zoom: 15.8,
      pitch: 56,
      bearing: -24,
    },
    is3D: true,
    visibleLayers: [
      "boundary",
      "buildings",
      "schools",
      "factories",
      "amenities",
      "green-spaces",
      "village-roads",
      "warungs",
    ],
    tool: "explore",
  },
  {
    id: 4,
    titleKey: "story.ch4.title",
    bodyKey: "story.ch4.body",
    camera: {
      center: [112.6056, -7.9828],
      zoom: 16.0,
      pitch: 42,
      bearing: -12,
    },
    is3D: true,
    visibleLayers: [
      "boundary",
      "village-roads",
      "residential-roads",
      "buildings",
      "schools",
      "amenities",
      "warungs",
    ],
    tool: "catchment",
    selectedWarungId: "3",
    catchmentRadius: 250,
  },
  {
    id: 5,
    titleKey: "story.ch5.title",
    bodyKey: "story.ch5.body",
    camera: {
      center: [112.602, -7.9842],
      zoom: 14.5,
      pitch: 22,
      bearing: 0,
    },
    is3D: false,
    visibleLayers: ["boundary", "village-roads", "warungs"],
    tool: "voronoi",
  },
];
