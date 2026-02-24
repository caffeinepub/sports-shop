# Specification

## Summary
**Goal:** Restore missing admin panel access that was removed in Version 29.

**Planned changes:**
- Add admin panel link back to header navigation for authenticated admin users
- Verify /admin route is properly configured in router
- Ensure admin role checking logic correctly identifies admin users by their Internet Identity principal

**User-visible outcome:** Admin users can access the admin panel via a visible link in the header navigation.
