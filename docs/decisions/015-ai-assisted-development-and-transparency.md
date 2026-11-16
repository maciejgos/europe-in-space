# ADR-015: AI-Assisted Development and Transparency

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

Europe in Space is a public, open-source engineering pet project. Its maintainer intends to use OpenAI Codex for development and may share practical workflows and lessons with other developers. Because orbital calculations and scientific data require care, transparency about AI assistance must not be confused with claims of automated correctness or institutional endorsement.

## Decision

Document **material use of OpenAI Codex as an engineering assistant** while preserving human responsibility for every merged change and all scientific, security, licensing, and architectural decisions.

- Mention Codex in the README or project documentation as a development tool, not as the product's owner or sponsor.
- Review and test AI-assisted changes before merging.
- Require independent numerical verification for orbital calculations, regardless of whether code was AI-assisted.
- Record meaningful lessons, prompts/workflows, limitations, and corrections when useful for reproducibility.
- Never publish secrets, private user data, private source material, or unreviewed third-party content in shared sessions or examples.
- Do not describe the project as endorsed by OpenAI or claim Ambassador status absent an official appointment.
- Keep optional development notes in `docs/building-with-codex/` when there is content worth publishing; do not mandate verbose logs for every interaction.

## Rationale

Clear disclosure gives contributors context, provides educational value about AI-assisted engineering, and reinforces that quality gates and accountability apply to all code. A lightweight approach avoids turning documentation into an administrative burden for a pet project.

## Consequences

### Positive
- Transparent engineering practice and reusable public learning material.
- Opportunity to demonstrate rigorous testing and code review alongside AI use.
- Clear attribution of accountability to the maintainer.

### Negative / trade-offs
- Public workflows require review for sensitive or irrelevant material.
- Tool-generated explanations and claims may be inaccurate and require verification.
- Detailed documentation can add overhead if applied indiscriminately.

## Alternatives Considered

1. **No mention of AI tools** — simpler but misses a meaningful aspect of the engineering process.
2. **Full prompt/transcript publication** — maximum transparency but impractical, potentially sensitive and often noisy.
3. **Prominent AI co-branding** — may incorrectly imply affiliation or endorsement.
4. **Mandatory machine-generated disclosures on every file** — adds noise without necessarily improving review quality.

## Validation Before Release

- Agree on minimal README language and an independent-project disclaimer.
- Demonstrate a reviewed example of an AI-assisted feature with tests and a concise lesson learned.
- Establish a lightweight check for secrets, licensing and accuracy before publishing any Codex workflow.

## Revisit When

Contributor policy, project governance, external affiliations, or tool-use disclosure requirements change.
