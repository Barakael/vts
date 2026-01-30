## Vehicle Tracking Backend

This Laravel service ingests binary telemetry from Teltonika FMB130 trackers over TCP, persists it in PostgreSQL/MySQL/SQLite (any Laravel-supported driver), and exposes REST plus a lightweight Leaflet dashboard to visualize the live fleet.

### Stack Highlights

- Teltonika TCP listener (`php artisan teltonika:listen`) with IMEI handshake, AVL decoding, and JSON persistence.
- `devices` + `device_positions` schema for tracking metadata and historical fixes.
- `/api/device-positions/latest` + `/api/devices/{device}/positions` APIs for the frontend/mobile app.
- `/tracker` Leaflet map to verify live data without the React app.

---

## 1. Bootstrap the project

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
```

Set `DB_*` variables in `.env` before migrating if you are not using SQLite.

---

## 2. Start the Teltonika listener

```bash
php artisan teltonika:listen --host=0.0.0.0 --port=${TELTONIKA_TCP_PORT:-9000}
```

Environment knobs (see `.env` / `config/services.php`):

| Variable | Description | Default |
| --- | --- | --- |
| `TELTONIKA_TCP_HOST` | Interface to bind the TCP server to | `0.0.0.0` |
| `TELTONIKA_TCP_PORT` | TCP port for incoming AVL packets | `9000` |

Stop the process with `Ctrl+C`. The command logs when devices connect/disconnect and how many records were stored per batch.

---

## 3. Expose the listener to the FMB130

Teltonika devices require a routable TCP endpoint. When developing locally, tunnel the port via ngrok (requires any plan that supports TCP tunnels):

```bash
ngrok tcp 9000
```

ngrok will print an address such as `2.tcp.ngrok.io:17846`. Configure your FMB130 with:

- **Server -> Domain**: `2.tcp.ngrok.io`
- **Server -> Port**: `17846`
- **Protocol**: TCP
- **Data Acquisition**: Continuous / Low for testing
- **APN**: provided by your SIM vendor

Save + reboot the tracker; you should see the IMEI handshake appear in the artisan logs.

> Tip: keep ngrok and the Laravel listener running simultaneously. If you change the ngrok tunnel you must update the tracker with the new host/port.

---

## 4. Visualize telemetry

Serve the Laravel app (or the React frontend) and open [http://localhost:8000/tracker](http://localhost:8000/tracker) to see the built-in Leaflet dashboard.

```bash
php artisan serve
```

The dashboard polls `/api/device-positions/latest` every 10 seconds and renders markers for each device. For custom UI needs, reuse these APIs:

- `GET /api/device-positions/latest` – all devices with their most recent fix.
- `GET /api/devices/{device}/positions?limit=100` – historical breadcrumb for one unit (max 500).

---

## 5. Troubleshooting

- **Listener never sees traffic**: confirm the tracker is online (green LED) and that ngrok still lists the TCP tunnel. Many carriers block custom ports unless you use the APN for IoT/M2M cards.
- **CRC or codec errors**: older firmware may use Codec 8. The decoder currently accepts codecs 8, 12, 16, and 18; upgrade firmware if you are on legacy variants.
- **No markers on the map**: ensure the database contains rows in `device_positions`. Run `php artisan tinker` and `App\Models\Device::with('latestPosition')->get()` for verification.
- **Long-running server**: deploy under `supervisor`, `systemd`, or Docker so the artisan command restarts automatically on crash.

---

## 6. Next steps

- Add authentication/authorization to the tracker dashboard.
- Extend the IO parser if you need ADC, CAN, or BLE sensor data.
- Pipe the stored positions into the React frontend (`frontend/` directory) for a richer experience.
