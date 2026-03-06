const API_BASE = "/api";

async function request(url, options = {}) {
  const { body, ...fetchOpts } = options;

  if (body !== undefined) {
    fetchOpts.headers = {
      "Content-Type": "application/json",
      ...fetchOpts.headers,
    };
    fetchOpts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${url}`, fetchOpts);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  if (fetchOpts.method === "DELETE") return;
  return res.json();
}

export const http = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body }),
  put: (url, body) => request(url, { method: "PUT", body }),
  patch: (url, body) => request(url, { method: "PATCH", body }),
  del: (url) => request(url, { method: "DELETE" }),
};
