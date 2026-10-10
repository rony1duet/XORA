/**
 * CARTO 3 Cloud Native API Service
 * Connects directly to CARTO Data Warehouse (gcp-asia-northeast1) for
 * high-precision PostGIS/BigQuery spatial queries, geodetic buffers, and live distance calculations.
 */

export interface CartoQueryResult<T = any> {
  rows: T[];
  schema?: Array<{ name: string; type: string }>;
  meta?: {
    cacheHit: boolean;
    totalBytesProcessed: string;
    location: string;
  };
  latencyMs: number;
}

export interface CartoConnectionStatus {
  connected: boolean;
  latencyMs: number;
  region: string;
  endpoint: string;
  error?: string;
}

const CARTO_BASE_URL =
  import.meta.env.VITE_CARTO_API_BASE_URL ||
  'https://gcp-asia-northeast1.api.carto.com';

const CARTO_TOKEN =
  import.meta.env.VITE_CARTO_ACCESS_TOKEN ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfYmQ3cGkwMnEiLCJqdGkiOiIxYmJlNmM1MjAxYTA1NzM2ZTgzZGE1NGJiNzgxNGExZiJ9.yAA2xNtiEW8qhBJ3RU6xPx8eyYyPwzK_Ba1PCGL3aAc';

/**
 * Executes a live spatial query on CARTO Data Warehouse
 */
export async function executeCartoSql<T = any>(
  sql: string
): Promise<CartoQueryResult<T>> {
  const startTime = performance.now();
  const url = `${CARTO_BASE_URL}/v3/sql/carto_dw/query?q=${encodeURIComponent(sql)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${CARTO_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`CARTO API error (${response.status}): ${errBody}`);
  }

  const json = await response.json();
  return {
    rows: json.rows || [],
    schema: json.schema,
    meta: json.meta,
    latencyMs,
  };
}

/**
 * Health-checks the live CARTO API connection
 */
export async function testCartoConnection(): Promise<CartoConnectionStatus> {
  const startTime = performance.now();
  try {
    const res = await executeCartoSql<{ test: number }>('SELECT 1 as test');
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      connected: res.rows.length > 0 && res.rows[0].test === 1,
      latencyMs,
      region: res.meta?.location || 'Tokyo (gcp-asia-northeast1)',
      endpoint: CARTO_BASE_URL,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Math.round(performance.now() - startTime),
      region: 'Tokyo (gcp-asia-northeast1)',
      endpoint: CARTO_BASE_URL,
      error: err.message || 'Connection failed',
    };
  }
}

/**
 * Calculates true geodetic distance between two Earth points using CARTO ST_DISTANCE
 */
export async function calculateCartoDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<{ distanceKm: number; latencyMs: number }> {
  const sql = `SELECT ST_DISTANCE(ST_GEOGPOINT(${lng1}, ${lat1}), ST_GEOGPOINT(${lng2}, ${lat2})) / 1000.0 as dist_km`;
  const res = await executeCartoSql<{ dist_km: number }>(sql);
  return {
    distanceKm: res.rows[0]?.dist_km ? Math.round(res.rows[0].dist_km * 10) / 10 : 0,
    latencyMs: res.latencyMs,
  };
}

/**
 * Fetches real 25 km geodetic buffer polygons for analog candidate sites from CARTO,
 * with local geodesic fallback if remote API is unreachable.
 */
export async function fetchCartoSiteBuffers(
  sites: Array<{ id: string; name: string; lat: number; lng: number }>
): Promise<any> {
  if (sites.length === 0) return { type: 'FeatureCollection', features: [] };

  try {
    // Generate unioned query for all candidate sites
    const unionQueries = sites.map(
      (s) =>
        `SELECT '${s.id}' as site_id, '${s.name.replace(/'/g, "\\'")}' as site_name, ST_ASGEOJSON(ST_BUFFER(ST_GEOGPOINT(${s.lng}, ${s.lat}), 25000)) as geojson`
    );

    const fullSql = unionQueries.join(' UNION ALL ');
    const res = await executeCartoSql<{
      site_id: string;
      site_name: string;
      geojson: string;
    }>(fullSql);

    if (res.rows && res.rows.length > 0) {
      const features = res.rows.map((row) => ({
        type: 'Feature',
        properties: {
          siteId: row.site_id,
          siteName: row.site_name,
          bufferRadiusKm: 25,
          provider: 'CARTO BigQuery Cloud Native',
        },
        geometry: JSON.parse(row.geojson),
      }));

      return {
        type: 'FeatureCollection',
        features,
      };
    }
  } catch (err) {
    console.warn('CARTO remote buffer query deferred, using local geodetic calculation:', err);
  }

  // Resilient fallback: compute 25km geodetic polygons directly
  const features = sites.map((s) => {
    const coords: [number, number][] = [];
    const radiusDegLat = 25 / 111.32;
    const radiusDegLng = radiusDegLat / Math.cos((s.lat * Math.PI) / 180);
    for (let i = 0; i <= 32; i++) {
      const angle = (i * 2 * Math.PI) / 32;
      const lat = s.lat + radiusDegLat * Math.sin(angle);
      const lng = s.lng + radiusDegLng * Math.cos(angle);
      coords.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
    }
    return {
      type: 'Feature',
      properties: {
        siteId: s.id,
        siteName: s.name,
        bufferRadiusKm: 25,
        provider: 'Geodetic Spatial Engine',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
