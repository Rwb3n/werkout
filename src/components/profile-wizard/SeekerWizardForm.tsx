"use client";

import React from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";

import { MultiStepForm } from "@/components/common/MultiStepForm";
// Import step components
import { SeekerStep1 } from "./SeekerStep1";
import { SeekerStep2 } from "./SeekerStep2";
import { SeekerStep3 } from "./SeekerStep3";
// Import Zod schemas and types
import { seekerWizardSchema, type SeekerWizardData } from "@/lib/validations/profileWizard";

interface SeekerWizardFormProps {
  onComplete: (data: SeekerWizardData) => void;
}

export function SeekerWizardForm({ onComplete }: SeekerWizardFormProps) {

  const seekerSteps = [
    { id: 'seeker-step-1', title: 'Goals & Interests', component: SeekerStep1 },
    { id: 'seeker-step-2', title: 'Your Location', component: SeekerStep2 },
    { id: 'seeker-step-3', title: 'Contact Preferences', component: SeekerStep3 },
  ];

  const form = useForm<SeekerWizardData>({
    // Use type assertion to bypass the type mismatch
    resolver: zodResolver(seekerWizardSchema) as Resolver<SeekerWizardData>,
    defaultValues: { 
      level: undefined,
      goals: [],
      interests: [],
      city: '',
      state: '',
      country: '',
      // Default values for contact preferences
      contactEmail: true, 
      contactWhatsapp: false,
      contactPhone: false,
    },
  });

  // Handle final submission, including cross-field validation
  const handleFinish = () => {
    form.handleSubmit((data) => {
      // Validation for flattened contact prefs
      if (!data.contactEmail && !data.contactPhone && !data.contactWhatsapp) {
          form.setError("contactEmail", { // Assign error to one field
              type: "manual", 
              message: "Please select at least one contact method" 
          });
          return; // Stop submission
      }
      console.log("Seeker Wizard finished:", data);
      // TODO: Potentially re-structure data before calling onComplete 
      // if the backend expects a nested contactPreferences object
      onComplete(data);
    })();
  };

  // Adapter function to match the expected signature for MultiStepForm
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onFinishAdapter = (_unused: Record<string, unknown>) => {
    handleFinish();
  };

  return (
    <FormProvider {...form}>
      <MultiStepForm 
        steps={seekerSteps} 
        onFinish={onFinishAdapter} 
      />
    </FormProvider>
  );
} 