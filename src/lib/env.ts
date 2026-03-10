import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_GATEWAY_URL: z
      .string()
      .url()
      .default("https://creatoros-api.adharbattulwar.com"),
    VITE_PUBLISHING_BASE_PATH: z.string().default("/publishing"),
    VITE_SCHEDULER_BASE_PATH: z.string().default("/scheduler"),
    VITE_ANALYTICS_BASE_PATH: z.string().default("/analytics"),
    VITE_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
