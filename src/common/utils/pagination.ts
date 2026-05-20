import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants/pagination.constants';

export type PaginationInput = {
  page?: number | string;
  limit?: number | string;
};

export type PaginationOptions = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export function getPagination(input: PaginationInput = {}): PaginationOptions {
  const page = normalizePositiveInt(input.page, DEFAULT_PAGE);
  const requestedLimit = normalizePositiveInt(input.limit, DEFAULT_PAGE_SIZE);
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: Pick<PaginationOptions, 'page' | 'limit'>,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    },
  };
}

function normalizePositiveInt(
  value: number | string | undefined,
  fallback: number,
) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}
