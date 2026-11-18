"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useUser } from "@/context/UserContext";
import type { SignupPayload } from "@/types/auth";

export interface AddMemberFormData {
  name: string;
  email: string;
  phoneNumber: string;
  createPasscode: string;
}

export interface UseAddMemberOptions {
  organisationId?: string;
  organisationName?: string;
  onSuccess?: () => void;
}

export function useAddMember(
  optionsOrSuccess?: UseAddMemberOptions | (() => void)
) {
  const options: UseAddMemberOptions =
    typeof optionsOrSuccess === "function"
      ? { onSuccess: optionsOrSuccess }
      : optionsOrSuccess || {};

  const params = useParams();
  const { organizationId: contextOrgId, organizationName: contextOrgName } = useUser();

  const currentOrgId =
    options.organisationId ||
    (params?.orgId as string) ||
    contextOrgId ||
    "";

  const currentOrgName =
    options.organisationName ||
    contextOrgName ||
    (typeof params?.orgId === "string" ? decodeURIComponent(params.orgId) : "") ||
    "Organization";

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<AddMemberFormData>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      createPasscode: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<AddMemberFormData> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      const payload: SignupPayload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber.trim(),
        password: data.createPasscode,
        role: "employee",
        organisationId: currentOrgId,
        organisationName: currentOrgName,
      };

      const response = await authService.signup(payload);

      if (response.success) {
        setIsSuccess(true);
        form.reset();
        options.onSuccess?.();
      } else {
        setServerError(response.message || "Failed to add member.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add member.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = React.useCallback(() => {
    form.reset();
    setServerError(null);
    setIsSuccess(false);
  }, [form]);

  return {
    form,
    isLoading,
    serverError,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    reset,
    currentOrgId,
    currentOrgName,
  };
}

export default useAddMember;
