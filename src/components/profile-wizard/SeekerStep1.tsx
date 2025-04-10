"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/Form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Checkbox } from "@/components/ui/Checkbox"; // Example for multi-select
// TODO: Consider a proper TagInput or MultiSelect component for goals/interests

// Assuming form state is managed by a parent provider via useFormContext
// Also assuming the Zod schema for the entire wizard is used

// TODO: Fetch/define actual lists
const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"];
const GOALS_INTERESTS = ["weight_loss", "muscle_gain", "cardio", "yoga", "pilates", "crossfit", "running"];

export function SeekerStep1() {
  const form = useFormContext(); // Get form instance from context

  return (
    <div className="space-y-6">
      {/* Fitness Level */}
      <FormField
        control={form.control}
        name="level" // Name corresponds to Zod schema field
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Your Fitness Level</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
              >
                {FITNESS_LEVELS.map((level) => (
                  <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={level} />
                    </FormControl>
                    <FormLabel className="font-normal capitalize">
                      {level}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Goals (Example using Checkboxes - Replace with better component) */}
      <FormField
        control={form.control}
        name="goals" // Name corresponds to Zod schema field
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Your Fitness Goals</FormLabel>
              <FormDescription>
                Select all that apply.
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GOALS_INTERESTS.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="goals"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value: string) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize">
                          {item.replace("_", " ")}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Interests (Similar structure to Goals - Replace with better component) */}
       <FormField
        control={form.control}
        name="interests" // Name corresponds to Zod schema field
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Your Interests</FormLabel>
              <FormDescription>
                Select activities you enjoy or want to try.
              </FormDescription>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GOALS_INTERESTS.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="interests"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value: string) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize">
                           {item.replace("_", " ")}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
} 