'use client';

interface TableSkeletonRowProps {
  columns: number;
  widths: string[];
}

export default function TableSkeletonRow({ columns, widths }: TableSkeletonRowProps) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4" style={{ width: widths[i] }}>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-full"></div>
        </td>
      ))}
    </tr>
  );
}