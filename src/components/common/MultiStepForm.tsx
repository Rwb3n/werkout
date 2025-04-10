"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

// Define the shape of the data for each step
// Use specific types instead of 'any' if possible
interface StepData {
  [key: string]: any; 
}

interface Step {
  id: string;
  title: string;
  component: React.ElementType; // The component to render for this step
  // TODO: Add validation function or schema per step if needed
}

interface MultiStepFormProps {
  steps: Step[];
  onFinish: (data: StepData) => void;
  // Pass additional props needed by step components
  // e.g., form instance from react-hook-form if managing state centrally
  // stepProps?: Record<string, any>; 
  initialData?: StepData;
  // onSubmit: (data: StepData) => void;
}

export function MultiStepForm({ steps, onFinish }: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // const [formData, setFormData] = useState<StepData>(initialData);

  const CurrentStepComponent = steps[currentStepIndex].component;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // const updateFormData = useCallback((data: Partial<StepData>) => {
  //   setFormData(prev => ({ ...prev, ...data }));
  // }, []);

  const goToNext = () => {
    // TODO: Add validation check before proceeding
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto"> {/* Adjust max-width as needed */}
      <CardHeader>
        <CardTitle>{steps[currentStepIndex].title}</CardTitle>
        {/* Optional: Add step indicator (e.g., 1 of 3) */}
        <span className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </CardHeader>
      <CardContent>
        {/* Render the component for the current step */}
        <CurrentStepComponent /* updateFormData={updateFormData} formData={formData} */ />
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isFirstStep && (
          <Button variant="outline" onClick={goToPrevious} disabled={isFirstStep}>
            Previous
          </Button>
        )}
        {/* Spacer to push the Next/Finish button to the right if Previous is hidden */}
        {isFirstStep && <div />}
        <Button onClick={isLastStep ? () => onFinish({}) : goToNext}>
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
} 