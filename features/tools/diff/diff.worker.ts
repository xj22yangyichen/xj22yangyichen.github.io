import { compareTexts, DiffError, type DiffResponse } from "./compare";

self.onmessage = (event: MessageEvent<{ before: string; after: string }>) => {
  let response: DiffResponse;
  try {
    response = { result: compareTexts(event.data.before, event.data.after) };
  } catch (error) {
    response = {
      error: error instanceof DiffError ? error.code : "too-complex",
    };
  }
  self.postMessage(response);
};
