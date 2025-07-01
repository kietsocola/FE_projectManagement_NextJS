'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  const delta = 1; // số trang trước/sau cần hiển thị gần current
  const range: (number | '...')[] = [];

  for (let i = 0; i < total; i++) {
    if (
      i === 0 || // luôn hiển thị trang đầu
      i === total - 1 || // luôn hiển thị trang cuối
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return range;
}


export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationRange = getPaginationRange(currentPage, totalPages);
  const pageSizeOptions = [5, 10, 20, 50, 100];

  if (totalPages <= 1) return (
    <div className="flex items-center gap-2">
          <span>Show rows</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={v => onPageSizeChange && onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="w-20 focus:ring-2 focus:ring-blue-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  );

  const startEntry = currentPage * itemsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between mt-4 px-4">
      {/* Left side: entry info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
        <div>
          Showing {startEntry} to {endEntry} of {totalItems} entries
        </div>
        <span className="hidden sm:inline mx-2 text-gray-300">|</span>
        <div className="flex items-center gap-2 pb-4 sm:pb-0">
          <span>Show rows</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={v => onPageSizeChange && onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="w-20 focus:ring-2 focus:ring-blue-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side: pagination */}
      <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto justify-center">
        <Button
          variant="outline"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {paginationRange.map((page, index) =>
          page === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </Button>
          )
        )}

        <Button
          variant="outline"
          disabled={currentPage === totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

}