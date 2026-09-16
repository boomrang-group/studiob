---
name: Authentication provider
description: Why Studio BoomRang uses Replit-managed Clerk instead of its imported Firebase authentication.
---

Use Replit-managed Clerk for Studio BoomRang authentication and server-side AI authorization.

**Why:** The imported project referenced Firebase but did not include any usable Firebase client or server configuration. This left sign-up, sign-in, and all protected generation flows inoperable. Clerk is provisioned by Replit and works in both development and production.

**How to apply:** Keep browser authentication cookie-based through Clerk, validate Clerk sessions on protected API routes, and do not reintroduce Firebase without an explicit migration plan.