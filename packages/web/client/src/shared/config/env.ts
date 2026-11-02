export const env = {
  API_ADDRESS: import.meta.env.VITE_API_BASE_URL ?? '',
  ENV_MODE: import.meta.env.VITE_ENV_MODE,
  MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  MAPS_ID: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}
