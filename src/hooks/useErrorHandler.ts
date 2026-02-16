import { useCallback } from "react";
import { toast } from "sonner";

const SUPABASE_ERROR_MAP: Record<string, string> = {
  "23505": "Este registro já existe. Verifique os dados e tente novamente.",
  "23503": "Não é possível completar esta ação pois há dados relacionados.",
  "42501": "Você não tem permissão para realizar esta ação.",
  "PGRST116": "Registro não encontrado.",
  "PGRST301": "Sessão expirada. Faça login novamente.",
  "invalid_credentials": "Email ou senha incorretos.",
  "email_not_confirmed": "Confirme seu email antes de fazer login.",
  "user_already_exists": "Este email já está cadastrado.",
  "weak_password": "A senha deve ter pelo menos 6 caracteres.",
  "over_request_rate_limit": "Muitas tentativas. Aguarde um momento e tente novamente.",
};

const CONTEXT_MESSAGES: Record<string, string> = {
  auth: "Erro na autenticação. Tente novamente.",
  payment: "Erro no processamento do pagamento. Tente novamente ou use outro método.",
  fetch: "Erro ao carregar dados. Verifique sua conexão e tente novamente.",
  save: "Erro ao salvar. Tente novamente.",
  delete: "Erro ao remover. Tente novamente.",
  upload: "Erro ao enviar arquivo. Verifique o tamanho e formato.",
  oracle: "Erro ao consultar o oráculo. Os astros pedem paciência — tente novamente.",
};

interface ErrorHandlerOptions {
  context?: keyof typeof CONTEXT_MESSAGES;
  silent?: boolean;
  rethrow?: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error_description === "string") return obj.error_description;
    if (typeof obj.code === "string" && SUPABASE_ERROR_MAP[obj.code]) {
      return SUPABASE_ERROR_MAP[obj.code];
    }
  }
  return "Erro inesperado. Tente novamente.";
}

function getErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.code === "string") return obj.code;
    if (typeof obj.status === "number") return String(obj.status);
  }
  return null;
}

export function useErrorHandler() {
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const { context, silent = false, rethrow = false } = options;

      const code = getErrorCode(error);
      let message: string;

      if (code && SUPABASE_ERROR_MAP[code]) {
        message = SUPABASE_ERROR_MAP[code];
      } else {
        const rawMessage = getErrorMessage(error);
        const isTechnical =
          rawMessage.includes("fetch") ||
          rawMessage.includes("network") ||
          rawMessage.includes("CORS") ||
          rawMessage.includes("undefined") ||
          rawMessage.includes("null") ||
          rawMessage.length > 200;

        if (isTechnical && context && CONTEXT_MESSAGES[context]) {
          message = CONTEXT_MESSAGES[context];
        } else if (isTechnical) {
          message = "Algo deu errado. Tente novamente em alguns instantes.";
        } else {
          message = rawMessage;
        }
      }

      console.error(`[ErrorHandler${context ? `:${context}` : ""}]`, error);

      if (!silent) {
        toast.error(message);
      }

      if (rethrow) throw error;

      return message;
    },
    []
  );

  const trySafe = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError]
  );

  return { handleError, trySafe };
}
