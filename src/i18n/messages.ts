export type Locale = "en" | "id";

export const MESSAGES = {
  // Brand & TopBar
  "brand.title": {
    en: "Bandulan Warung GIS",
    id: "Bandulan Warung GIS",
  },
  "brand.subtitle": {
    en: "Spatial Intelligence · Malang",
    id: "Intelijen Spasial · Malang",
  },
  "nav.storyMode": {
    en: "Story Mode",
    id: "Mode Cerita",
  },
  "nav.exitStory": {
    en: "Exit Story",
    id: "Keluar Cerita",
  },
  "nav.insights": {
    en: "Insights",
    id: "Statistik",
  },
  "nav.share": {
    en: "Share View",
    id: "Bagikan",
  },
  "nav.copied": {
    en: "Link Copied",
    id: "Tautan Disalin",
  },
  "nav.about": {
    en: "About",
    id: "Tentang",
  },
  "nav.explorer": {
    en: "Explorer",
    id: "Jelajah",
  },
  "nav.closePanel": {
    en: "Close panel",
    id: "Tutup panel",
  },
  "nav.openExplorer": {
    en: "Open explorer panel",
    id: "Buka panel jelajah",
  },

  // Tabs & Explorer
  "explorer.warungsTab": {
    en: "Warungs",
    id: "Warung",
  },
  "explorer.layersTab": {
    en: "Layers",
    id: "Lapisan",
  },
  "explorer.searchPlaceholder": {
    en: "Search warungs, roads, schools, amenities…",
    id: "Cari warung, jalan, sekolah, fasilitas…",
  },
  "explorer.globalHits": {
    en: "Other Map Features",
    id: "Fitur Peta Lainnya",
  },
  "explorer.showingCount": {
    en: "Showing {shown} of {total} warungs",
    id: "Menampilkan {shown} dari {total} warung",
  },
  "explorer.noResults": {
    en: "No matching warungs or features found.",
    id: "Tidak ada warung atau fitur yang cocok.",
  },
  "explorer.buildingsNearby": {
    en: "{count} bldgs / 250m",
    id: "{count} bgn / 250m",
  },
  "explorer.fromMainRoad": {
    en: "{dist}m to road",
    id: "{dist}m ke jalan",
  },
  "explorer.presetDefault": {
    en: "Default",
    id: "Bawaan",
  },
  "explorer.presetAll": {
    en: "All Layers",
    id: "Semua",
  },
  "explorer.presetMinimal": {
    en: "Warungs Only",
    id: "Hanya Warung",
  },
  "explorer.activeLayers": {
    en: "{count} active",
    id: "{count} aktif",
  },

  // Sources & Categories
  "source.all": {
    en: "All Sources",
    id: "Semua Sumber",
  },
  "source.qgis": {
    en: "QGIS Survey",
    id: "Survei QGIS",
  },
  "source.osm": {
    en: "OSM Mapped",
    id: "Data OSM",
  },
  "category.all": {
    en: "All",
    id: "Semua",
  },
  "category.food": {
    en: "Food & Eatery",
    id: "Warung Makan",
  },
  "category.grocery": {
    en: "Grocery / Toko",
    id: "Kelontong",
  },
  "category.cafe": {
    en: "Coffee & Drinks",
    id: "Kopi & Minum",
  },
  "category.produce": {
    en: "Fresh Produce",
    id: "Sayur & Buah",
  },
  "amenity.worship": {
    en: "Worship (Mosque/Church)",
    id: "Tempat Ibadah",
  },
  "amenity.health": {
    en: "Health & Pharmacy",
    id: "Kesehatan & Apotek",
  },
  "amenity.civic": {
    en: "Civic, Market & Public",
    id: "Layanan Publik & Pasar",
  },
  "amenity.education": {
    en: "Additional Schools / TK",
    id: "Pendidikan / TK",
  },
  "searchKind.road": {
    en: "Road",
    id: "Jalan",
  },
  "searchKind.school": {
    en: "School",
    id: "Sekolah",
  },
  "searchKind.factory": {
    en: "Factory",
    id: "Pabrik",
  },
  "searchKind.amenity": {
    en: "Facility",
    id: "Fasilitas",
  },
  "searchKind.green": {
    en: "Green Space",
    id: "Ruang Hijau",
  },

  // Warung Detail Card
  "detail.backToList": {
    en: "Back to list",
    id: "Kembali ke daftar",
  },
  "detail.spatialContext": {
    en: "Computed Spatial Context",
    id: "Konteks Spasial Terhitung",
  },
  "detail.nearestRoad": {
    en: "Nearest Main Road",
    id: "Jalan Utama Terdekat",
  },
  "detail.nearestSchool": {
    en: "Nearest School",
    id: "Sekolah Terdekat",
  },
  "detail.nearestAmenity": {
    en: "Nearest Public Facility",
    id: "Fasilitas Publik Terdekat",
  },
  "detail.nearestFactory": {
    en: "Nearest Factory",
    id: "Pabrik Terdekat",
  },
  "detail.nearestRiver": {
    en: "Nearest River",
    id: "Sungai Terdekat",
  },
  "detail.nearestWarung": {
    en: "Nearest Neighbor Warung",
    id: "Warung Tetangga Terdekat",
  },
  "detail.buildings250m": {
    en: "Buildings within 250m",
    id: "Bangunan dalam 250m",
  },
  "detail.coordinates": {
    en: "Coordinates (WGS84)",
    id: "Koordinat (WGS84)",
  },
  "detail.analyzeCatchment": {
    en: "Analyze Catchment Radius",
    id: "Analisis Radius Jangkauan",
  },
  "detail.centerMap": {
    en: "Focus Camera",
    id: "Fokus Kamera",
  },

  // Groups & Layers
  "group.business": {
    en: "Local Business",
    id: "Usaha Lokal",
  },
  "group.administrative": {
    en: "Administrative",
    id: "Administrasi",
  },
  "group.infrastructure": {
    en: "Road Network",
    id: "Jaringan Jalan",
  },
  "group.urban": {
    en: "Urban Fabric",
    id: "Struktur Perkotaan",
  },
  "group.facilities": {
    en: "Public & Industrial",
    id: "Fasilitas & Industri",
  },
  "group.environment": {
    en: "Environment",
    id: "Lingkungan",
  },
  "layer.warungs": {
    en: "Warungs & Local Shops",
    id: "Warung & Toko Lokal",
  },
  "layer.boundary": {
    en: "Bandulan Boundary",
    id: "Batas Kelurahan",
  },
  "layer.village-roads": {
    en: "Main / Arterial Roads",
    id: "Jalan Utama / Desa",
  },
  "layer.residential-roads": {
    en: "Residential Streets",
    id: "Jalan Perumahan",
  },
  "layer.alleys": {
    en: "Alleys & Paths",
    id: "Jalan Gang & Setapak",
  },
  "layer.buildings": {
    en: "OSM Buildings (3D)",
    id: "Bangunan OSM (3D)",
  },
  "layer.residential-areas": {
    en: "Residential Zones",
    id: "Zona Pemukiman",
  },
  "layer.green-spaces": {
    en: "Green Spaces",
    id: "Lahan Terbuka Hijau",
  },
  "layer.schools": {
    en: "Schools (3D)",
    id: "Sekolah (3D)",
  },
  "layer.factories": {
    en: "Factories (3D)",
    id: "Pabrik (3D)",
  },
  "layer.amenities": {
    en: "Supporting Facilities",
    id: "Fasilitas Pendukung",
  },
  "layer.rivers": {
    en: "Rivers",
    id: "Sungai",
  },

  // Analysis Tools
  "tool.explore": {
    en: "Explore",
    id: "Jelajah",
  },
  "tool.catchment": {
    en: "Catchment",
    id: "Jangkauan",
  },
  "tool.nearest": {
    en: "Nearest",
    id: "Terdekat",
  },
  "tool.voronoi": {
    en: "Voronoi & Gaps",
    id: "Voronoi & Celah",
  },
  "tool.measure": {
    en: "Measure",
    id: "Ukur",
  },

  // Catchment Panel
  "catchment.title": {
    en: "Catchment Buffer Analysis",
    id: "Analisis Radius Jangkauan",
  },
  "catchment.prompt": {
    en: "Select any warung marker or card to compute its service buffer.",
    id: "Pilih penanda atau kartu warung untuk menghitung area jangkauannya.",
  },
  "catchment.radius": {
    en: "Buffer Radius",
    id: "Radius Buffer",
  },
  "catchment.buildings": {
    en: "Buildings",
    id: "Bangunan",
  },
  "catchment.schools": {
    en: "Schools",
    id: "Sekolah",
  },
  "catchment.factories": {
    en: "Factories",
    id: "Pabrik",
  },
  "catchment.amenities": {
    en: "Facilities",
    id: "Fasilitas",
  },
  "catchment.residential": {
    en: "Res. Zones",
    id: "Pemukiman",
  },
  "catchment.green": {
    en: "Green Spaces",
    id: "Ruang Hijau",
  },
  "catchment.otherWarungs": {
    en: "Other Warungs",
    id: "Warung Lain",
  },
  "catchment.exportCsv": {
    en: "CSV",
    id: "CSV",
  },
  "catchment.exportGeoJson": {
    en: "GeoJSON",
    id: "GeoJSON",
  },

  // Nearest Panel
  "nearest.title": {
    en: "Nearest Warung Finder",
    id: "Pencari Warung Terdekat",
  },
  "nearest.prompt": {
    en: "Click anywhere on the map or tap Locate Me to route to the closest warung.",
    id: "Klik titik mana saja di peta atau tekan Lokasi Saya untuk rute ke warung terdekat.",
  },
  "nearest.useGps": {
    en: "Use My GPS",
    id: "Gunakan GPS",
  },
  "nearest.roadRoute": {
    en: "Road Route",
    id: "Rute Jalan",
  },
  "nearest.straightLine": {
    en: "Straight Line",
    id: "Garis Lurus",
  },
  "nearest.viaRoadNote": {
    en: "~{min} min walk via road network",
    id: "~{min} mnt jalan kaki lewat jalan",
  },
  "nearest.walkNote": {
    en: "~{min} min walk (straight-line est.)",
    id: "~{min} mnt jalan kaki (est. garis lurus)",
  },
  "nearest.topThree": {
    en: "Top 3 Closest",
    id: "3 Terdekat",
  },
  "nearest.clear": {
    en: "Clear Point",
    id: "Hapus Titik",
  },

  // Voronoi Panel
  "voronoi.title": {
    en: "Voronoi Territories & Coverage Gaps",
    id: "Zona Voronoi & Celah Layanan",
  },
  "voronoi.description": {
    en: "Kelurahan Bandulan partitioned by nearest warung. Residential zones farthest from warungs are highlighted in rose.",
    id: "Kelurahan Bandulan dibagi berdasarkan warung terdekat. Zona pemukiman terjauh dari warung disorot merah muda.",
  },
  "voronoi.avgDistance": {
    en: "Avg. Residential Distance",
    id: "Rata-rata Jarak Pemukiman",
  },
  "voronoi.maxGap": {
    en: "Furthest Zone",
    id: "Zona Terjauh",
  },
  "voronoi.underservedCount": {
    en: "Highlight Zones",
    id: "Zona Celah",
  },
  "voronoi.largestTerritories": {
    en: "Largest Service Territories",
    id: "Wilayah Layanan Terluas",
  },
  "voronoi.buildingsShort": {
    en: "{count} bldgs",
    id: "{count} bgn",
  },

  // Measure Panel
  "measure.title": {
    en: "Interactive Measure Tool",
    id: "Alat Ukur Interaktif",
  },
  "measure.distance": {
    en: "Distance",
    id: "Jarak",
  },
  "measure.area": {
    en: "Area",
    id: "Luas",
  },
  "measure.hintDistance": {
    en: "Click points on the map to trace a path.",
    id: "Klik titik pada peta untuk mengukur lintasan jarak.",
  },
  "measure.hintArea": {
    en: "Click at least 3 points on the map to measure area.",
    id: "Klik minimal 3 titik pada peta untuk mengukur luas.",
  },
  "measure.totalDistance": {
    en: "Total Distance",
    id: "Total Jarak",
  },
  "measure.totalArea": {
    en: "Polygon Area",
    id: "Luas Poligon",
  },
  "measure.perimeter": {
    en: "Perimeter",
    id: "Keliling",
  },
  "measure.undo": {
    en: "Undo",
    id: "Urungkan",
  },
  "measure.clear": {
    en: "Clear",
    id: "Bersihkan",
  },
  "measure.points": {
    en: "{count} pts",
    id: "{count} titik",
  },

  // Map Controls
  "controls.basemap": {
    en: "Basemap",
    id: "Peta Dasar",
  },
  "basemap.satellite": {
    en: "Satellite",
    id: "Satelit",
  },
  "basemap.dark": {
    en: "Dark",
    id: "Gelap",
  },
  "basemap.light": {
    en: "Light",
    id: "Terang",
  },
  "basemap.osm": {
    en: "OSM",
    id: "OSM",
  },
  "controls.toggle3D": {
    en: "Toggle 3D buildings",
    id: "Alihkan bangunan 3D",
  },
  "controls.heatmap": {
    en: "Toggle Warung Heatmap",
    id: "Alihkan Heatmap Warung",
  },
  "controls.locate": {
    en: "Locate me",
    id: "Lokasi saya",
  },
  "controls.reset": {
    en: "Reset study area view",
    id: "Kembalikan tampilan Bandulan",
  },
  "controls.zoomIn": {
    en: "Zoom in",
    id: "Perbesar",
  },
  "controls.zoomOut": {
    en: "Zoom out",
    id: "Perkecil",
  },
  "controls.schematic3D": {
    en: "3D heights are schematic",
    id: "Tinggi 3D bersifat skematis",
  },
  "legend.title": {
    en: "Legend",
    id: "Legenda",
  },
  "legend.warungCategories": {
    en: "Warung Categories",
    id: "Kategori Warung",
  },
  "legend.supportingFacilities": {
    en: "Facilities (zoom in)",
    id: "Fasilitas (perbesar)",
  },

  // Insights Drawer
  "insights.title": {
    en: "Spatial Insights Dashboard",
    id: "Dasbor Statistik Spasial",
  },
  "insights.subtitle": {
    en: "Computed live from 12 Bandulan GeoJSON layers via Turf.js",
    id: "Dihitung langsung dari 12 layer GeoJSON Bandulan dengan Turf.js",
  },
  "insights.studyArea": {
    en: "Study Area",
    id: "Luas Wilayah",
  },
  "insights.warungDensity": {
    en: "Warung Density",
    id: "Kepadatan Warung",
  },
  "insights.totalRoads": {
    en: "Road Network",
    id: "Total Jalan",
  },
  "insights.avgSpacing": {
    en: "Avg. Warung Spacing",
    id: "Rata-rata Jarak Warung",
  },
  "insights.warungSources": {
    en: "{total} total · {qgis} QGIS Survey + {osm} OpenStreetMap",
    id: "{total} total · {qgis} Survei QGIS + {osm} OpenStreetMap",
  },
  "insights.roadBreakdown": {
    en: "Road Network Breakdown",
    id: "Komposisi Jaringan Jalan",
  },
  "insights.landUse": {
    en: "Mapped Land-Use & Footprints",
    id: "Tutupan Lahan & Jejak Bangunan",
  },
  "insights.amenitiesTitle": {
    en: "Supporting Public Facilities ({count})",
    id: "Fasilitas Pendukung Publik ({count})",
  },
  "insights.exportCsv": {
    en: "Export Insights CSV",
    id: "Unduh CSV Statistik",
  },
  "insights.riverNote": {
    en: "Mapped river corridors (Kali Metro & tributary): {km} km",
    id: "Koridor sungai terpetakan (Kali Metro & cabang): {km} km",
  },
  "insights.spacingNote": {
    en: "Nearest-neighbor spacing ranges from {min}m to {max}m across all mapped warungs.",
    id: "Jarak antar warung terdekat berkisar antara {min}m hingga {max}m di seluruh warung terpetakan.",
  },
  "insights.segments": {
    en: "{count} segments",
    id: "{count} segmen",
  },
  "insights.features": {
    en: "{count} features",
    id: "{count} fitur",
  },

  // Story Mode
  "story.badge": {
    en: "Guided Spatial Story",
    id: "Tur Cerita Spasial",
  },
  "story.stepOf": {
    en: "Chapter {current} of {total}",
    id: "Bab {current} dari {total}",
  },
  "story.prev": {
    en: "Previous",
    id: "Sebelumnya",
  },
  "story.next": {
    en: "Next",
    id: "Berikutnya",
  },
  "story.finish": {
    en: "Start Exploring",
    id: "Mulai Jelajah",
  },
  "story.ch1.title": {
    en: "Kelurahan Bandulan, Malang",
    id: "Kelurahan Bandulan, Malang",
  },
  "story.ch1.body": {
    en: "Covering 230.6 hectares in Kecamatan Sukun, Bandulan blends dense residential neighborhoods, main arterial roads, schools, mosques, clinics, and industrial zones along Kali Metro.",
    id: "Mencakup 230,6 hektare di Kecamatan Sukun, Bandulan memadukan kawasan pemukiman padat, jalan arteri lokal, sekolah, masjid, klinik, dan zona industri di sepanjang koridor Kali Metro.",
  },
  "story.ch2.title": {
    en: "Complete Connected Road Network",
    id: "Jaringan Jalan Lengkap & Terhubung",
  },
  "story.ch2.body": {
    en: "Over 840 mapped street segments — spanning Jalan Bandulan, residential grids, and neighborhood alleys — form a connected routing graph powering real street-level walking distances.",
    id: "Lebih dari 840 segmen jalan terpetakan — dari Jalan Bandulan, jaringan jalan perumahan, hingga gang warga — membentuk graf rute terhubung untuk menghitung jarak jalan kaki nyata.",
  },
  "story.ch3.title": {
    en: "3D Urban Massing & Supporting Facilities",
    id: "Struktur Perkotaan 3D & Fasilitas Pendukung",
  },
  "story.ch3.body": {
    en: "Over 3,150 individual OpenStreetMap building footprints in 3D sit alongside 6 school campuses, 5 factories, 4 green spaces, and 58 supporting community facilities (mosques, clinics, markets).",
    id: "Lebih dari 3.150 tapak bangunan OpenStreetMap dalam 3D berdiri bersama 6 sekolah, 5 pabrik, 4 ruang hijau, dan 58 fasilitas pendukung warga (masjid, klinik/apotek, pasar, balai).",
  },
  "story.ch4.title": {
    en: "Warung Distribution & 250m Catchment",
    id: "Persebaran Warung & Jangkauan 250m",
  },
  "story.ch4.body": {
    en: "36 local warungs and neighborhood shops (10 original QGIS survey points + 26 OpenStreetMap locations) cluster along main corridors. A 250m buffer quantifies surrounding buildings and facilities.",
    id: "36 warung dan toko lokal (10 titik survei QGIS awal + 26 lokasi OpenStreetMap) mengelompok di koridor utama. Radius 250m menghitung bangunan dan fasilitas pendukung di sekitarnya.",
  },
  "story.ch5.title": {
    en: "Voronoi Service Zones & Coverage Gaps",
    id: "Zona Layanan Voronoi & Celah Cakupan",
  },
  "story.ch5.body": {
    en: "Partitioning Bandulan into clipped Voronoi service territories reveals each warung's nearest footprint and highlights residential zones farthest from mapped businesses. Exit to explore freely.",
    id: "Pembagian wilayah Bandulan ke dalam zona Voronoi terpotong memperlihatkan wilayah layanan tiap warung sekaligus menyorot pemukiman terjauh. Keluar untuk menjelajah secara bebas.",
  },

  // About Modal
  "about.title": {
    en: "About Bandulan Warung GIS v2",
    id: "Tentang Bandulan Warung GIS v2",
  },
  "about.lead": {
    en: "A client-side Spatial Intelligence WebGIS combining original QGIS survey data with OpenStreetMap urban geography across Kelurahan Bandulan, Kecamatan Sukun, Malang.",
    id: "WebGIS Intelijen Spasial berbasis browser yang memadukan data survei QGIS asli dengan geografi perkotaan OpenStreetMap di seluruh Kelurahan Bandulan, Kecamatan Sukun, Malang.",
  },
  "about.workflowTitle": {
    en: "Data & Engineering Pipeline",
    id: "Alur Data & Rekayasa",
  },
  "about.workflowBody": {
    en: "Original QGIS layers (boundary, warung survey, schools, factories, green spaces, rivers) are combined with OpenStreetMap roads, individual building footprints, local shops, and supporting facilities — all clipped cleanly to Bandulan's boundary and analyzed client-side via Turf.js and Dijkstra road routing.",
    id: "Layer QGIS asli (batas kelurahan, survei warung, sekolah, pabrik, RTH, sungai) dipadukan dengan jalan, tapak bangunan individual, warung/toko, dan fasilitas pendukung dari OpenStreetMap — semuanya di-clip ke batas Bandulan dan dianalisis langsung di browser dengan Turf.js serta routing Dijkstra.",
  },
  "about.transparencyTitle": {
    en: "Data Provenance & Transparency",
    id: "Transparansi & Sumber Data",
  },
  "about.transparencyList1": {
    en: "Every warung is transparently tagged as 'QGIS Survey' (10 original field points) or 'OSM Mapped' (26 real OpenStreetMap POIs inside Bandulan).",
    id: "Setiap warung ditandai transparan sebagai 'Survei QGIS' (10 titik asli) atau 'Data OSM' (26 POI nyata OpenStreetMap di dalam Bandulan).",
  },
  "about.transparencyList2": {
    en: "Jagged GeoAI building blobs (250 features) were replaced with 3,157 clean OpenStreetMap building footprints, and the full 843-segment Bandulan street network enables real road-network routing.",
    id: "Poligon bangunan GeoAI kasar (250 fitur) diganti dengan 3.157 tapak bangunan OpenStreetMap yang rapi, dan 843 segmen jalan Bandulan memungkinkan routing rute jalan nyata.",
  },
  "about.transparencyList3": {
    en: "3D extrusions use OSM building:levels where tagged and schematic heights (4.5–12 m) elsewhere for illustrative urban massing.",
    id: "Ekstrusi 3D memakai tag building:levels OSM bila tersedia dan tinggi skematis (4,5–12 m) pada bangunan lainnya untuk visualisasi massa perkotaan.",
  },
  "about.layoutTitle": {
    en: "Original QGIS Cartographic Layout",
    id: "Tata Letak Kartografi QGIS Asli",
  },
  "about.openFullLayout": {
    en: "Open full-resolution layout",
    id: "Buka tata letak resolusi penuh",
  },
  "about.viewSource": {
    en: "View Source on GitHub",
    id: "Lihat Kode di GitHub",
  },

  // Status / Errors / Popups
  "status.loading": {
    en: "Loading spatial datasets & building road routing graph…",
    id: "Memuat dataset spasial & membangun graf rute jalan…",
  },
  "status.loadError": {
    en: "Failed to load spatial datasets. Please reload the page.",
    id: "Gagal memuat dataset spasial. Silakan muat ulang halaman.",
  },
  "status.gpsUnsupported": {
    en: "Geolocation is not supported by this browser.",
    id: "Geolokasi tidak didukung oleh peramban ini.",
  },
  "status.gpsLocating": {
    en: "Locating your position…",
    id: "Mencari posisi Anda…",
  },
  "status.gpsDenied": {
    en: "Location permission denied. Click anywhere on the map instead.",
    id: "Izin lokasi ditolak. Anda dapat mengklik titik mana saja di peta.",
  },
  "status.gpsOutside": {
    en: "Your location is outside Bandulan. Use Reset View to return.",
    id: "Lokasi Anda berada di luar Bandulan. Gunakan tombol Reset untuk kembali.",
  },
  "status.gpsFound": {
    en: "Position located. Showing nearest warung.",
    id: "Posisi ditemukan. Menampilkan warung terdekat.",
  },
  "status.tileError": {
    en: "Some basemap tiles could not load. Vector layers remain active.",
    id: "Sebagian ubin peta dasar gagal dimuat. Lapisan vektor tetap aktif.",
  },
  "status.exported": {
    en: "Export downloaded.",
    id: "File ekspor diunduh.",
  },
  "popup.area": {
    en: "Area",
    id: "Luas",
  },
  "popup.length": {
    en: "Length",
    id: "Panjang",
  },
  "popup.fid": {
    en: "Building ID",
    id: "ID Bangunan",
  },
  "popup.type": {
    en: "Category",
    id: "Kategori",
  },
  "popup.address": {
    en: "Address",
    id: "Alamat",
  },
  "popup.territory": {
    en: "Service Territory",
    id: "Wilayah Layanan",
  },
  "popup.share": {
    en: "Bandulan Share",
    id: "Porsi Bandulan",
  },
  "popup.buildingsInside": {
    en: "Buildings Inside",
    id: "Bangunan di Dalam",
  },
} as const;

export type MessageKey = keyof typeof MESSAGES;
