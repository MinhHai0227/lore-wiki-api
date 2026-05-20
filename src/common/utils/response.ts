export type MutationResponse<T = undefined> = {
  success: true;
  message: string;
  data?: T;
};

export function successResponse<T>(
  message: string,
  data?: T,
): MutationResponse<T> {
  return {
    success: true,
    message,
    ...(data === undefined ? {} : { data }),
  };
}
