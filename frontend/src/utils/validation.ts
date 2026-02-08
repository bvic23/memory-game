import { z } from "zod";
import type { CreateGameRequest } from "@/types/requests";
import type { DefaultSettingsFormValues } from "@/constants";
import {
  CARD_COUNT_MIN,
  CARD_COUNT_MAX,
  COUNTDOWN_SECONDS_MIN,
  COUNTDOWN_SECONDS_MAX,
  FLIP_BACK_DELAY_MS_MIN,
  MAX_BAD_GUESSES_MIN,
} from "@/constants";

const emptyToUndefined = (val: unknown) =>
  val === "" || (typeof val === "number" && Number.isNaN(val)) ? undefined : val;

export const createFormSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  cardCount: z
    .preprocess(emptyToUndefined, z.number({ error: "Required value" }))
    .pipe(
      z
        .number()
        .int("Must be a whole number")
        .min(CARD_COUNT_MIN, `Must be at least ${CARD_COUNT_MIN}`)
        .max(CARD_COUNT_MAX, `Must be at most ${CARD_COUNT_MAX}`)
        .refine((n) => n % 2 === 0, "Must be even"),
    ),
  countdownSeconds: z
    .preprocess(emptyToUndefined, z.number({ error: "Required value" }))
    .pipe(
      z
        .number()
        .int("Must be a whole number")
        .min(
          COUNTDOWN_SECONDS_MIN,
          `Must be between ${COUNTDOWN_SECONDS_MIN} and ${COUNTDOWN_SECONDS_MAX}`,
        )
        .max(
          COUNTDOWN_SECONDS_MAX,
          `Must be between ${COUNTDOWN_SECONDS_MIN} and ${COUNTDOWN_SECONDS_MAX}`,
        ),
    ),
  flipBackDelayMs: z
    .preprocess(emptyToUndefined, z.number({ error: "Required value" }))
    .pipe(z.number().min(FLIP_BACK_DELAY_MS_MIN, "Must be 0 or greater")),
  maxBadGuesses: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        (!isNaN(Number(val)) &&
          Number.isInteger(Number(val)) &&
          Number(val) >= MAX_BAD_GUESSES_MIN),
      { message: "Must be at least 1 or empty" },
    ),
});

export type CreateFormValues = z.infer<typeof createFormSchema>;

/** Converts validated form values to the API request shape. */
export function formValuesToRequest(
  values: DefaultSettingsFormValues | CreateFormValues,
): CreateGameRequest {
  return {
    userName: values.userName.trim(),
    cardCount: values.cardCount,
    countdownSeconds: values.countdownSeconds,
    flipBackDelayMs: values.flipBackDelayMs,
    ...(values.maxBadGuesses === ""
      ? {}
      : { maxBadGuesses: Number(values.maxBadGuesses) }),
  };
}
