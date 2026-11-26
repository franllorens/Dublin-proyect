"use client";

/**
 * Demo relay (see server.mjs): lets /staff on one phone stamp a demo card that
 * lives on another phone. Same origin, demo mode only.
 */

export type RelayAction = "stamp" | "redeem";
export type RelayResult =
  | { ok: true; card: { name: string; stamps: number; reward: boolean }; message: string }
  | { ok: false; reason: string; message: string; card?: { name: string; stamps: number; reward: boolean } };

/** Card holder side: answer stamp/redeem requests for this serial. Returns a stop function. */
export function listenForCard(serial: string, onRequest: (action: RelayAction, location: string | null) => RelayResult) {
  if (typeof EventSource === "undefined") return () => {};
  const es = new EventSource(`/api/demo/listen?ch=${encodeURIComponent(serial)}`);
  es.onmessage = (e) => {
    let msg: { id: string; action: RelayAction; location: string | null };
    try {
      msg = JSON.parse(e.data);
    } catch {
      return;
    }
    const result = onRequest(msg.action, msg.location);
    fetch("/api/demo/respond", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: msg.id, result }),
    }).catch(() => {});
  };
  // 404 (static hosting without the relay): stop retrying
  es.onerror = () => {
    if (es.readyState === EventSource.CLOSED) es.close();
  };
  return () => es.close();
}

/** Barista side: forward a scan to the phone showing the card. */
export async function requestCard(serial: string, action: RelayAction, location: string | null): Promise<RelayResult | "offline"> {
  try {
    const r = await fetch("/api/demo/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ch: serial, action, location }),
    });
    if (r.status === 404 || r.status === 504) return "offline";
    if (!r.ok) return "offline";
    return (await r.json()) as RelayResult;
  } catch {
    return "offline";
  }
}
