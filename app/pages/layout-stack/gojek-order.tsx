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
        setPickupCoords({ lat: ll.lat, lng: ll.lng });
      });

      // Destination marker (draggable)
      const dest = L.marker([destCoords!.lat, destCoords!.lng], { draggable: true }).addTo(map);
      dest.bindPopup('Tujuan');
      dest.on('dragend', () => {
        const ll = dest.getLatLng();
        setDestCoords({ lat: ll.lat, lng: ll.lng });
      });

      // Simpan referensi
      // @ts-ignore
      (mapEl as any)._leaflet_map = map;
      mapRef.current = map;
      pickupMarkerRef.current = pick;
      destMarkerRef.current = dest;

      // Gambar rute awal
      const line = L.polyline([[pickupCoords!.lat, pickupCoords!.lng], [destCoords!.lat, destCoords!.lng]], {
        color: '#10b981',
        weight: 4,
      }).addTo(map);
      routeLineRef.current = line;
      map.fitBounds(line.getBounds(), { padding: [20, 20] });
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
      },
      () => {
        // Fallback tetap menggunakan default
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

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
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([[pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]]);
        // Fokus peta ke rute setiap kali koordinat berubah
        try {
          mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
        } catch {}
      }
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
    if (q.length < 3) {
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
    setDestination(s.title);
    setDestCoords({ lat: s.lat, lng: s.lng });
    setShowDestSuggestions(false);
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

  return (
    <View style={styles.container}>
      {/* Peta full-screen di belakang */}
      <View style={styles.map} nativeID="leaflet-map" />

      {/* Bottom sheet fixed berisi form, estimasi, dan tombol booking */}
      <View style={styles.bottomSheet}>
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
                <TouchableOpacity key={`${s.title}-${s.lat}-${s.lng}`} style={styles.suggestItem} onPress={() => { selectDestSuggestion(s); setTimeout(focusRoute, 0); }}>
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

        <TouchableOpacity style={styles.bookingButton} activeOpacity={0.8}>
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
});