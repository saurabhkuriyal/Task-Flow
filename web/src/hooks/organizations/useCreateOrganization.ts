"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { organizationService } from "@/services/organization.service";
import { ROUTES } from "@/constants/routes";
import type { OrganizationFormValues, CreateOrganizationPayload } from "@/types/organization";

export function useCreateOrganization() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<OrganizationFormValues>({
    defaultValues: {
      companyName: "",
      gstNumber: "",
      yearOfEstablishment: "",
      noOfPeople: "",
      mrr: "",
      arr: "",
      isAgreed: false,
    },
    mode: "onBlur",
  });

  const { watch, setValue } = form;
  const currentMrr = watch("mrr");

  // Helpful auto-suggest: if ARR is untouched/empty and MRR is entered, pre-fill ARR = MRR * 12
  React.useEffect(() => {
    const numericMrr = Number(currentMrr);
    const currentArr = form.getValues("arr");
    if (!isNaN(numericMrr) && numericMrr > 0 && (!currentArr || Number(currentArr) === 0)) {
      setValue("arr", numericMrr * 12, { shouldValidate: false });
    }
  }, [currentMrr, setValue, form]);

  const onSubmit: SubmitHandler<OrganizationFormValues> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload: CreateOrganizationPayload = {
        name: data.companyName.trim(),
        gstNumber: data.gstNumber.trim().toUpperCase(),
        yearOfEstablishment: Number(data.yearOfEstablishment),
        noOfPeople: Number(data.noOfPeople),
        mrr: Number(data.mrr) || 0,
        arr: Number(data.arr) || 0,
        isAgreed: Boolean(data.isAgreed),
      };

      const response = await organizationService.createOrganization(payload);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/workspaces");
        }, 1200);
      } else {
        setServerError(response.message || "Failed to create organization.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred while creating organization.");
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

export default useCreateOrganization;

