import { InlineText } from './InlineText'

interface GuideTableProps {
  headers: string[]
  rows: string[][]
}

export function GuideTable({ headers, rows }: GuideTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-base">
        <thead className="bg-surface">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="border-b border-border px-4 py-2.5 text-sm font-semibold"
              >
                <InlineText text={header} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0">
              {headers.map((_, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2.5 align-top leading-relaxed text-foreground/80"
                >
                  <InlineText text={row[cellIndex] ?? ''} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
