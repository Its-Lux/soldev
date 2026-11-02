const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g

/** Chapter prose with `code` and **bold**, the only two marks chapters use. */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, index) => {
        if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="rounded-xs bg-surface px-1 py-0.5 font-mono text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })}
    </>
  )
}
