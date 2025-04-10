"use client";

import React from 'react';
// Import the new form orchestrator components
import { SeekerWizardForm } from "./SeekerWizardForm";
import { ProviderWizardForm } from "./ProviderWizardForm";
// Import types (might still be needed for onComplete prop type)
import type { SeekerWizardData, ProviderWizardData } from "@/lib/validations/profileWizard";

interface ProfileWizardProps {
  userType: 'seeker' | 'provider';
  onComplete: (data: SeekerWizardData | ProviderWizardData) => void;
}

export function ProfileWizard({ userType, onComplete }: ProfileWizardProps) {

  // Conditionally render the appropriate form orchestrator
  if (userType === 'seeker') {
    return <SeekerWizardForm onComplete={onComplete as (data: SeekerWizardData) => void} />;
  }

  if (userType === 'provider') {
    return <ProviderWizardForm onComplete={onComplete as (data: ProviderWizardData) => void} />;
  }

  // Handle invalid userType case if necessary
  return <div>Invalid user type specified.</div>;
} 