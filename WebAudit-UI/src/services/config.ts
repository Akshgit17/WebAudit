import { RuntimeConfig } from '../types';

let cachedConfig: RuntimeConfig | null = null;

const defaultConfig: RuntimeConfig = {
  production: false,
  base_url: window.location.origin,
  api_url: 'http://localhost:9080/v1',
  auth: {
    domain: '',
    clientId: '',
    authorizationParams: {
      audience: null,
      redirect_uri: window.location.origin,
    },
    errorPath: '/error',
  },
  pusher: {
    app_id: '',
    key: '',
    secret: '',
    cluster: '',
  },
  segment_key: '',
};

export async function loadConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const origin = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'http://localhost:4200';
    const res = await fetch(`${origin}/config.json`);
    if (res.ok) {
      const data = await res.json();
      cachedConfig = {
        ...defaultConfig,
        ...data,
        auth: {
          ...defaultConfig.auth,
          ...(data.auth || {}),
          authorizationParams: {
            ...defaultConfig.auth.authorizationParams,
            ...(data.auth?.authorizationParams || {}),
          },
        },
        pusher: {
          ...defaultConfig.pusher,
          ...(data.pusher || {}),
        },
      };
      return cachedConfig!;
    }
  } catch (err) {
    console.warn('Unable to load /config.json, falling back to defaults:', err);
  }

  cachedConfig = defaultConfig;
  return cachedConfig;
}

export function getConfigSync(): RuntimeConfig {
  return cachedConfig || defaultConfig;
}
