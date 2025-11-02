import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';

type Task = {
  resi: string;
  alamat: string;
  phone?: string;
};

const sampleTasks: Task[] = [
  { resi: 'RESI-001234', alamat: 'Monas, Jakarta Pusat', phone: '+628123456789' },
  { resi: 'RESI-001235', alamat: 'Kota Tua, Jakarta Barat' },
  { resi: 'RESI-001236', alamat: 'Blok M Plaza, Jakarta Selatan' },
];

export default function DashboardKurir() {
  const [selected, setSelected] = useState<Task | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

  // Segmented view: 'list' | 'waypoint'
  const [segment, setSegment] = useState<'list' | 'waypoint'>('list');

  // TSP map refs
  const tspMapRef = useRef<any>(null);
  const tspPolylineRef = useRef<any>(null);
  const tspMarkersRef = useRef<any[]>([]);
  const [tspOrder, setTspOrder] = useState<number[]>([]); // indices of sampleTasks in visit order
  const [isComputingTsp, setIsComputingTsp] = useState(false);

  const mapRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const leafletCssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const leafletJsSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  const openWhatsApp = (task: Task) => {
    const message = `Halo, saya kurir untuk ${task.resi}. Alamat: ${task.alamat}`;
    const url = task.phone
      ? `https://wa.me/${task.phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const geocodeAddress = async (query: string) => {
    try {
      if (!query || Platform.OS !== 'web') return null;
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
    if (Platform.OS !== 'web') return;
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

      // 6) Prepare polyline latlngs
      let latlngs: Array<[number, number]> | null = null;
      if (json?.trips?.[0]?.geometry?.coordinates) {
        latlngs = json.trips[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      } else {
        // Straight lines along fallback path: start -> tasks in order
        const path = [start, ...order.map((i) => taskCoords[i])];
        latlngs = path.map((c) => [c.lat, c.lng]);
      }

      // 7) Draw polyline (always attempt even if OSRM geometry missing)
      if (tspMapRef.current && L && latlngs && latlngs.length >= 2) {
        if (tspPolylineRef.current) {
          tspPolylineRef.current.setLatLngs(latlngs);
        } else {
          tspPolylineRef.current = L.polyline(latlngs, { color: '#7c3aed', weight: 5 }).addTo(tspMapRef.current);
        }
        tspMapRef.current.fitBounds(tspPolylineRef.current.getBounds(), { padding: [20, 20] });
      }

      // 8) Markers and labels
      // Clear old markers
      tspMarkersRef.current.forEach((m) => m.remove && m.remove());
      tspMarkersRef.current = [];

      if (tspMapRef.current && L) {
        // Start marker
        const startM = L.marker([start.lat, start.lng]).addTo(tspMapRef.current);
        startM.bindPopup('Start');
        tspMarkersRef.current.push(startM);

        // Task markers in order
        order.forEach((idx, i) => {
          const c = taskCoords[idx];
          const m = L.marker([c.lat, c.lng]).addTo(tspMapRef.current);
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
    <View style={styles.container}>
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
      </View>

      {segment === 'list' && (
        <ScrollView contentContainerStyle={styles.content}>
          {sampleTasks.map((task) => (
            <View key={task.resi} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Resi</Text>
                <Text style={styles.cardValue}>{task.resi}</Text>
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
          ))}
        </ScrollView>
      )}

      {segment === 'waypoint' && (
        <View style={styles.tspContainer}>
          <View style={styles.tspHeader}>
            <Text style={styles.tspTitle}>Rute Waypoint (TSP)</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={computeTspRoute} disabled={isComputingTsp}>
              <Text style={styles.refreshText}>{isComputingTsp ? 'Menghitung…' : 'Hitung Ulang'}</Text>
            </TouchableOpacity>
          </View>
          <View nativeID="leaflet-map-tsp" style={styles.tspMap} />
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
    </View>
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
  tspMap: { height: 320, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  tspOrderWrap: { paddingHorizontal: 16, paddingTop: 10 },
  tspOrderTitle: { fontWeight: '700', marginBottom: 6 },
  tspOrderEmpty: { color: '#6b7280' },
  tspOrderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tspOrderBadge: { backgroundColor: '#111827', color: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 },
  tspOrderText: { color: '#111827', fontWeight: '600' },
});