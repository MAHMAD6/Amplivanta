/**
 * Workspace preference screens as configuration. Each scope lists the exact
 * settings a screen offers; saving accepts only these keys and option values,
 * and an unset field stays unset ("Not configured") rather than defaulting
 * silently. Pure, so parsing is unit-tested.
 */

export type PrefField =
  | { key: string; label: string; description?: string; kind: "toggle" }
  | { key: string; label: string; description?: string; kind: "select"; options: [value: string, label: string][]; placeholder?: string }
  | { key: string; label: string; description?: string; kind: "text"; placeholder?: string; maxLength?: number };

export type PrefSection = { id: string; title: string; tab?: string; fields: PrefField[] };
export type PrefScope = { scope: string; tabs?: [id: string, label: string][]; sections: PrefSection[] };

const TIMEZONES: [string, string][] = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Sao_Paulo",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid", "Africa/Lagos", "Africa/Johannesburg", "Asia/Dubai",
  "Asia/Karachi", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
].map((z) => [z, z.replace("_", " ")]);

const VISIBILITY: [string, string][] = [["public", "Public"], ["followers", "Followers only"], ["private", "Private"]];
const NOTIFY: [string, string][] = [["in_app", "In-app"], ["email", "Email"], ["in_app_email", "In-app and email"], ["off", "Off"]];

export const PREFERENCE_SCOPES: Record<string, PrefScope> = {
  "social.settings": {
    scope: "social.settings",
    tabs: [["general", "General"], ["publishing", "Publishing"], ["notifications", "Notifications"], ["content", "Content & Media"], ["security", "Security"]],
    sections: [
      { id: "general", tab: "general", title: "General Preferences", fields: [
        { key: "timezone", label: "Timezone", description: "Set the default timezone for scheduling and timestamps.", kind: "select", options: TIMEZONES, placeholder: "Not configured" },
      ] },
      { id: "defaults", tab: "general", title: "Publishing Defaults", fields: [
        { key: "defaultVisibility", label: "Default post visibility", description: "Set the default visibility for new posts.", kind: "select", options: VISIBILITY },
        { key: "defaultCategory", label: "Default content category", description: "Choose a default category for organizing content.", kind: "select", options: [["announcement", "Announcement"], ["educational", "Educational"], ["promotional", "Promotional"], ["community", "Community"], ["event", "Event"]] },
      ] },
      { id: "links", tab: "publishing", title: "Link & Tracking", fields: [
        { key: "urlShortening", label: "Enable URL shortening", description: "Automatically shorten URLs in your posts.", kind: "toggle" },
        { key: "urlShortener", label: "Default URL shortener", description: "Select a preferred URL shortener.", kind: "select", options: [["none", "None"]] },
        { key: "utmTracking", label: "UTM tracking", description: "Append default UTM parameters to outbound links.", kind: "toggle" },
        { key: "utmSource", label: "Default UTM source", description: "Set the default UTM source.", kind: "text", maxLength: 60 },
        { key: "utmMedium", label: "Default UTM medium", description: "Set the default UTM medium.", kind: "text", maxLength: 60 },
        { key: "utmCampaign", label: "Default UTM campaign", description: "Set the default UTM campaign.", kind: "text", maxLength: 60 },
      ] },
      { id: "approval", tab: "publishing", title: "Approval & Workflow", fields: [
        { key: "requireApproval", label: "Require approval for all posts", description: "All posts must be approved before publishing.", kind: "toggle" },
        { key: "autoApproveSingle", label: "Auto-approve for single account posts", description: "Automatically approve posts targeting a single account.", kind: "toggle" },
      ] },
      { id: "notify", tab: "notifications", title: "Notifications", fields: [
        { key: "notifyApprovals", label: "Approval requests", description: "When a post needs your review.", kind: "select", options: NOTIFY },
        { key: "notifyPublishing", label: "Publishing results", description: "When a post publishes or fails to publish.", kind: "select", options: NOTIFY },
      ] },
      { id: "autosave", tab: "content", title: "Auto-Save", fields: [
        { key: "autosave", label: "Enable auto-save for drafts", description: "Automatically save drafts as you edit.", kind: "toggle" },
        { key: "autosaveInterval", label: "Auto-save interval", description: "How often drafts are auto-saved.", kind: "select", options: [["30", "Every 30 seconds"], ["60", "Every minute"], ["300", "Every 5 minutes"]] },
      ] },
      { id: "security", tab: "security", title: "Security", fields: [
        { key: "restrictPublishing", label: "Restrict publishing to admins", description: "Only workspace admins can publish or schedule.", kind: "toggle" },
      ] },
    ],
  },
  "social.platform": {
    scope: "social.platform",
    tabs: [["general", "General"], ["publishing", "Publishing"], ["notifications", "Notifications"], ["content", "Content & Media"], ["security", "Security & Privacy"], ["integrations", "Integrations"], ["advanced", "Advanced"]],
    sections: [
      { id: "general", tab: "general", title: "General Preferences", fields: [
        { key: "approvalRequirement", label: "Default approval requirement", description: "Require approval before posts are published.", kind: "select", options: [["none", "No approval"], ["one", "One approver"], ["all", "All approvers"]] },
        { key: "reviewRules", label: "Content review rules", description: "Set default review behavior for posts.", kind: "select", options: [["manual", "Manual review"], ["flagged", "Review flagged content only"]] },
        { key: "defaultVisibility", label: "Default post visibility", description: "Set the default visibility for new posts.", kind: "select", options: VISIBILITY },
      ] },
      { id: "notifications", tab: "notifications", title: "Notifications", fields: [
        { key: "systemNotifications", label: "Enable system notifications", description: "Receive in-app notifications for activity and updates.", kind: "toggle" },
        { key: "notifyApprovals", label: "Notify on approvals", description: "Get notified when approvals are requested, approved, or rejected.", kind: "select", options: NOTIFY },
        { key: "notifyPublishing", label: "Notify on publishing events", description: "Get notified when posts are published or fail to publish.", kind: "select", options: NOTIFY },
      ] },
      { id: "content", tab: "content", title: "Content & Media", fields: [
        { key: "mediaOptimization", label: "Media optimization", description: "Optimize media for each platform automatically.", kind: "toggle" },
        { key: "mediaBehavior", label: "Default media behavior", description: "Choose how media is handled in your posts.", kind: "select", options: [["original", "Keep original"], ["compress", "Compress for web"]] },
        { key: "urlHandling", label: "URL handling", description: "Set how URLs are shortened or tracked.", kind: "select", options: [["none", "Leave as entered"], ["utm", "Append UTM parameters"]] },
      ] },
      { id: "security", tab: "security", title: "Security & Privacy", fields: [
        { key: "permissionReview", label: "Content permission review", description: "Require permission review for restricted content.", kind: "toggle" },
        { key: "privacyLevel", label: "Privacy level for posts", description: "Choose the default privacy level for posts.", kind: "select", options: VISIBILITY },
        { key: "retention", label: "Data retention preference", description: "Set how long published content data is retained.", kind: "select", options: [["90", "90 days"], ["365", "1 year"], ["730", "2 years"], ["forever", "Until deleted"]] },
      ] },
      { id: "integrations", tab: "integrations", title: "Integrations & Sync", fields: [
        { key: "platformSync", label: "Enable platform sync", description: "Sync connected platforms and account data.", kind: "toggle" },
        { key: "syncFrequency", label: "Sync frequency", description: "Choose how often data is synchronized.", kind: "select", options: [["hourly", "Hourly"], ["daily", "Daily"], ["manual", "Manual only"]] },
        { key: "syncConflicts", label: "Handle sync conflicts", description: "Choose how conflicts are resolved during sync.", kind: "select", options: [["amplivanta", "Keep Amplivanta version"], ["platform", "Keep platform version"], ["ask", "Ask each time"]] },
      ] },
      { id: "publishing", tab: "publishing", title: "Publishing Rules", fields: [
        { key: "publishWindow", label: "Default publishing window", description: "When scheduled posts may be published.", kind: "select", options: [["any", "Any time"], ["business", "Business hours"], ["custom", "Custom per post"]] },
        { key: "failureRetries", label: "Retry failed publishes", description: "How many times a failed publish is retried.", kind: "select", options: [["0", "No retries"], ["1", "Once"], ["3", "Up to 3 times"]] },
      ] },
      { id: "advanced", tab: "advanced", title: "Advanced", fields: [
        { key: "auditVerbose", label: "Detailed activity logging", description: "Record draft edits in the activity log in addition to workflow events.", kind: "toggle" },
      ] },
    ],
  },
};

const CHANNEL: [string, string][] = [["default", "Use workspace default"], ["on", "On"], ["off", "Off"]];
const FREQUENCY: [string, string][] = [["realtime", "Real time"], ["daily", "Daily digest"], ["weekly", "Weekly digest"]];
const LANGUAGES: [string, string][] = [["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["pt", "Portuguese"], ["ar", "Arabic"], ["ur", "Urdu"]];
const CURRENCIES: [string, string][] = ["USD", "EUR", "GBP", "CAD", "AUD", "AED", "PKR", "INR"].map((c) => [c, c]);

/** Notification categories on the Notification Settings screen. Security is policy-controlled. */
export const NOTIFICATION_CATEGORIES: { key: string; label: string; policy: "configurable" | "policy" | "dependent" }[] = [
  { key: "campaigns", label: "Campaign & publishing activity", policy: "configurable" },
  { key: "approvals", label: "Approvals & collaboration", policy: "configurable" },
  { key: "automation", label: "Automation & workflow events", policy: "configurable" },
  { key: "security", label: "Security & account activity", policy: "policy" },
  { key: "billing", label: "Billing & subscription", policy: "dependent" },
  { key: "product", label: "Product & workspace updates", policy: "configurable" },
];

PREFERENCE_SCOPES["workspace.general"] = {
  scope: "workspace.general",
  sections: [
    { id: "profile", title: "Workspace Profile", fields: [
      { key: "timezone", label: "Default Timezone", kind: "select", options: TIMEZONES, placeholder: "Select timezone" },
      { key: "language", label: "Default Language", kind: "select", options: LANGUAGES, placeholder: "Select language" },
      { key: "dateFormat", label: "Date & Time Format", kind: "select", options: [["mdy", "MM/DD/YYYY, 12-hour"], ["dmy", "DD/MM/YYYY, 24-hour"], ["iso", "YYYY-MM-DD, 24-hour"]], placeholder: "Select format" },
      { key: "currency", label: "Currency", kind: "select", options: CURRENCIES, placeholder: "Select currency" },
    ] },
  ],
};

PREFERENCE_SCOPES["workspace.notifications"] = {
  scope: "workspace.notifications",
  sections: [
    {
      id: "matrix",
      title: "Notifications",
      fields: NOTIFICATION_CATEGORIES.filter((c) => c.policy !== "policy").flatMap((c) => [
        { key: `${c.key}.inApp`, label: `${c.label} in-app`, kind: "select" as const, options: CHANNEL },
        { key: `${c.key}.email`, label: `${c.label} email`, kind: "select" as const, options: CHANNEL },
        { key: `${c.key}.frequency`, label: `${c.label} frequency`, kind: "select" as const, options: FREQUENCY },
      ]),
    },
  ],
};

PREFERENCE_SCOPES["workspace.data"] = {
  scope: "workspace.data",
  sections: [
    { id: "retention", title: "Retention & Deletion", fields: [
      { key: "retention", label: "Retention Policy", kind: "select", options: [["1y", "Keep records for 1 year"], ["2y", "Keep records for 2 years"], ["5y", "Keep records for 5 years"], ["indefinite", "Keep until deleted"]], placeholder: "Not configured" },
      { key: "deletion", label: "Deletion Policy", kind: "select", options: [["manual", "Manual deletion only"], ["admin_review", "Admin review before deletion"]], placeholder: "Not configured" },
    ] },
  ],
};

export type PreferenceValues = Record<string, string | boolean>;

/** Keeps only defined keys with valid values; unset selects and blank text are omitted. */
export function parsePreferences(scope: PrefScope, input: Record<string, string | undefined>): PreferenceValues {
  const out: PreferenceValues = {};
  for (const section of scope.sections) {
    for (const f of section.fields) {
      const raw = input[f.key];
      if (f.kind === "toggle") {
        out[f.key] = raw === "on" || raw === "true";
      } else if (f.kind === "select") {
        if (raw && f.options.some(([v]) => v === raw)) out[f.key] = raw;
      } else {
        const v = (raw ?? "").trim().slice(0, f.maxLength ?? 120);
        if (v && /^[\w .,:/@#+-]*$/.test(v)) out[f.key] = v;
      }
    }
  }
  return out;
}
