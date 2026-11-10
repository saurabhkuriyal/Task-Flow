"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useUser } from "@/context/UserContext";
import { ROUTES } from "@/constants/routes";
import type { SigninPayload } from "@/types/auth";

export interface SigninFormData {
  email: string;
  password: string;
}

export function useSignin() {
  const router = useRouter();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SigninFormData> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload: SigninPayload = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };

      const response = await authService.signin(payload);

      if (response.success) {
        if (response.user) {
          // Inserting data in Context API
          setUser({
            userId: response.user.id,
            userName: response.user.name,
            role: response.user.role || null,
          });
        }

        setIsSuccess(true);

        setTimeout(() => {
          router.push(ROUTES.DASHBOARD);
        }, 800);
      } else {
        setServerError(response.message || "Sign in failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    serverError,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
  };
}

export default useSignin;
