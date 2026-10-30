# 0010. Form builder

Status: Proposed
Date: 2026-10-05

## Context

Some forms are not fixed in code. Their fields arrive as data, for example
from a backend. JSON that drives UI generation can be malformed, and a bad
description could crash rendering. The values a person types also need
validating, using rules taken from the same description.

## Decision

`shared/form-builder` builds forms from a schema description, with validation
at two separate levels:

1. **A static Zod schema validates the description itself** (the form, its
   fields and their types), before anything is rendered.
2. **`buildFieldValuesSchema` builds a second Zod schema at runtime** from a
   validated description, to validate what a person enters, and
   `buildDefaultValues` supplies the starting values.
3. **A field registry maps each field type to a renderer.** Adding a field
   type means adding one registry entry, not editing several files.
4. **`FormBuilder` uses TanStack Form**, with the runtime schema as its change
   validator and a subscription to drive the submit button's state. Fields are
   drawn with the shared form primitives.

## Alternatives Considered

**Hand-written forms for each screen.** Right for fixed forms, but it cannot
serve forms whose fields come from data.

**A chain of conditionals per field type.** Rejected. Several near-duplicate
branches drift apart, which is what the registry avoids.

## Consequences

**Easier:** a malformed description is rejected up front instead of breaking the
UI, and the same description drives rendering, defaults and validation.

**Harder:** this module depends on Zod, whose use across the template is under
review. If the template moves to plain TypeScript, the validators would have to
be written by hand and the description check replaced by a type guard. That is
the largest single piece of that change, and a new ADR should supersede this
one. There is no `radio` field type yet, although `RadioGroup` now exists.
