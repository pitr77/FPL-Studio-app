import { BootstrapStatic, FPLElementSummary, FPLFixture } from '../types';

const BASE_URL = 'https://fantasy.premierleague.com/api';

/**
 * Direct fetch for Native apps (no CORS restrictions like browsers)
 */
async function fetchFPL(path: string) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FPL-Studio-Android-App',
      'Accept': 'application/json',
    }
  });
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  return await response.json();
}

export const getBootstrapStatic = async (): Promise<BootstrapStatic> => {
  return fetchFPL('/bootstrap-static/');
};

export const getFixtures = async (): Promise<FPLFixture[]> => {
  return fetchFPL('/fixtures/');
};

export const getUserPicks = async (teamId: number, eventId: number): Promise<{ picks: { element: number, position: number }[] }> => {
  return fetchFPL(`/entry/${teamId}/event/${eventId}/picks/`);
};

export const getPlayerSummary = async (playerId: number): Promise<FPLElementSummary> => {
  return fetchFPL(`/element-summary/${playerId}/`);
};

export const getPlayerImageUrl = (photoCode: string) => {
  const id = photoCode.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${id}.png`;
};

export const getTeamLogoUrl = (teamCode: number) => {
  return `https://resources.premierleague.com/premierleague/badges/t${teamCode}.png`;
};