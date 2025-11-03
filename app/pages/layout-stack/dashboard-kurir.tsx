import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

type Task = {
  resi: string;
  alamat: string;
  phone?: string;
  date?: string; // YYYY-MM-DD untuk riwayat
};

const sampleTasks: Task[] = [
  { resi: 'RESI-001234', alamat: 'Monas, Jakarta Pusat', phone: '+628123456789' },
  { resi: 'RESI-001235', alamat: 'Kota Tua, Jakarta Barat' },
  { resi: 'RESI-001236', alamat: 'Blok M Plaza, Jakarta Selatan' },
];

// Data riwayat tugas (contoh) dengan tanggal selesai
const taskHistory: Task[] = [
  { resi: 'RESI-000999', alamat: 'Stasiun Gambir, Jakarta Pusat', phone: '+628111111111', date: '2025-11-01' },
  { resi: 'RESI-000998', alamat: 'Pasar Senen, Jakarta Pusat', date: '2025-11-01' },
  { resi: 'RESI-000997', alamat: 'PIK Avenue, Jakarta Utara', date: '2025-10-31' },
  { resi: 'RESI-000996', alamat: 'Kemang Village, Jakarta Selatan', date: '2025-10-31' },
];

export default function DashboardKurir() {
  const [selected, setSelected] = useState<Task | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

  // Segmented view: 'list' | 'waypoint' | 'history'
  const [segment, setSegment] = useState<'list' | 'waypoint' | 'history'>('list');

  // Riwayat: filter tanggal (default hari ini)
  const [historyDate, setHistoryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const filteredHistory = useMemo(() => taskHistory.filter((t) => t.date === historyDate), [historyDate]);

  // TSP map refs
  const tspMapRef = useRef<any>(null);
  const tspPolylineRef = useRef<any>(null);
  const tspMarkersRef = useRef<any[]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]); // indices of sampleTasks in visit order
  const [isComputingTsp, setIsComputingTsp] = useState(false);
  const [nativeTspPath, setNativeTspPath] = useState<[number, number][]>([]);
  const [nativeTspStops, setNativeTspStops] = useState<[number, number][]>([]);

  // Waypoint tracking & follow route
  const [tspTrackingEnabled, setTspTrackingEnabled] = useState(false);
  const tspWatchIdRef = useRef<any>(null);
  const tspDeviceMarkerRef = useRef<any>(null);
  const [tspFollowEnabled, setTspFollowEnabled] = useState(false);
  const tspFollowTimerRef = useRef<any>(null);
  const tspFollowIdxRef = useRef<number>(0);
  const tspRouteLatLngsRef = useRef<[number, number][]>([]);
  const tspFollowerMarkerRef = useRef<any>(null);

  const mapRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const leafletCssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const leafletJsSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  // =======================
  // Segmen 1: Dashboard Kirim Barang (dipindahkan dari dashboard-kirim)
  // =======================
  type ShipmentStatus = 'pending' | 'in_transit' | 'delivered';
  type Shipment = {
    id: string;
    date: string; // YYYY-MM-DD
    origin: string;
    destination: string;
    category: string;
    weightKg: number;
    volumeM3: number;
    costIdr: number;
    status: ShipmentStatus;
    phone?: string;
  };

  const SAMPLE_SHIPMENTS: Shipment[] = [
    { id: 'INV-0001', date: '2025-11-02', origin: 'Jakarta Selatan', destination: 'Depok', category: 'Dokumen', weightKg: 1.2, volumeM3: 0.005, costIdr: 25000, status: 'pending', phone: '6281234560001' },
    { id: 'INV-0002', date: '2025-11-02', origin: 'Bekasi', destination: 'Jakarta Pusat', category: 'Elektronik', weightKg: 3.5, volumeM3: 0.02, costIdr: 78000, status: 'in_transit', phone: '6281234560002' },
    { id: 'INV-0003', date: '2025-11-01', origin: 'Tangerang', destination: 'Bogor', category: 'Makanan', weightKg: 2.0, volumeM3: 0.01, costIdr: 52000, status: 'delivered', phone: '6281234560003' },
    { id: 'INV-0004', date: '2025-11-01', origin: 'Depok', destination: 'Jakarta Timur', category: 'Pakaian', weightKg: 1.8, volumeM3: 0.006, costIdr: 33000, status: 'in_transit', phone: '6281234560004' },
    { id: 'INV-0005', date: '2025-10-31', origin: 'Jakarta Barat', destination: 'Tangerang', category: 'Aksesoris', weightKg: 0.9, volumeM3: 0.003, costIdr: 21000, status: 'delivered', phone: '6281234560005' },
  ];

  const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const [shipQuery, setShipQuery] = useState('');
  const [shipStatusFilter, setShipStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [shipDateFilter, setShipDateFilter] = useState<string>('');

  const filteredShipments = useMemo(() => {
    return SAMPLE_SHIPMENTS.filter((s) => {
      const matchesStatus = shipStatusFilter === 'all' ? true : s.status === shipStatusFilter;
      const matchesQuery = shipQuery.trim().length === 0
        ? true
        : [s.id, s.origin, s.destination, s.category].some((t) => t.toLowerCase().includes(shipQuery.toLowerCase()));
      const matchesDate = shipDateFilter.trim().length === 0 ? true : s.date === shipDateFilter.trim();
      return matchesStatus && matchesQuery && matchesDate;
    });
  }, [shipQuery, shipStatusFilter, shipDateFilter]);

  const shipStats = useMemo(() => {
    const total = SAMPLE_SHIPMENTS.length;
    const pending = SAMPLE_SHIPMENTS.filter((s) => s.status === 'pending').length;
    const inTransit = SAMPLE_SHIPMENTS.filter((s) => s.status === 'in_transit').length;
    const delivered = SAMPLE_SHIPMENTS.filter((s) => s.status === 'delivered').length;
    const revenue = SAMPLE_SHIPMENTS.reduce((acc, s) => acc + s.costIdr, 0);
    return { total, pending, inTransit, delivered, revenue };
  }, []);

  const openWhatsApp = (task: Task) => {
    const message = `Halo, saya kurir untuk ${task.resi}. Alamat: ${task.alamat}`;
    const url = task.phone
      ? `https://wa.me/${task.phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const geocodeAddress = async (query: string) => {
    try {
      if (!query) return null;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const first = json[0];
        return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await res.json();
      const coords: Array<[number, number]> | undefined = json?.routes?.[0]?.geometry?.coordinates;
      if (coords && Platform.OS === 'web') {
        const L = (window as any).L;
        const latlngs = coords.map(([lng, lat]) => [lat, lng]);
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs(latlngs);
        } else {
          routeLineRef.current = L.polyline(latlngs, { color: '#2563eb', weight: 5 }).addTo(mapRef.current);
        }
        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
      }
    } catch (e) {
      // Fallback: garis lurus
      if (Platform.OS === 'web') {
        const L = (window as any).L;
        const latlngs = [ [from.lat, from.lng], [to.lat, to.lng] ];
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs(latlngs);
        } else {
          routeLineRef.current = L.polyline(latlngs, { color: '#10b981', weight: 4, dashArray: '4,6' }).addTo(mapRef.current);
        }
        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
      }
    }
  };

  const openMapForTask = async (task: Task) => {
    setSelected(task);
    setShowMap(true);

    // Origin: geolokasi pengguna jika ada, fallback ke pusat Jakarta
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setOrigin({ lat: -6.2, lng: 106.816666 }),
        { enableHighAccuracy: true, timeout: 3000 }
      );
    } else {
      setOrigin({ lat: -6.2, lng: 106.816666 });
    }

    const dest = await geocodeAddress(task.alamat);
    setDestination(dest || { lat: -6.1754, lng: 106.8272 }); // fallback Monas
  };

  useEffect(() => {
    if (!showMap || Platform.OS !== 'web') return;

    // Inject Leaflet CSS
    const existingLink = document.querySelector(`link[href="${leafletCssHref}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = leafletCssHref;
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;
      const el = document.getElementById('leaflet-map-kurir');
      if (!el) return;
      if ((el as any)._leaflet_id) {
        mapRef.current = (el as any)._leaflet_map || mapRef.current;
        return;
      }
      const map = L.map('leaflet-map-kurir').setView([-6.2, 106.816666], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
      (el as any)._leaflet_map = map;
      mapRef.current = map;
    };

    const existingScript = document.querySelector(`script[src="${leafletJsSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = leafletJsSrc;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [showMap]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapRef.current) return;
    if (origin && destination) {
      fetchRoute(origin, destination);
    }
  }, [origin, destination]);

  // Helper: inject Leaflet CSS/JS for TSP segment
  const ensureLeafletInjected = (onload: () => void) => {
    if (Platform.OS !== 'web') return;
    const existingLink = document.querySelector(`link[href="${leafletCssHref}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = leafletCssHref;
      document.head.appendChild(link);
    }
    const existingScript = document.querySelector(`script[src="${leafletJsSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = leafletJsSrc;
      script.async = true;
      script.onload = onload;
      document.body.appendChild(script);
    } else {
      onload();
    }
  };

  // OSRM helper: route per segmen (from -> to) menghasilkan latlngs [lat, lng]
  const fetchOsrmRouteLatLngs = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const json = await res.json();
      const coords: Array<[number, number]> | undefined = json?.routes?.[0]?.geometry?.coordinates;
      if (!coords || coords.length === 0) return null;
      return coords.map(([lng, lat]) => [lat, lng] as [number, number]);
    } catch {
      return null;
    }
  };

  // Bangun polyline jalan untuk path: [p0, p1, ..., pn] dengan memanggil OSRM tiap segmen
  const buildRoadPolylineForPath = async (points: { lat: number; lng: number }[]) => {
    const out: [number, number][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const seg = await fetchOsrmRouteLatLngs(a, b);
      if (seg && seg.length > 1) {
        // Hindari duplikasi titik sambungan
        if (out.length > 0) {
          const last = out[out.length - 1];
          const first = seg[0];
          if (last[0] === first[0] && last[1] === first[1]) {
            out.push(...seg.slice(1));
          } else {
            out.push(...seg);
          }
        } else {
          out.push(...seg);
        }
      } else {
        // Fallback: garis lurus untuk segmen ini
        out.push([a.lat, a.lng], [b.lat, b.lng]);
      }
    }
    return out;
  };

  // Init TSP map when segment switched to 'waypoint'
  useEffect(() => {
    if (segment !== 'waypoint' || Platform.OS !== 'web') return;

    const initMap = () => {
      // @ts-ignore
      const L = (window as any).L;
      if (!L) return;
      const el = document.getElementById('leaflet-map-tsp');
      if (!el) return;
      if ((el as any)._leaflet_id) {
        tspMapRef.current = (el as any)._leaflet_map || tspMapRef.current;
        return;
      }
      const map = L.map('leaflet-map-tsp').setView([-6.2, 106.816666], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
      (el as any)._leaflet_map = map;
      tspMapRef.current = map;
    };

    ensureLeafletInjected(initMap);
  }, [segment]);

  // Helper: Haversine for fallback ordering
  const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2));
    return R * c;
  };

  // Compute TSP route across all tasks
  const computeTspRoute = async () => {
    if (Platform.OS !== 'web') {
      setIsComputingTsp(true);
      try {
        // Titik awal default Jakarta
        let start: { lat: number; lng: number } = { lat: -6.2, lng: 106.816666 };
        // Geocode semua alamat tugas
        const geos = await Promise.all(sampleTasks.map((t) => geocodeAddress(t.alamat)));
        const taskCoords: { lat: number; lng: number }[] = geos.map((g, i) => g || { lat: -6.2 + i * 0.01, lng: 106.816666 + i * 0.01 });
        // Nearest-neighbor sederhana untuk urutan kunjungan
        let remaining = taskCoords.map((_, idx) => idx);
        let order: number[] = [];
        let currentCoord = start;
        while (remaining.length > 0) {
          let bestIdx = -1;
          let bestDist = Number.POSITIVE_INFINITY;
          for (let i = 0; i < remaining.length; i++) {
            const candIdx = remaining[i];
            const cand = taskCoords[candIdx];
            const d = Math.hypot(cand.lat - currentCoord.lat, cand.lng - currentCoord.lng);
            if (d < bestDist) { bestDist = d; bestIdx = i; }
          }
          const next = remaining.splice(bestIdx, 1)[0];
          order.push(next);
          currentCoord = taskCoords[next];
        }
        // Bangun polyline: dari start, melalui order
        let latlngs: [number, number][] = [];
        let prev = start;
        for (const idx of order) {
          const to = taskCoords[idx];
          const seg = await fetchOsrmRouteLatLngs(prev, to);
          if (seg && seg.length > 1) latlngs = latlngs.concat(seg);
          else latlngs.push([prev.lat, prev.lng], [to.lat, to.lng]);
          prev = to;
        }
        const stops: [number, number][] = [[start.lat, start.lng], ...order.map((i) => [taskCoords[i].lat, taskCoords[i].lng])];
        setNativeTspPath(latlngs.length >= 2 ? latlngs : [[start.lat, start.lng]]);
        setNativeTspStops(stops);
        setTspOrder(order);
      } catch (e) {
        setTspOrder([]);
        setNativeTspPath([]);
        setNativeTspStops([]);
      } finally {
        setIsComputingTsp(false);
      }
      return;
    }
    setIsComputingTsp(true);
    try {
      // 1) Determine origin from geolocation
      let start: { lat: number; lng: number } = { lat: -6.2, lng: 106.816666 };
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => { start = { lat: pos.coords.latitude, lng: pos.coords.longitude }; resolve(); },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 2000 }
          );
        });
      }

      // 2) Geocode all task addresses
      const geos = await Promise.all(sampleTasks.map((t) => geocodeAddress(t.alamat)));
      const taskCoords: { lat: number; lng: number }[] = geos.map((g, i) => g || { lat: -6.2 + i * 0.01, lng: 106.816666 + i * 0.01 });

      // 3) Build coordinate list: origin + tasks; let last be last task
      const coordsList = [start, ...taskCoords];
      const coordStr = coordsList.map((c) => `${c.lng},${c.lat}`).join(';');

      // 4) Query OSRM Trip (approximate TSP)
      const url = `https://router.project-osrm.org/trip/v1/driving/${coordStr}?source=first&destination=last&roundtrip=false&overview=full&geometries=geojson`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await res.json();

      const L = (window as any).L;
      const wps = (json?.trips?.[0]?.waypoints || json?.waypoints || []).slice();
      // Sort by waypoint_index (visit order along trip)
      wps.sort((a: any, b: any) => (a.waypoint_index ?? 0) - (b.waypoint_index ?? 0));

      // 5) Determine order
      const order: number[] = [];
      wps.forEach((wp: any) => {
        if (typeof wp.original_index === 'number') {
          const taskIdx = wp.original_index - 1; // offset because coordsList[0] is start
          if (taskIdx >= 0 && taskIdx < sampleTasks.length) order.push(taskIdx);
        }
      });

      // Fallback: nearest-neighbor if OSRM did not provide original_index
      if (order.length === 0) {
        const remaining = taskCoords.map((_, i) => i);
        let cur = start;
        while (remaining.length) {
          let bestI = 0;
          let bestD = Infinity;
          for (let i = 0; i < remaining.length; i++) {
            const idx = remaining[i];
            const d = haversineKm(cur, taskCoords[idx]);
            if (d < bestD) { bestD = d; bestI = i; }
          }
          const nextIdx = remaining.splice(bestI, 1)[0];
          order.push(nextIdx);
          cur = taskCoords[nextIdx];
        }
      }

      // 6) Prepare polyline latlngs: gunakan OSRM Trip geometry jika ada, jika tidak, bangun per segmen
      let latlngs: Array<[number, number]> | null = null;
      if (json?.trips?.[0]?.geometry?.coordinates) {
        latlngs = json.trips[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      } else {
        const path = [start, ...order.map((i) => taskCoords[i])];
        latlngs = await buildRoadPolylineForPath(path);
      }

      // 7) Draw polyline (always attempt even if OSRM geometry missing)
      if (tspMapRef.current && L && latlngs && latlngs.length >= 2) {
        if (tspPolylineRef.current) {
          tspPolylineRef.current.setLatLngs(latlngs);
          try { tspPolylineRef.current.setStyle({ color: '#ef4444', weight: 5 }); } catch {}
        } else {
          tspPolylineRef.current = L.polyline(latlngs, { color: '#ef4444', weight: 5 }).addTo(tspMapRef.current);
        }
        // cache route latlngs for follow animation
        tspRouteLatLngsRef.current = latlngs as [number, number][];
        tspMapRef.current.fitBounds(tspPolylineRef.current.getBounds(), { padding: [20, 20] });
        // restart follow if enabled
        if (tspFollowEnabled) restartTspFollow();
      }

      // 8) Markers and labels
      // Clear old markers
      tspMarkersRef.current.forEach((m) => m.remove && m.remove());
      tspMarkersRef.current = [];

      if (tspMapRef.current && L) {
        const greenIcon = new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-icon-green.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-icon-2x-green.png',
          shadowUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        // Start marker
        const startM = L.marker([start.lat, start.lng], { icon: greenIcon }).addTo(tspMapRef.current);
        startM.bindPopup('Start');
        tspMarkersRef.current.push(startM);

        // Task markers in order
        order.forEach((idx, i) => {
          const c = taskCoords[idx];
          const m = L.marker([c.lat, c.lng], { icon: greenIcon }).addTo(tspMapRef.current);
          const label = i === order.length - 1 ? 'End' : `${i + 1}`;
          m.bindPopup(label);
          tspMarkersRef.current.push(m);
        });
      }

      setTspOrder(order);
    } catch (e) {
      setTspOrder([]);
    } finally {
      setIsComputingTsp(false);
    }
  };

  // HTML Leaflet untuk perangkat native (WebView) pada segmen waypoint
  const tspHtml = useMemo(() => {
    const path = nativeTspPath && nativeTspPath.length > 0 ? nativeTspPath : [[-6.2, 106.816666]];
    const stops = nativeTspStops && nativeTspStops.length > 0 ? nativeTspStops : [[-6.2, 106.816666]];
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>html,body,#map{height:100%;margin:0;padding:0}</style>
      </head><body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView(${JSON.stringify(stops[0])}, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
        var line = L.polyline(${JSON.stringify(path)}, { color: '#ef4444', weight: 5 }).addTo(map);
        var greenIcon = new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-icon-green.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-icon-2x-green.png',
          shadowUrl: 'https://unpkg.com/leaflet-color-markers@1.5.0/img/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        try { map.fitBounds(line.getBounds(), { padding: [20, 20] }); } catch(e) {}
        try {
          ${'${'}JSON.stringify(stops)${'}'}.forEach(function(ll, i){
            var m = L.marker(ll, { icon: greenIcon }).addTo(map);
            m.bindPopup(i === (${stops.length} - 1) ? 'End' : (i === 0 ? 'Start' : String(i)));
          });
        } catch(e) {}
      </script>
      </body></html>`;
  }, [nativeTspPath, nativeTspStops]);

  // Follow Route helpers for Waypoint
  const stopTspFollow = () => {
    if (tspFollowTimerRef.current) {
      clearInterval(tspFollowTimerRef.current);
      tspFollowTimerRef.current = null;
    }
    const L = (window as any).L;
    if (tspFollowerMarkerRef.current && tspMapRef.current && L) {
      try { tspMapRef.current.removeLayer(tspFollowerMarkerRef.current); } catch {}
      tspFollowerMarkerRef.current = null;
    }
  };

  const restartTspFollow = () => {
    stopTspFollow();
    if (!tspFollowEnabled) return;
    const L = (window as any).L;
    if (!tspMapRef.current || !L) return;
    const coords = tspRouteLatLngsRef.current;
    if (!coords || coords.length === 0) return;
    const step = coords.length > 500 ? 5 : 1;
    const path = coords.filter((_, i) => i % step === 0);
    tspFollowIdxRef.current = 0;
    tspFollowerMarkerRef.current = L.circleMarker(path[0], {
      radius: 6,
      color: '#2563eb',
      weight: 3,
      fillColor: '#2563eb',
      fillOpacity: 0.8,
    }).addTo(tspMapRef.current);
    tspFollowTimerRef.current = setInterval(() => {
      tspFollowIdxRef.current += 1;
      if (tspFollowIdxRef.current >= path.length) {
        stopTspFollow();
        return;
      }
      const next = path[tspFollowIdxRef.current];
      try { tspFollowerMarkerRef.current.setLatLng(next); } catch {}
      try { tspMapRef.current.panTo(next, { animate: true }); } catch {}
    }, 300);
  };

  // Real-time tracking for Waypoint map
  useEffect(() => {
    if (segment !== 'waypoint' || Platform.OS !== 'web') return;
    if (!tspTrackingEnabled) {
      if (tspWatchIdRef.current != null) {
        try { navigator.geolocation.clearWatch(tspWatchIdRef.current); } catch {}
        tspWatchIdRef.current = null;
      }
      return;
    }
    if (!navigator.geolocation) return;
    try {
      tspWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const L = (window as any).L;
          if (!L || !tspMapRef.current) return;
          const latlng = [pos.coords.latitude, pos.coords.longitude] as [number, number];
          try {
            if (tspDeviceMarkerRef.current) {
              tspDeviceMarkerRef.current.setLatLng(latlng);
            } else {
              tspDeviceMarkerRef.current = L.circleMarker(latlng, {
                radius: 6,
                color: '#0ea5e9',
                weight: 3,
                fillColor: '#0ea5e9',
                fillOpacity: 0.8,
              }).addTo(tspMapRef.current);
              tspDeviceMarkerRef.current.bindPopup('Perangkat');
            }
            tspMapRef.current.setView(latlng, tspMapRef.current.getZoom(), { animate: true });
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } catch {}
    return () => {
      if (tspWatchIdRef.current != null) {
        try { navigator.geolocation.clearWatch(tspWatchIdRef.current); } catch {}
        tspWatchIdRef.current = null;
      }
    };
  }, [segment, tspTrackingEnabled]);

  // Avoid conflicts: turning on tracking disables follow route
  useEffect(() => {
    if (tspTrackingEnabled && tspFollowEnabled) {
      setTspFollowEnabled(false);
      stopTspFollow();
    }
  }, [tspTrackingEnabled]);

  // Auto compute when segment visible
  useEffect(() => {
    if (segment !== 'waypoint' || Platform.OS !== 'web') return;
    // Ensure map initialized then compute
    const attempt = () => {
      if (tspMapRef.current) computeTspRoute();
    };
    ensureLeafletInjected(attempt);
  }, [segment]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Kurir</Text>
        <Text style={styles.subtitle}>Tugas Hari Ini</Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, segment === 'list' ? styles.segmentActive : styles.segmentInactive]}
          onPress={() => setSegment('list')}
        >
          <Text style={segment === 'list' ? styles.segmentTextActive : styles.segmentText}>Daftar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, segment === 'waypoint' ? styles.segmentActive : styles.segmentInactive]}
          onPress={() => setSegment('waypoint')}
        >
          <Text style={segment === 'waypoint' ? styles.segmentTextActive : styles.segmentText}>Waypoint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, segment === 'history' ? styles.segmentActive : styles.segmentInactive]}
          onPress={() => setSegment('history')}
        >
          <Text style={segment === 'history' ? styles.segmentTextActive : styles.segmentText}>Riwayat</Text>
        </TouchableOpacity>
      </View>

      {segment === 'list' && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Ringkasan Kiriman */}
          <View style={styles.shipStatsGrid}>
            <View style={styles.shipStatCard}>
              <View style={styles.shipStatIconWrap}><Ionicons name="cube-outline" size={20} color="#3b82f6" /></View>
              <View style={styles.shipStatTexts}>
                <Text style={styles.shipStatLabel}>Total Kiriman</Text>
                <Text style={styles.shipStatValue}>{shipStats.total}</Text>
              </View>
            </View>
            <View style={styles.shipStatCard}>
              <View style={styles.shipStatIconWrap}><Ionicons name="time-outline" size={20} color="#f59e0b" /></View>
              <View style={styles.shipStatTexts}>
                <Text style={styles.shipStatLabel}>Pending</Text>
                <Text style={styles.shipStatValue}>{shipStats.pending}</Text>
              </View>
            </View>
            <View style={styles.shipStatCard}>
              <View style={styles.shipStatIconWrap}><Ionicons name="navigate-outline" size={20} color="#06b6d4" /></View>
              <View style={styles.shipStatTexts}>
                <Text style={styles.shipStatLabel}>Diantar</Text>
                <Text style={styles.shipStatValue}>{shipStats.inTransit}</Text>
              </View>
            </View>
            <View style={styles.shipStatCard}>
              <View style={styles.shipStatIconWrap}><Ionicons name="checkmark-done-outline" size={20} color="#10b981" /></View>
              <View style={styles.shipStatTexts}>
                <Text style={styles.shipStatLabel}>Terkirim</Text>
                <Text style={styles.shipStatValue}>{shipStats.delivered}</Text>
              </View>
            </View>
          </View>

          {/* Pendapatan */}
          <View style={styles.shipRevenueCard}>
            <View style={styles.shipRevenueIconWrap}><Ionicons name="cash-outline" size={20} color="#22c55e" /></View>
            <View style={styles.shipRevenueTexts}>
              <Text style={styles.shipRevenueLabel}>Total Pendapatan (contoh)</Text>
              <Text style={styles.shipRevenueValue}>{formatRupiah(shipStats.revenue)}</Text>
            </View>
          </View>

          {/* Filter dan Pencarian */}
          <View style={styles.shipFilters}>
            <View style={styles.shipFilterItem}>
              <Ionicons name="funnel-outline" size={16} color="#6b7280" />
              <Text style={styles.shipFilterLabel}>Filter</Text>
            </View>
            <View style={styles.shipFiltersRow}>
              {[
                { key: 'all', label: 'Semua' },
                { key: 'pending', label: 'Pending' },
                { key: 'in_transit', label: 'Diantar' },
                { key: 'delivered', label: 'Terkirim' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.shipFilterChip, styles.shipFilterChipCol, shipStatusFilter === (f.key as any) ? styles.shipFilterChipActive : styles.shipFilterChipInactive]}
                  onPress={() => setShipStatusFilter(f.key as any)}
                >
                  <Text style={[styles.shipFilterChipText, shipStatusFilter === (f.key as any) ? styles.shipFilterChipTextActive : styles.shipFilterChipTextInactive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.shipSearchRow}>
              <View style={styles.shipSearchWrap}>
                <Ionicons name="search-outline" size={16} color="#6b7280" />
                <TextInput value={shipQuery} onChangeText={setShipQuery} placeholder="Cari ID/asal/tujuan/kategori" style={styles.shipSearchInput} />
              </View>
              <View style={styles.shipDateWrap}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <TextInput value={shipDateFilter} onChangeText={setShipDateFilter} placeholder="YYYY-MM-DD" style={styles.shipDateInput} />
              </View>
            </View>
          </View>

          {/* Daftar Kiriman */}
          <View style={styles.shipListWrap}>
            <Text style={styles.shipListTitle}>Daftar Kiriman</Text>
            {filteredShipments.length === 0 ? (
              <Text style={styles.shipEmptyText}>Tidak ada data sesuai filter.</Text>
            ) : (
              filteredShipments.map((s) => (
                <View key={s.id} style={styles.shipCard}>
                  <View style={styles.shipCardHeader}>
                    <Text style={styles.shipCardId}>{s.id}</Text>
                    <View style={[styles.shipBadge, s.status === 'pending' ? styles.shipBadgePending : s.status === 'in_transit' ? styles.shipBadgeTransit : styles.shipBadgeDelivered]}>
                      <Text style={styles.shipBadgeText}>
                        {s.status === 'pending' ? 'Pending' : s.status === 'in_transit' ? 'Diantar' : 'Terkirim'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.shipCardDate}>Tanggal: {s.date}</Text>
                  <View style={styles.shipRow}>
                    <View style={styles.shipRowItem}>
                      <Text style={styles.shipLabel}>Asal</Text>
                      <Text style={styles.shipValue}>{s.origin}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#6b7280" style={styles.shipArrow} />
                    <View style={styles.shipRowItem}>
                      <Text style={styles.shipLabel}>Tujuan</Text>
                      <Text style={styles.shipValue}>{s.destination}</Text>
                    </View>
                  </View>
                  <View style={styles.shipGridRow}>
                    <View style={styles.shipGridItem}>
                      <Text style={styles.shipLabel}>Kategori</Text>
                      <Text style={styles.shipValue}>{s.category}</Text>
                    </View>
                    <View style={styles.shipGridItem}>
                      <Text style={styles.shipLabel}>Berat</Text>
                      <Text style={styles.shipValue}>{s.weightKg} kg</Text>
                    </View>
                    <View style={styles.shipGridItem}>
                      <Text style={styles.shipLabel}>Volume</Text>
                      <Text style={styles.shipValue}>{s.volumeM3.toFixed(3)} m³</Text>
                    </View>
                    <View style={styles.shipGridItem}>
                      <Text style={styles.shipLabel}>Biaya</Text>
                      <Text style={styles.shipValue}>{formatRupiah(s.costIdr)}</Text>
                    </View>
                  </View>

                  <View style={styles.shipCardActions}>
                    <TouchableOpacity style={[styles.shipBtn, styles.shipBtnWhatsApp]} onPress={() => openWhatsAppShipment(s)}>
                      <Ionicons name="logo-whatsapp" size={16} color="#16a34a" />
                      <Text style={styles.shipBtnWhatsAppText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shipBtn, styles.shipBtnSecondary]}>
                      <Ionicons name="information-circle-outline" size={16} color="#111827" />
                      <Text style={styles.shipBtnSecondaryText}>Detail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shipBtn, styles.shipBtnPrimary]}>
                      <Ionicons name="paper-plane-outline" size={16} color="#fff" />
                      <Text style={styles.shipBtnPrimaryText}>Proses</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {segment === 'waypoint' && (
        <View style={styles.tspContainer}>
          <View style={styles.tspHeader}>
            <Text style={styles.tspTitle}>Rute Waypoint (TSP)</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={computeTspRoute} disabled={isComputingTsp}>
              <Text style={styles.refreshText}>{isComputingTsp ? 'Menghitung…' : 'Hitung Ulang'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, tspTrackingEnabled ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setTspTrackingEnabled((v) => !v)}
            >
              <Text style={[styles.toggleText, tspTrackingEnabled ? styles.toggleTextOn : styles.toggleTextOff]}>
                {tspTrackingEnabled ? 'Tracking: ON' : 'Tracking: OFF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, tspFollowEnabled ? styles.toggleOn : styles.toggleOff]}
              onPress={() => {
                setTspFollowEnabled((v) => {
                  const next = !v;
                  if (next) {
                    if (tspTrackingEnabled) setTspTrackingEnabled(false);
                    restartTspFollow();
                  } else {
                    stopTspFollow();
                  }
                  return next;
                });
              }}
            >
              <Text style={[styles.toggleText, tspFollowEnabled ? styles.toggleTextOn : styles.toggleTextOff]}>
                {tspFollowEnabled ? 'Follow Route: ON' : 'Follow Route: OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <View nativeID="leaflet-map-tsp" style={styles.tspMap} />
          ) : (
            <WebView style={styles.tspMap} source={{ html: tspHtml }} />
          )}
          <View style={styles.tspOrderWrap}>
            <Text style={styles.tspOrderTitle}>Urutan Kunjungan</Text>
            {tspOrder.length === 0 ? (
              <Text style={styles.tspOrderEmpty}>Belum ada urutan. Tekan "Hitung Ulang".</Text>
            ) : (
              tspOrder.map((idx, i) => (
                <View key={`${idx}-${i}`} style={styles.tspOrderRow}>
                  <Text style={styles.tspOrderBadge}>{i + 1}</Text>
                  <Text style={styles.tspOrderText}>{sampleTasks[idx].resi} — {sampleTasks[idx].alamat}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {segment === 'history' && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Riwayat Tugas</Text>
            {Platform.OS === 'web' ? (
              // Input HTML untuk tanggal (Web only)
              React.createElement('input', {
                type: 'date',
                value: historyDate,
                onChange: (e: any) => setHistoryDate(e.target.value),
                style: {
                  height: 32,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#e5e7eb',
                  outline: 'none',
                } as any,
              })
            ) : (
              <Text style={styles.historyHint}>Filter tanggal tersedia di Web</Text>
            )}
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {filteredHistory.length === 0 ? (
              <Text style={styles.tspOrderEmpty}>Tidak ada tugas untuk tanggal ini.</Text>
            ) : (
              filteredHistory.map((task) => (
                <View key={`${task.resi}-${task.date}`} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Resi</Text>
                    <Text style={styles.cardValue}>{task.resi}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Tanggal</Text>
                    <Text style={styles.cardValue}>{task.date}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Alamat</Text>
                    <Text style={styles.cardValue}>{task.alamat}</Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.whatsappBtn]} onPress={() => openWhatsApp(task)}>
                      <Text style={styles.actionText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.mapsBtn]} onPress={() => openMapForTask(task)}>
                      <Text style={styles.actionText}>Maps</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {showMap && (
        <View style={styles.mapModal}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Rute ke: {selected?.alamat}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowMap(false)}>
              <Text style={styles.closeText}>Tutup</Text>
            </TouchableOpacity>
          </View>
          <View nativeID="leaflet-map-kurir" style={styles.map} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  content: { padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel: { color: '#6b7280' },
  cardValue: { color: '#111827', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtn: { backgroundColor: '#22c55e' },
  mapsBtn: { backgroundColor: '#2563eb' },
  actionText: { color: '#fff', fontWeight: '700' },
  segmentRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  segmentBtn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  segmentActive: { backgroundColor: '#111827', borderColor: '#111827' },
  segmentInactive: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  segmentText: { color: '#111827', fontWeight: '700' },
  segmentTextActive: { color: '#fff', fontWeight: '700' },
  // ====== Styles untuk segmen Dashboard Kirim (prefiks ship*) ======
  shipStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  shipStatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, minWidth: 160, flexGrow: 1,
  },
  shipStatIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  shipStatTexts: { flex: 1 },
  shipStatLabel: { color: '#6b7280', fontSize: 12 },
  shipStatValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  shipRevenueCard: {
    marginTop: 10, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#f8fafc',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  shipRevenueIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  shipRevenueTexts: { flex: 1 },
  shipRevenueLabel: { color: '#6b7280', fontSize: 12 },
  shipRevenueValue: { fontWeight: '700', fontSize: 16, color: '#111827' },

  shipFilters: { marginTop: 12 },
  shipFilterItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  shipFilterLabel: { color: '#6b7280' },
  shipFiltersRow: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', flexWrap: 'wrap' },
  shipFilterChip: { height: 32, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  shipFilterChipCol: { width: '48%' },
  shipFilterChipActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  shipFilterChipInactive: { borderColor: '#e5e7eb', backgroundColor: '#fff' },
  shipFilterChipText: { fontSize: 12 },
  shipFilterChipTextActive: { color: '#1d4ed8', fontWeight: '700' },
  shipFilterChipTextInactive: { color: '#111827' },

  shipSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  shipSearchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
    height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10,
  },
  shipSearchInput: { flex: 1 },
  shipDateWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, minWidth: 140,
  },
  shipDateInput: { flex: 1 },

  shipListWrap: { paddingHorizontal: 16, marginTop: 12 },
  shipListTitle: { fontWeight: '700', marginBottom: 8 },
  shipEmptyText: { color: '#6b7280' },

  shipCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 10 },
  shipCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shipCardId: { fontWeight: '700', color: '#111827' },
  shipBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  shipBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  shipBadgePending: { backgroundColor: '#f59e0b' },
  shipBadgeTransit: { backgroundColor: '#06b6d4' },
  shipBadgeDelivered: { backgroundColor: '#10b981' },
  shipCardDate: { color: '#6b7280', marginTop: 4 },
  shipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  shipRowItem: { flex: 1 },
  shipLabel: { color: '#6b7280', fontSize: 12 },
  shipValue: { color: '#111827', fontWeight: '600' },
  shipArrow: { marginHorizontal: 4 },
  shipGridRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  shipGridItem: { flex: 1 },
  shipCardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  shipBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, paddingHorizontal: 12 },
  shipBtnPrimary: { backgroundColor: '#2563eb' },
  shipBtnSecondary: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  shipBtnWhatsApp: { borderWidth: 1, borderColor: '#86efac', backgroundColor: '#ecfdf5' },
  shipBtnPrimaryText: { color: '#fff', fontWeight: '700' },
  shipBtnSecondaryText: { color: '#111827', fontWeight: '700' },
  shipBtnWhatsAppText: { color: '#16a34a', fontWeight: '700' },
  mapModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapTitle: { fontWeight: '700' },
  closeBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#ef4444', borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  map: { flex: 1 },
  tspContainer: { flex: 1 },
  tspHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  tspTitle: { fontWeight: '700' },
  refreshBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  refreshText: { color: '#fff', fontWeight: '700' },
  toggleBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  toggleOn: { backgroundColor: '#ecfeff', borderColor: '#06b6d4' },
  toggleOff: { backgroundColor: '#f8fafc' },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextOn: { color: '#0e7490' },
  toggleTextOff: { color: '#334155' },
  tspMap: { height: 320, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  tspOrderWrap: { paddingHorizontal: 16, paddingTop: 10 },
  tspOrderTitle: { fontWeight: '700', marginBottom: 6 },
  tspOrderEmpty: { color: '#6b7280' },
  tspOrderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tspOrderBadge: { backgroundColor: '#111827', color: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 },
  tspOrderText: { color: '#111827', fontWeight: '600' },
  // Riwayat styles
  historyContainer: { flex: 1 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  historyTitle: { fontWeight: '700' },
  historyHint: { color: '#6b7280' },
});
  const openWhatsAppShipment = (s: { id: string; origin: string; destination: string; phone?: string }) => {
    const phone = s.phone ?? '6281234567890';
    const text = encodeURIComponent(`Halo, ini terkait kiriman ${s.id} dari ${s.origin} ke ${s.destination}.`);
    const url = `https://wa.me/${phone}?text=${text}`;
    Linking.openURL(url);
  };