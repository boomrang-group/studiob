import assert from "node:assert/strict";
import test from "node:test";
import { resolveInitialEmailPreferences } from "./email-consent.ts";

test("preserves a legacy notification opt-out before the first database record", () => {
  assert.deepEqual(
    resolveInitialEmailPreferences({
      emailNotifications: false,
      marketingEmails: true,
    }),
    {
      emailNotifications: false,
      marketingEmails: true,
    },
  );
});

test("defaults notifications on and marketing off for users with no prior choice", () => {
  assert.deepEqual(resolveInitialEmailPreferences({}), {
    emailNotifications: true,
    marketingEmails: false,
  });
});