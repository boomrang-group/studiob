export type StoredEmailPreferences = {
  emailNotifications: boolean;
  marketingEmails: boolean;
};

type LegacyMetadata = Record<string, unknown>;

export function resolveInitialEmailPreferences(
  metadata: LegacyMetadata,
): StoredEmailPreferences {
  return {
    emailNotifications:
      typeof metadata.emailNotifications === "boolean"
        ? metadata.emailNotifications
        : true,
    marketingEmails:
      typeof metadata.marketingEmails === "boolean"
        ? metadata.marketingEmails
        : false,
  };
}