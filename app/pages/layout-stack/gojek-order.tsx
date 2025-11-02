import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';

export default function GojekOrderPage() {
  const [pickup, setPickup] = useState('Lokasi Jemput');
  const [destination, setDestination] = useState('Tujuan');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>({ lat: -6.200000, lng: 106.816666 });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>({ lat: -6.190000, lng: 106.826666 });

  // Autocomplete destinasi
  const [destSuggestions, setDestSuggestions] = useState<Array<{ title: string; lat: number; lng: number }>>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const destDebounceRef = useRef<any>(null);

  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const watchIdRef = useRef<any>(null);
  const lastReverseTsRef = useRef<number>(0);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [followRouteEnabled, setFollowRouteEnabled] = useState(false);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const followTimerRef = useRef<any>(null);
  const followIdxRef = useRef<number>(0);
  const routeFollowerMarkerRef = useRef<any>(null);

  // Draggable bottom sheet state
  const [sheetTranslateY, setSheetTranslateY] = useState(0); // 0 = expanded
  const sheetStartYRef = useRef(0);
  const sheetStartTranslateRef = useRef(0);
  // Snap points untuk bottom sheet: expanded (0), collapsed (peek), dan hampir ke bawah
  const SHEET_COLLAPSE = 300; // px saat collapsed (peek)
  const SHEET_MAX = Platform.OS === 'web' && typeof window !== 'undefined'
    ? Math.min(Math.max(Math.floor((window as any).innerHeight * 0.7), 420), 720)
    : 420; // batas bawah (lebih besar agar bisa ditarik jauh)
  const SHEET_HIDE = Platform.OS === 'web' && typeof window !== 'undefined'
    ? Math.max( (window as any).innerHeight - 60, SHEET_MAX + 60 )
    : SHEET_MAX + 80; // mentok bawah (hampir di luar layar)

  // Haversine distance (km)
  const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };

  // Reverse geocoding: koordinat -> alamat (display_name)
  const reverseGeocode = async (c: { lat: number; lng: number }) => {
    try {
      if (Platform.OS !== 'web') return null;
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await res.json();
      const name = json?.display_name || null;
      return name;
    } catch (e) {
      return null;
    }
  };

  // Ambil rute jalan dari OSRM Route API (di dalam komponen agar akses mapRef & state)
  const fetchOsrmRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    try {
      if (Platform.OS !== 'web') return null;
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const json = await res.json();
      const route = json?.routes?.[0];
      const coords: Array<[number, number]> = route?.geometry?.coordinates || [];
      if (!coords || coords.length === 0) return null;
      // Convert [lon, lat] -> [lat, lon]
      const latlngs = coords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
      return latlngs;
    } catch (e) {
      return null;
    }
  };

  // Update polyline rute: coba OSRM, fallback ke garis lurus
  const updateRoadRoute = async () => {
    if (Platform.OS !== 'web') return;
    const L = (window as any).L;
    if (!L || !mapRef.current || !pickupCoords || !destCoords) return;
    try {
      const latlngs = await fetchOsrmRoute(pickupCoords, destCoords);
      if (routeLineRef.current) {
        if (latlngs && latlngs.length > 1) {
          routeLineRef.current.setLatLngs(latlngs);
          routeCoordsRef.current = latlngs;
        } else {
          const straight = [[pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]] as [number, number][];
          routeLineRef.current.setLatLngs(straight);
          routeCoordsRef.current = straight;
        }
        try { mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] }); } catch {}
        if (followRouteEnabled) {
          restartFollowRoute();
        }
      } else {
        const initial = latlngs && latlngs.length > 1 ? latlngs : [[pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]];
        const line = L.polyline(initial, { color: '#10b981', weight: 4 }).addTo(mapRef.current);
        routeLineRef.current = line;
        routeCoordsRef.current = initial as [number, number][];
        try { mapRef.current.fitBounds(line.getBounds(), { padding: [20, 20] }); } catch {}
        if (followRouteEnabled) {
          restartFollowRoute();
        }
      }
    } catch {}
  };

  // Estimasi jarak dan harga real berdasarkan koordinat
  const estimates = useMemo(() => {
    const distanceKm = pickupCoords && destCoords ? haversineKm(pickupCoords, destCoords) : 0;
    const price = Math.max(7000, Math.round(distanceKm * 7000));
    return { distanceKm, price };
  }, [pickupCoords, destCoords]);

  useEffect(() => {
    // Hanya jalankan di web untuk Leaflet
    if (typeof window === 'undefined' || Platform.OS !== 'web') return;

    const leafletCssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    const leafletJsSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

    // Tambahkan CSS Leaflet jika belum ada
    const existingLink = document.querySelector(`link[href="${leafletCssHref}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = leafletCssHref;
      document.head.appendChild(link);
    }

    // Tambahkan script Leaflet jika belum ada, lalu inisialisasi
    const initMap = () => {
      // @ts-ignore
      const L = (window as any).L;
      if (!L) return;
      const mapEl = document.getElementById('leaflet-map');
      if (!mapEl) return;

      // Hindari re-init jika sudah ada
      if ((mapEl as any)._leaflet_id) {
        // Simpan referensi map jika sudah ada
        mapRef.current = (mapEl as any)._leaflet_map || mapRef.current;
        return;
      }

      const map = L.map('leaflet-map').setView([-6.200000, 106.816666], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Pickup marker (draggable)
      const pick = L.marker([pickupCoords!.lat, pickupCoords!.lng], { draggable: true }).addTo(map);
      pick.bindPopup('Lokasi Jemput');
      pick.on('dragend', () => {
        const ll = pick.getLatLng();
        const coords = { lat: ll.lat, lng: ll.lng };
        setPickupCoords(coords);
        // Update alamat input dengan reverse geocoding
        reverseGeocode(coords).then((addr) => {
          if (addr) setPickup(addr);
        });
      });

      // Destination marker (draggable)
      const dest = L.marker([destCoords!.lat, destCoords!.lng], { draggable: true }).addTo(map);
      dest.bindPopup('Tujuan');
      dest.on('dragend', () => {
        const ll = dest.getLatLng();
        const coords = { lat: ll.lat, lng: ll.lng };
        setDestCoords(coords);
        // Update alamat input dengan reverse geocoding dan fokuskan rute
        reverseGeocode(coords).then((addr) => {
          if (addr) setDestination(addr);
          setTimeout(() => {
            try { if (routeLineRef.current && mapRef.current) mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] }); } catch {}
          }, 0);
        });
      });

      // Simpan referensi
      // @ts-ignore
      (mapEl as any)._leaflet_map = map;
      mapRef.current = map;
      pickupMarkerRef.current = pick;
      destMarkerRef.current = dest;

      // Gambar rute awal (coba rute jalan)
      (async () => {
        const latlngs = await fetchOsrmRoute(pickupCoords!, destCoords!);
        const initial = latlngs && latlngs.length > 1 ? latlngs : [[pickupCoords!.lat, pickupCoords!.lng], [destCoords!.lat, destCoords!.lng]];
        const line = L.polyline(initial, { color: '#10b981', weight: 4 }).addTo(map);
        routeLineRef.current = line;
        routeCoordsRef.current = initial as [number, number][];
        try { map.fitBounds(line.getBounds(), { padding: [20, 20] }); } catch {}
        if (followRouteEnabled) {
          restartFollowRoute();
        }
      })();
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
  }, []);

  // Gunakan geolokasi perangkat untuk lokasi jemput (akurat)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickup('Lokasi Perangkat');
        setPickupCoords(coords);
        // Tampilkan alamat hasil reverse geocoding dari lokasi perangkat
        reverseGeocode(coords).then((addr) => {
          if (addr) setPickup(addr);
        });
      },
      () => {
        // Fallback tetap menggunakan default
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Tracking realtime: aktifkan watchPosition bila trackingEnabled = true
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) return;
    if (!trackingEnabled) {
      // Matikan watch bila sebelumnya aktif
      if (watchIdRef.current != null) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
        watchIdRef.current = null;
      }
      return;
    }
    // Aktifkan watchPosition
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPickupCoords(coords);
          // Ikuti marker di peta (follow)
          try {
            if (mapRef.current) {
              mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom(), { animate: true });
            }
          } catch {}
          // Perbarui alamat jemput dengan throttle (maks 1x per 5 detik)
          const now = Date.now();
          if (now - (lastReverseTsRef.current || 0) > 5000) {
            lastReverseTsRef.current = now;
            reverseGeocode(coords).then((addr) => { if (addr) setPickup(addr); });
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } catch {}
    // Cleanup saat unmount atau saat toggle berubah
    return () => {
      if (watchIdRef.current != null) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  // Sinkronisasi posisi marker dan garis rute saat koordinat berubah
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (pickupCoords && pickupMarkerRef.current) {
      pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
    }
    if (destCoords && destMarkerRef.current) {
      destMarkerRef.current.setLatLng([destCoords.lat, destCoords.lng]);
    }

    if (pickupCoords && destCoords) {
      updateRoadRoute();
    }
  }, [pickupCoords, destCoords]);

  // Geocoding address → koordinat menggunakan Nominatim
  const geocodeAddress = async (query: string) => {
    try {
      if (!query || Platform.OS !== 'web') return null;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
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

  // Autocomplete destinasi: ambil saran dari Nominatim saat mengetik
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    const q = (destination || '').trim();
    // Minimal 5 huruf sebelum memunculkan saran
    if (q.length < 5) {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
      return;
    }
    destDebounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        const json = await res.json();
        const items: Array<{ title: string; lat: number; lng: number }> = Array.isArray(json)
          ? json.map((it: any) => ({ title: it.display_name, lat: parseFloat(it.lat), lng: parseFloat(it.lon) }))
          : [];
        setDestSuggestions(items);
        setShowDestSuggestions(items.length > 0);
      } catch (e) {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
    }, 350);
    return () => destDebounceRef.current && clearTimeout(destDebounceRef.current);
  }, [destination]);

  const selectDestSuggestion = (s: { title: string; lat: number; lng: number }) => {
    try {
      // Tutup daftar saran dan hentikan debounce yang masih jalan
      if (destDebounceRef.current) {
        clearTimeout(destDebounceRef.current);
        destDebounceRef.current = null;
      }
      setShowDestSuggestions(false);
      setDestSuggestions([]);

      // Set tujuan dan koordinatnya
      setDestination(s.title);
      setDestCoords({ lat: s.lat, lng: s.lng });

      // Setelah state ter-update, fokuskan peta dan perbarui rute jalan
      setTimeout(() => {
        updateRoadRoute();
        focusRoute();
      }, 0);
    } catch {}
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  // Fokuskan peta ke rute (helper)
  const focusRoute = () => {
    if (Platform.OS !== 'web') return;
    try {
      if (routeLineRef.current && mapRef.current) {
        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
        return;
      }
      // Jika belum ada polyline, minimal fokus ke destinasi
      if (destCoords && mapRef.current) {
        mapRef.current.setView([destCoords.lat, destCoords.lng], 14, { animate: true });
      }
    } catch {}
  };

  // Follow Route helpers
  const stopFollowRoute = () => {
    if (followTimerRef.current) {
      clearInterval(followTimerRef.current);
      followTimerRef.current = null;
    }
    const L = (window as any).L;
    if (routeFollowerMarkerRef.current && mapRef.current && L) {
      try { mapRef.current.removeLayer(routeFollowerMarkerRef.current); } catch {}
      routeFollowerMarkerRef.current = null;
    }
  };

  const restartFollowRoute = () => {
    stopFollowRoute();
    if (!followRouteEnabled) return;
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    const coords = routeCoordsRef.current;
    if (!coords || coords.length === 0) return;
    const step = coords.length > 500 ? 5 : 1;
    const path = coords.filter((_, i) => i % step === 0);
    followIdxRef.current = 0;
    routeFollowerMarkerRef.current = L.circleMarker(path[0], {
      radius: 6,
      color: '#2563eb',
      weight: 3,
      fillColor: '#2563eb',
      fillOpacity: 0.8,
    }).addTo(mapRef.current);
    followTimerRef.current = setInterval(() => {
      followIdxRef.current += 1;
      if (followIdxRef.current >= path.length) {
        stopFollowRoute();
        return;
      }
      const next = path[followIdxRef.current];
      try { routeFollowerMarkerRef.current.setLatLng(next); } catch {}
      try { mapRef.current.panTo(next, { animate: true }); } catch {}
    }, 300);
  };

  // Jika tracking diaktifkan, matikan follow route agar tidak konflik
  useEffect(() => {
    if (trackingEnabled && followRouteEnabled) {
      setFollowRouteEnabled(false);
      stopFollowRoute();
    }
  }, [trackingEnabled]);

  return (
    <View style={styles.container}>
      {/* Peta full-screen di belakang */}
      <View style={styles.map} nativeID="leaflet-map" />

      {/* Bottom sheet fixed berisi form, estimasi, dan tombol booking */}
      <View
        style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}
      >
        {/* Drag handle */}
        <View
          style={styles.dragHandle}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e: any) => {
            sheetStartYRef.current = e.nativeEvent.pageY;
            sheetStartTranslateRef.current = sheetTranslateY;
          }}
          onResponderMove={(e: any) => {
            const dy = e.nativeEvent.pageY - sheetStartYRef.current;
            let next = sheetStartTranslateRef.current + dy;
            if (next < 0) next = 0;
            if (next > SHEET_MAX) next = SHEET_MAX;
            setSheetTranslateY(next);
          }}
          onResponderRelease={() => {
            // Snap ke titik terdekat: expanded (0), collapsed (SHEET_COLLAPSE), atau hampir bawah (SHEET_MAX)
            const points = [0, SHEET_COLLAPSE, SHEET_MAX];
            let snap = points[0];
            let minDiff = Math.abs(sheetTranslateY - points[0]);
            for (let i = 1; i < points.length; i++) {
              const d = Math.abs(sheetTranslateY - points[i]);
              if (d < minDiff) { minDiff = d; snap = points[i]; }
            }
            setSheetTranslateY(snap);
          }}
        >
          <View style={styles.handleBar} />
        </View>
        <Text style={styles.sheetTitle}>Order Gojek</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Lokasi Jemput</Text>
          <TextInput
            value={pickup}
            onChangeText={setPickup}
            onBlur={async () => {
              const coords = await geocodeAddress(pickup);
              if (coords) setPickupCoords(coords);
            }}
            onSubmitEditing={async () => {
              const coords = await geocodeAddress(pickup);
              if (coords) setPickupCoords(coords);
            }}
            placeholder="Masukkan lokasi jemput"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tujuan</Text>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            onBlur={async () => {
              const coords = await geocodeAddress(destination);
              if (coords) {
                setDestCoords(coords);
                setTimeout(focusRoute, 0);
              }
            }}
            onSubmitEditing={async () => {
              const coords = await geocodeAddress(destination);
              if (coords) {
                setDestCoords(coords);
                setTimeout(focusRoute, 0);
              }
            }}
            placeholder="Masukkan tujuan"
            style={styles.input}
          />
          {showDestSuggestions && destSuggestions.length > 0 && (
            <View style={styles.suggestList}>
              {destSuggestions.map((s) => (
                <TouchableOpacity key={`${s.title}-${s.lat}-${s.lng}`} style={styles.suggestItem} onPress={() => { selectDestSuggestion(s); }}>
                  <Text style={styles.suggestTitle} numberOfLines={2}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.estimatesRow}>
          <View style={styles.estimateBoxLeft}>
            <Text style={styles.estimateLabel}>Perkiraan Harga</Text>
            <Text style={styles.estimateValue}>{formatRupiah(estimates.price)}</Text>
          </View>
          <View style={styles.estimateBoxRight}>
            <Text style={styles.estimateLabel}>Perkiraan Jarak</Text>
            <Text style={styles.estimateValue}>{estimates.distanceKm > 0 ? `${estimates.distanceKm.toFixed(2)} km` : '-'}
            </Text>
          </View>
        </View>

        {/* Toggle Tracking Realtime */}
        <TouchableOpacity
          style={[styles.trackingButton, trackingEnabled ? styles.trackingOn : styles.trackingOff]}
          activeOpacity={0.8}
          onPress={() => setTrackingEnabled((v) => !v)}
        >
          <Text style={[styles.trackingText, trackingEnabled ? styles.trackingTextOn : styles.trackingTextOff]}>
            {trackingEnabled ? 'Tracking: ON' : 'Tracking: OFF'}
          </Text>
        </TouchableOpacity>

        {/* Toggle Follow Route */}
        <TouchableOpacity
          style={[styles.trackingButton, followRouteEnabled ? styles.trackingOn : styles.trackingOff]}
          activeOpacity={0.8}
          onPress={() => {
            setFollowRouteEnabled((v) => {
              const next = !v;
              if (next) {
                // Matikan tracking agar tidak konflik
                if (trackingEnabled) setTrackingEnabled(false);
                restartFollowRoute();
              } else {
                stopFollowRoute();
              }
              return next;
            });
          }}
        >
          <Text style={[styles.trackingText, followRouteEnabled ? styles.trackingTextOn : styles.trackingTextOff]}>
            {followRouteEnabled ? 'Follow Route: ON' : 'Follow Route: OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingButton}
          activeOpacity={0.8}
          onPress={() => {
            // Collapse sheet hingga mentok bawah saat Booking diklik
            setSheetTranslateY(SHEET_HIDE);
          }}
        >
          <Text style={styles.bookingText}>Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#eaeaea',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    zIndex: 10,
  },
  dragHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 8,
  },
  handleBar: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  suggestList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  suggestItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  estimatesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  estimateBoxLeft: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 8,
  },
  estimateBoxRight: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 8,
    alignItems: 'flex-end',
  },
  estimateLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: '#111827',
  },
  bookingButton: {
    height: 48,
    backgroundColor: '#10b981',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 12,
  },
  bookingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  trackingButton: {
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  trackingOn: {
    backgroundColor: '#ecfeff',
    borderColor: '#06b6d4',
  },
  trackingOff: {
    backgroundColor: '#f8fafc',
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackingTextOn: {
    color: '#0e7490',
  },
  trackingTextOff: {
    color: '#334155',
  },
});