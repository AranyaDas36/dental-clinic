import type { PaginationQuery } from '@dental/shared';

export function getPagination(query: PaginationQuery) {
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, limit: pageSize };
}
