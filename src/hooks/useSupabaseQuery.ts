import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => PromiseLike<{ data: T | null; error: any }>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) {
        handleError(error, { context: "fetch", silent: true });
        throw error;
      }
      return data as T;
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    refetchInterval: options?.refetchInterval,
  });
}

export function useSupabaseMutation<TInput, TOutput = any>(
  mutationFn: (input: TInput) => PromiseLike<{ data: TOutput | null; error: any }>,
  options?: {
    invalidateKeys?: string[][];
    context?: "save" | "delete" | "payment" | "upload";
    onSuccess?: (data: TOutput) => void;
  }
) {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const { data, error } = await mutationFn(input);
      if (error) throw error;
      return data as TOutput;
    },
    onSuccess: (data) => {
      if (options?.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleError(error, { context: options?.context || "save" });
    },
  });
}
