
import ZAI from "z-ai-web-dev-sdk";

// We'll cache the ZAI instance promise to avoid creating it on every request.
let zaiInstancePromise: Promise<ZAI> | null = null;

export function getZaiInstance(): Promise<ZAI> {
  if (!zaiInstancePromise) {
    zaiInstancePromise = ZAI.create();
  }
  return zaiInstancePromise;
}
