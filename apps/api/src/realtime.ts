type Listener = (event: RealtimeEvent) => void;

export interface RealtimeEvent {
  type: "file.created" | "file.transitioned";
  payload: unknown;
}

const listeners = new Set<Listener>();

export function publishEvent(event: RealtimeEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
