import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FunctionReference } from "convex/server";

export const useConvexQuery = (
  query: FunctionReference<"query">,
  ...args: unknown[]
) => {
  const result = useQuery(query, args[0] || {});
  const [data, setData] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use effect to handle the state changes based on the query result
  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
    } else {
      try {
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        const error = err instanceof Error ? err : new Error(errorMessage);
        setError(error);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }, [result]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = (mutation: FunctionReference<"mutation">) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutate = async (...args: any[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(args[0] || {});
      setData(response);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
