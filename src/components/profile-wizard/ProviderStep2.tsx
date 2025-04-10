"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@heroicons/react/24/outline"; // Example icon

export function ProviderStep2() {
  const form = useFormContext(); 
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "credentials", // Name matches the Zod schema field
  });

  const addCredential = () => {
    // Append a new credential object with default values
    append({ title: "", organization: "", year: undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Credentials & Certifications</h3>
        <p className="text-sm text-muted-foreground">
          List any relevant certifications or qualifications.
        </p>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-4 border-b pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
            <FormField
              control={form.control}
              name={`credentials.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Certified Personal Trainer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`credentials.${index}.organization`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., NASM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name={`credentials.${index}.year`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2020" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(index)} // Remove button for each item
          >
             <TrashIcon className="h-4 w-4" />
             <span className="sr-only">Remove Credential</span>
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCredential} // Button to add a new credential
      >
        Add Credential
      </Button>
    </div>
  );
} 