"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import type { SignupPayload } from "@/types/auth";

export interface SignupFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export function useSignup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    // Validate password match
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const payload: SignupPayload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber.trim(),
        password: data.password,
      };

      const response = await authService.signup(payload);

      if (response.success) {
        setIsSuccess(true);
        // Redirect to signin with a success query param or directly to workspaces
        setTimeout(() => {
          router.push(`${ROUTES.AUTH.SIGNIN}?registered=true`);
        }, 1200);
      } else {
        setServerError(response.message || "Signup failed");
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

export default useSignup;
