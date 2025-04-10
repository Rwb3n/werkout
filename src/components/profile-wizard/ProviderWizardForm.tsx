"use client";

import React from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { MultiStepForm } from "@/components/common/MultiStepForm";
// Import step components
import { ProviderStep1 } from "./ProviderStep1";
import { ProviderStep2 } from "./ProviderStep2";
import { ProviderStep3 } from "./ProviderStep3"; // Reuses SeekerStep2 for location
// Import Zod schemas and types
import { providerWizardSchema, type ProviderWizardData } from "@/lib/validations/profileWizard";

interface ProviderWizardFormProps {
  onComplete: (data: ProviderWizardData) => void;
}

export function ProviderWizardForm({ onComplete }: ProviderWizardFormProps) {

  const providerSteps = [
    { id: 'provider-step-1', title: 'About You', component: ProviderStep1 },
    { id: 'provider-step-2', title: 'Specialties & Services', component: ProviderStep2 },
    { id: 'provider-step-3', title: 'Your Location', component: ProviderStep3 },
  ];

  const form = useForm<ProviderWizardData>({
    resolver: zodResolver(providerWizardSchema),
    defaultValues: {
      bio: '',
      specialties: [],
      experience: undefined,
      languages: [],
      responseTime: undefined,
      providerType: undefined,
      services: [{ title: '', description: '', type: undefined }], // Initial service entry
      city: '',
      state: '',
      country: '',
    },
  });

  // Handle final submission
  const handleFinish = form.handleSubmit((data) => {
    // No complex cross-field validation needed here like seeker contact prefs
    console.log("Provider Wizard finished:", data);
    onComplete(data);
  });

  return (
    <FormProvider {...form}>
      <MultiStepForm 
        steps={providerSteps} 
        onFinish={handleFinish} 
      />
    </FormProvider>
  );
} 