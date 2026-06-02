import "server-only";
import type { LanguageModel } from "ai";
import { isRetryableModelError, resolveModelChain } from "@/lib/admin/llm-providers";

export async function withModelChain<T>(
  run: (model: LanguageModel | string) => Promise<T>,
): Promise<T> {
  const chain = await resolveModelChain();
  let lastError: unknown;

  for (const model of chain) {
    try {
      return await run(model);
    } catch (err) {
      lastError = err;
      if (!isRetryableModelError(err)) throw err;
      console.warn("[advocate] model failed, trying next provider", err);
    }
  }

  throw lastError ?? new Error("No LLM providers configured.");
}
