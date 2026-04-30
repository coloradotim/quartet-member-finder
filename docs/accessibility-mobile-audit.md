# Accessibility and Mobile Audit

This pre-launch audit covers the core public and signed-in flows:

- public home
- help and privacy pages
- sign-in flow
- signed-in dashboard
- onboarding
- My Singer Profile
- Quartet Mode
- Find Quartet Openings
- Find Singers
- Map
- contact relay form
- feedback form

## Launch Checks

- Public and signed-in navigation remain usable on phone-sized viewports.
- Primary links and buttons have at least 44px tap targets.
- Keyboard focus is visible across links, buttons, inputs, selects, textareas, and custom radio-card choices.
- Search, contact, feedback, profile, listing, onboarding, and settings forms have visible labels.
- Error and success messages use status or alert semantics where server-rendered feedback appears.
- Search filters accept global country, region, locality, and long location strings without US-only assumptions.
- Contact and feedback flows keep personal contact details private and retain app-mediated language.
- The map remains a privacy-safe approximate regional view and includes text summaries below the visual map.

## Follow-Up Issues

- Add automated accessibility scanning to CI after the UI surface stabilizes.
- Revisit the map if it becomes a real interactive map widget; keyboard panning, zoom controls, and marker popovers will need a separate accessibility pass.
- Consider a compact mobile filter drawer if discovery filters grow beyond the current launch fields.
