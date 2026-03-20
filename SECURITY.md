# Security

This document describes client-side security measures in place and recommendations for a secure deployment.

## Client-side security (implemented)

- **X-Content-Type-Options: nosniff** — Prevents MIME-type sniffing; reduces risk of XSS and content confusion.
- **Referrer-Policy: strict-origin-when-cross-origin** — Limits referrer data sent to external sites; protects user privacy.
- **Permissions-Policy** — Restricts browser features (geolocation, microphone, camera, payment, USB, sensors) to reduce attack surface.
- **External links** — Links that open in a new tab use `rel="noopener noreferrer"` to prevent tab-nabbing and referrer leakage.

## Deployment recommendations

1. **HTTPS** — Serve the site over HTTPS only. Redirect HTTP to HTTPS and consider HSTS headers.
2. **Form submission** — When connecting the contact form to a backend, use an HTTPS endpoint and implement CSRF protection and server-side validation.
3. **Headers (server)** — If your server supports it, send these headers in addition to (or instead of) meta tags:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: ...`
   - Optional: `Content-Security-Policy` (tune for your fonts and scripts).
4. **Cookies** — If you add cookies later, use `Secure` and `HttpOnly` where appropriate and consider `SameSite`.

## Reporting issues

If you discover a security concern, please report it privately to the site owner rather than in a public issue.
