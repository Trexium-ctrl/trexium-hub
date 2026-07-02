import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { token, functionsVersion, appBaseUrl } = appParams;

// App ID hardcoded so the database works on external hosting without env vars
export const base44 = createClient({
  appId: '6a3bdd421248c7ca37fac72d',
  token,
  functionsVersion,
  serverUrl: 'https://base44.app',
  requiresAuth: false,
  appBaseUrl
});