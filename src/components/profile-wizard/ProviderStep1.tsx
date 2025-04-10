"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea"; // Assuming Textarea exists or will be created
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Checkbox } from "@/components/ui/Checkbox"; // Example for multi-select
// TODO: Consider a proper TagInput or MultiSelect component for specialties/languages

// Assuming form state is managed by a parent provider via useFormContext
// Also assuming the Zod schema for the entire wizard is used

// TODO: Fetch/define actual lists
const PROVIDER_TYPES = ["trainer", "coach", "group_leader", "gym", "studio"];
const SPECIALTIES = ["personal_training", "group_fitness", "nutrition", "strength_conditioning", "yoga", "pilates"];
const LANGUAGES = ["english", "spanish", "french", "german"]; // Example languages

export function ProviderStep1() {
  const form = useFormContext(); // Get form instance from context

  return (
    <div className="space-y-6">
      {/* Bio */}
      <FormField
        control={form.control}
        name="bio" // Name corresponds to Zod schema field
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio / About You</FormLabel>
            <FormControl>
              {/* TODO: Create Textarea component */}
              <Textarea
                placeholder="Tell us a little bit about yourself and your services..."
                className="resize-none" // Optional: prevent resizing
                rows={4}
                {...field}
              />
            </FormControl>
            <FormDescription>
              This will be displayed on your public profile.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Provider Type */}
      <FormField
        control={form.control}
        name="providerType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Provider Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-4"
              >
                {PROVIDER_TYPES.map((type) => (
                  <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={type} />
                    </FormControl>
                    <FormLabel className="font-normal capitalize">
                      {type.replace("_", " ")}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Specialties (Example using Checkboxes) */}
       <FormField
        control={form.control}
        name="specialties"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Your Specialties</FormLabel>
              <FormDescription>
                Select all that apply.
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPECIALTIES.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="specialties"
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

       {/* Experience */}
      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience (Optional)</FormLabel>
            <FormControl>
              <Input type="number" min="0" placeholder="e.g., 5" {...field} onChange={event => field.onChange(+event.target.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Languages (Optional, example using Checkboxes) */}
       <FormField
        control={form.control}
        name="languages"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Languages Spoken (Optional)</FormLabel>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {LANGUAGES.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="languages"
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
                           {item}
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