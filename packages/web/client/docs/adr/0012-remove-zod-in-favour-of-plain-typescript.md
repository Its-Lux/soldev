# 0012. Remove Zod in favour of plain TypeScript

Status: Accepted
Date: 2026-11-02

## Context

Zod was used at two points: response schemas at each feature's `api/`
boundary (with types derived through `z.infer`), and the form builder, which
used a static Zod schema to check a form description and built a second one
at runtime to check entered values (ADR 0010). The owner decided to remove
Zod from the system. Shared request and response types are planned as a
types-only package, which a runtime schema library does not fit.

## Decision

Zod is removed from every package's code and dependencies.

1. **Domain types are plain TypeScript interfaces**, written by hand and
   generated that way by `plop-templates/types.hbs`. They are compile-time
   promises only.
2. **Runtime checks are opt-in per call.** `request()` takes an optional
   `parse` function that receives the unwrapped payload and returns it as `T`
   or throws. Without it, the type argument is trusted, which is the one
   deliberate cast in the client. Envelope handling stays in the
   `unwrapResponse` seam of `configureApi`.
3. **The form builder validates by hand.** `validateFormSchema` checks a
   description in one pass and returns every problem with its path;
   `parseFormSchema` is its throwing form, shaped to fit `request()`'s `parse`
   option. `validateField` checks each entered value against its field's rules.
4. **One list drives both type and check.** `FIELD_TYPES` is a constant array;
   the `FieldType` union is derived from it and `parseFormSchema` checks
   against it, so the two cannot disagree.

## Alternatives Considered

**Keep Zod.** One definition gives both the type and the runtime check, but it
adds a runtime dependency to every app and does not fit a types-only shared
package. Rejected by owner decision.

**Another schema library (Valibot, ArkType).** Same trade-off as Zod with a
smaller bundle. Rejected for the same reason: the aim was no schema library.

**No runtime checks at all.** Simplest, but a form description arriving from
an API could crash rendering. Rejected; `parse` keeps checks available where
data is untrusted.

## Consequences

**Easier:** no runtime validation dependency; types are readable interfaces;
the shared types package can stay types-only; any validator, including a
library's parse function, can still be plugged into `request()` per call.

**Harder:** hand-written validators must be kept in step with their types by
hand. `FIELD_TYPES` removes that risk for field types, but not for other
fields. Responses without a `parse` function are not checked at runtime, so a
shape mismatch from the server surfaces wherever the data is first used, not
at the boundary.

Zod remains in the lockfile only because `eslint-plugin-react-hooks` depends
on it. It is a lint-time tool and never reaches application code or bundles.
