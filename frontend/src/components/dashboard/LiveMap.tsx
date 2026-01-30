import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import type { DevicePositionEntry } from '../../types/telemetry';

// Fix Leaflet's default icon paths when bundling with Vite.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

type Props = {
  data: DevicePositionEntry[];
};

const defaultCenter: [number, number] = [0, 0];

function MapViewport({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, center[0] === 0 && center[1] === 0 ? 2 : 12, { animate: true, duration: 1 });
  }, [center, map]);

  return null;
}

export default function LiveMap({ data }: Props) {
  const center = useMemo<[number, number]>(() => {
    if (!data.length) return defaultCenter;
    const [lat, lng] = [data[0].position.latitude, data[0].position.longitude];
    if (!lat && !lng) {
      return defaultCenter;
    }
    return [lat, lng];
  }, [data]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      <MapContainer center={center} zoom={2} className="h-full w-full" scrollWheelZoom={false}>
        <MapViewport center={center} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map(entry => {
          const { latitude, longitude, speed, recorded_at, satellites } = entry.position;
          if (latitude == null || longitude == null) {
            return null;
          }
          return (
            <Marker key={`${entry.device.id}-${entry.position.id}`} position={[latitude, longitude]}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{entry.device.name ?? entry.device.imei}</p>
                  <p>{latitude.toFixed(5)}, {longitude.toFixed(5)}</p>
                  <p>Speed {speed ?? 0} km/h · Sat {satellites ?? 0}</p>
                  <p className="text-xs text-slate-500">{new Date(recorded_at).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
