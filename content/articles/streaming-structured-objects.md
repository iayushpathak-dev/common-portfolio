## Introduction

Most AI UIs stream text. Many useful features are better served by streaming structured data: a generated form, a list of suggestions, a quiz, a trip plan. AI SDKs can stream a JSON object that grows field by field, validated against a schema. These notes cover how to render partial objects safely in React.

## Problem statement

If you wait for the full JSON, the user stares at a skeleton for ten seconds. If you render partial JSON naively, half-written fields, missing array items and type errors break the UI. You need a way to render "whatever is valid so far" without crashing.

## Learning objectives

1. Define an output schema the model must follow.
2. Stream a partial object to the client.
3. Render partial data defensively.
4. Validate the final object before acting on it.

## Core concepts

- **Output schema**: a Zod (or JSON Schema) definition of the object you want.
- **Partial object**: during streaming every field is optional and may be incomplete.
- **Final validation**: only the completed object is guaranteed to match the schema.
- **Element streaming**: for arrays, you can render each complete element as it arrives.

## Technical explanation

```text
schema: { plans: [{ name, pricePerMonth, perks[] }] }

t=1s  { plans: [{ name: "Ba" }] }
t=2s  { plans: [{ name: "Basic", pricePerMonth: 499 }] }
t=4s  { plans: [{ name: "Basic", pricePerMonth: 499, perks: ["Gym"] }, { name: "Pr" }] }
done  full object ─► schema.parse() ─► safe to save or submit
```

Render cards for elements that have the fields you need; show a skeleton for the one still being written.

## Code example

```tsx
const planSchema = z.object({
  plans: z.array(z.object({ name: z.string(), pricePerMonth: z.number(), perks: z.array(z.string()) })),
})

function PlanList({ partial }: { partial: DeepPartial<z.infer<typeof planSchema>> | undefined }) {
  const plans = partial?.plans ?? []
  return (
    <ul>
      {plans.map((plan, i) =>
        plan?.name && typeof plan.pricePerMonth === "number" ? (
          <li key={i}>
            {plan.name}: ₹{plan.pricePerMonth}/month
            {plan.perks?.length ? <span> · {plan.perks.filter(Boolean).join(", ")}</span> : null}
          </li>
        ) : (
          <li key={i} aria-hidden="true" className="h-6 animate-pulse rounded bg-muted" />
        ),
      )}
    </ul>
  )
}
```

Every access is optional-chained, numbers are type-checked before formatting, and incomplete items render as placeholders.

## Production considerations

- Keep schemas small and flat; deep nesting increases malformed output.
- Add `.describe()` text to fields; models follow field descriptions well.
- Never submit or persist the partial object, only the validated final one.
- Use stable keys from the data (an `id` field) when items can reorder.

## Trade-offs and alternatives

For short outputs, a non-streamed structured call is simpler. Tool calling also returns structured arguments, and is better when the model must choose between several actions. Streaming objects fits "generate a structured artefact for the user to review".

## Common mistakes

- Rendering `undefined` or `NaN` from half-written fields.
- Trusting the streamed object for business logic before it is complete.
- Showing every element as a skeleton instead of rendering complete ones early.

## Key takeaways

- Stream structured outputs when the result is a list or document the user reviews.
- Treat partial data as optional everywhere; validate only the final object.
- Render complete elements as soon as they are usable.
