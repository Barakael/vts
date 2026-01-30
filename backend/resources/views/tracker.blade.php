<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Device Tracker</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-o9N1j7kG7Bhp0rJgY9YQDbFhOq8Hb5pTDlPa9uH5f7E=" crossorigin="">
    <style>
        :root {
            color-scheme: light dark;
        }

        body {
            margin: 0;
            font-family: 'Space Grotesk', 'Segoe UI', Tahoma, sans-serif;
            background: radial-gradient(circle at top, #0f172a, #020617 55%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
        }

        #sidebar {
            width: 320px;
            padding: 2rem 1.5rem;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(14px);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        #map {
            flex: 1;
            height: 100vh;
        }

        .device-card {
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 1rem;
            padding: 1rem;
            background: rgba(148, 163, 184, 0.05);
        }

        .device-card h2 {
            margin: 0 0 0.25rem 0;
            font-size: 1.15rem;
        }

        .device-card p {
            margin: 0.1rem 0;
            font-size: 0.9rem;
            color: #cbd5f5;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.4rem;
            background: #10b981;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
        }

        @media (max-width: 900px) {
            body {
                flex-direction: column;
            }

            #sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            #map {
                height: calc(100vh - 340px);
            }
        }
    </style>
</head>
<body>
    <div id="sidebar">
        <div>
            <div class="status-dot"></div>
            <strong>Live Teltonika Feed</strong>
        </div>
        <p id="last-sync">Waiting for telemetry...</p>
        <div id="device-list"></div>
    </div>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
        const apiUrl = '{{ url('/api/device-positions/latest') }}';
        const map = L.map('map').setView([0, 0], 2);
        const markers = new Map();

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        async function fetchPositions() {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Unable to load positions');
                }

                const payload = await response.json();
                updateUI(payload.data.positions ?? []);
            } catch (error) {
                console.error(error);
                document.getElementById('last-sync').textContent = 'Connection lost: ' + error.message;
            }
        }

        function updateUI(entries) {
            const list = document.getElementById('device-list');
            list.innerHTML = '';

            entries.forEach(({ device, position }) => {
                const name = device.name || device.imei;
                updateMarker(device, position);

                const card = document.createElement('div');
                card.className = 'device-card';
                card.innerHTML = `
                    <h2>${name}</h2>
                    <p>IMEI ${device.imei}</p>
                    <p>Lat ${position.latitude.toFixed(5)} / Lon ${position.longitude.toFixed(5)}</p>
                    <p>Speed ${position.speed ?? 0} km/h · ${new Date(position.recorded_at).toLocaleString()}</p>
                `;
                list.appendChild(card);
            });

            if (entries.length) {
                document.getElementById('last-sync').textContent = 'Last update · ' + new Date().toLocaleTimeString();
            } else {
                document.getElementById('last-sync').textContent = 'No telemetry yet';
            }
        }

        function updateMarker(device, position) {
            const key = device.id;
            const latLng = [position.latitude, position.longitude];

            if (markers.has(key)) {
                markers.get(key).setLatLng(latLng).setPopupContent(renderPopup(device, position));
            } else {
                const marker = L.marker(latLng).addTo(map).bindPopup(renderPopup(device, position));
                markers.set(key, marker);
            }

            if (markers.size === 1) {
                map.setView(latLng, 12);
            } else {
                const group = L.featureGroup(Array.from(markers.values()));
                map.fitBounds(group.getBounds().pad(0.3));
            }
        }

        function renderPopup(device, position) {
            const title = device.name || device.imei;
            return `
                <strong>${title}</strong><br>
                IMEI ${device.imei}<br>
                ${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}<br>
                Speed ${position.speed ?? 0} km/h · Sat ${position.satellites ?? 0}
            `;
        }

        fetchPositions();
        setInterval(fetchPositions, 10000);
    </script>
</body>
</html>
