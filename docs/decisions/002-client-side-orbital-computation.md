# ADR-002: Client-side orbital computation

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
The satellite tracker must show a moving predicted spacecraft position. Computing every frame on the backend would create continuous requests, add latency, and make Cloudflare Free quotas harder to manage.

## Decision
Perform time-dependent orbital propagation and associated position calculations in the visitor's browser using tested orbital libraries. The backend supplies validated and cached orbital elements, not a stream of calculated positions. Visual updates do not require a backend request every second.

## Rationale
- Reduce server invocations and operational cost.
- Support smooth interactive simulations and time controls.
- Make the visualization portable across hosting providers.

## Consequences
- Browser computation must be bounded for lower-powered devices.
- Expensive path sampling should be cached or throttled; rendering updates must be decoupled from network requests.
- The UI must provide an accessible non-3D fallback.
- Data age, prediction time, and propagation errors must be visible and handled explicitly.
- This decision establishes *where* computations run; ADR-011 establishes the chosen propagation algorithm.

## Alternatives considered
- **Backend propagation per frame:** rejected due to cost and latency.
- **Precomputed static position snapshots:** insufficient for smooth interactive tracking and arbitrary prediction times.
- **Continuous telemetry feeds:** not generally available for the chosen public spacecraft data and not the same as propagated positions.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
