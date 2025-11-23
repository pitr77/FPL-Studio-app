import { BootstrapStatic, FPLFixture, FPLElementSummary } from '../types';

const BASE_URL = 'https://fantasy.premierleague.com/api';

/**
 * Fetches data using multiple CORS proxies to ensure reliability.
 * FPL API does not support CORS for browser requests, so we must use a proxy.
 */
async function fetchViaProxy(url: string) {
  const encodedUrl = encodeURIComponent(url);
  
  // Strategy 1: corsproxy.io (Fastest, usually works)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodedUrl}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
  } catch (err1) {
    console.warn('Proxy 1 (corsproxy.io) failed, trying fallback...', err1);
  }

  // Strategy 2: allorigins.win (Reliable JSONP-style)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodedUrl}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    if (!data.contents) throw new Error("No content in response");
    return JSON.parse(data.contents);
  } catch (err2) {
    console.warn('Proxy 2 (allorigins) failed, trying fallback...', err2);
  }

  // Strategy 3: codetabs (Last resort)
  try {
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
  } catch (err3) {
    console.error('All proxy strategies failed:', err3);
    throw new Error('Failed to connect to FPL API via proxies. This may happen on free hosting if proxies rate-limit the domain. Please try refreshing later.');
  }
}

export const getBootstrapStatic = async (): Promise<BootstrapStatic> => {
  return fetchViaProxy(`${BASE_URL}/bootstrap-static/`);
};

export const getFixtures = async (): Promise<FPLFixture[]> => {
  return fetchViaProxy(`${BASE_URL}/fixtures/`);
};

export const getUserPicks = async (teamId: number, eventId: number): Promise<{ picks: { element: number, position: number }[] }> => {
  return fetchViaProxy(`${BASE_URL}/entry/${teamId}/event/${eventId}/picks/`);
};

export const getPlayerSummary = async (playerId: number): Promise<FPLElementSummary> => {
  return fetchViaProxy(`${BASE_URL}/element-summary/${playerId}/`);
};

export const getPlayerImageUrl = (photoCode: string) => {
  // Remove .jpg extension from API if present and use the png raw endpoint
  const id = photoCode.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${id}.png`;
};

export const getTeamLogoUrl = (teamCode: number) => {
    return null; 
};