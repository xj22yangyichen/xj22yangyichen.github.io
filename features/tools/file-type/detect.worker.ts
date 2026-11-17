import { detectFile } from "./detect";

self.onmessage = async (event: MessageEvent<File>) => {
  try {
    self.postMessage({ result: await detectFile(event.data) });
  } catch {
    self.postMessage({ error: true });
  }
};
