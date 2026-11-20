"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  streamService,
  type CreateStreamPayload,
} from "@/services/stream.service";
import { useUser } from "@/context/UserContext";

export interface AddDepartmentFormData {
  name: string;
  description: string;
}

export interface UseAddDepartmentOptions {
  organisationId?: string;
  organisationName?: string;
  creatorId?: string;
  creatorName?: string;
  leadId?: string;
  leadName?: string;
  subStreamId?: string;
  subStreamName?: string;
  substreamId?: string;
  substreamName?: string;
  parentStreamId?: string;
  parentStreamName?: string;
  onSuccess?: () => void;
}

export function useAddDepartment(options?: UseAddDepartmentOptions) {
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

  const form = useForm<AddDepartmentFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<AddDepartmentFormData> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      const payload: CreateStreamPayload = {
        name: data.name.trim(),
        description: data.description.trim(),
        organisationId: currentOrgId,
        creatorId: currentCreatorId,
        leadId: options?.leadId,
        subStreamId: options?.subStreamId || options?.substreamId,
        parentStreamId: options?.parentStreamId,
        type: "department",
      };

      const response = await streamService.createDepartment(payload);

      if (response.success) {
        setIsSuccess(true);
        form.reset();
        options?.onSuccess?.();
      } else {
        setServerError(response.message || "Failed to create department.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create department.";
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

export default useAddDepartment;
