import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_GATEWAY_URL: z
      .string()
      .url()
      .default("https://creatoros-api.adharbattulwar.com"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
