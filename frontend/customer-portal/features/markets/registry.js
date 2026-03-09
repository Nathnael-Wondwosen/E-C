import local from './local';
import global from './global';
import africa from './africa';
import china from './china';
import b2b from './b2b';

export const MARKET_REGISTRY = Object.freeze({
  local,
  global,
  africa,
  china,
  b2b
});

export const MARKET_LIST = Object.values(MARKET_REGISTRY);

export const getMarketByScope = (scope) => MARKET_REGISTRY[scope] || null;
