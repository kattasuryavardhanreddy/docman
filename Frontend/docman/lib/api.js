const DEFAULT_API_BASE_URL = "http://localhost:5190";

function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getApiBaseUrl() {
  return (process.env.DOCMAN_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

export function buildApiUrl(path, searchParams) {
  const url = new URL(normalizePath(path), `${getApiBaseUrl()}/`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export function buildApiProxyPath(path, searchParams) {
  const url = new URL(normalizePath(path), "http://docman.local");

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return `${url.pathname}${url.search}`;
}
