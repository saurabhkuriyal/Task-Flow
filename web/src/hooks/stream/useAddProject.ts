"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  streamService,
  type CreateStreamPayload,
} from "@/services/stream.service";
import { useUser } from "@/context/UserContext";

export interface AddProjectFormData {
  name: string;
  description: string;
}

export interface UseAddProjectOptions {
  organisationId?: string;
  organisationName?: string;
  creatorId?: string;
  creatorName?: string;
  onSuccess?: () => void;
}

export function useAddProject(options?: UseAddProjectOptions) {
  const params = useParams();
  const { userId, userName, organizationId, organizationName } = useUser();

  const currentOrgId =
    options?.organisationId ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const currentOrgName =
    options?.organisationName ||
    organizationName ||
    (typeof params?.orgId === "string" ? decodeURIComponent(params.orgId) : "") ||
    "Organization";

  const currentCreatorId = options?.creatorId || userId || "";
  const currentCreatorName = options?.creatorName || userName || "User";

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<AddProjectFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<AddProjectFormData> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      const payload: CreateStreamPayload = {
        name: data.name.trim(),
        description: data.description.trim(),
        organisationId: currentOrgId,
        organisationName: currentOrgName,
        creatorId: currentCreatorId,
        creatorName: currentCreatorName,
        leadId: "",
        leadName: "",
        type: "project",
      };

      const response = await streamService.createProject(payload);

      if (response.success) {
        setIsSuccess(true);
        form.reset();
        options?.onSuccess?.();
      } else {
        setServerError(response.message || "Failed to create project.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create project.";
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
    currentCreatorId,
    currentCreatorName,
  };
}

export default useAddProject;
