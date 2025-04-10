"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/Form";
import { Checkbox } from "@/components/ui/Checkbox";

export function SeekerStep3() {
  const form = useFormContext(); 

  return (
    <div className="space-y-4">
       <FormField
        control={form.control}
        name="contactPreferences"
        // Render prop needed to handle the object structure / multiple fields
        render={() => (
            <FormItem>
                <div className="mb-4">
                    <FormLabel className="text-base">Contact Preferences</FormLabel>
                    <FormDescription>
                        How would you prefer providers to contact you? (Select at least one)
                    </FormDescription>
                </div>
                {/* Individual checkbox fields */}
                <FormField
                    control={form.control}
                    name="contactPreferences.email"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel className="font-normal">
                           Email (Recommended)
                        </FormLabel>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contactPreferences.whatsapp"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel className="font-normal">
                           WhatsApp
                        </FormLabel>
                        </FormItem>
                    )}
                 />
                <FormField
                    control={form.control}
                    name="contactPreferences.phone"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel className="font-normal">
                           Phone Call / SMS
                        </FormLabel>
                        </FormItem>
                    )}
                 />
                {/* Display the group validation error */}
                <FormMessage /> 
            </FormItem>
        )}
        />
    </div>
  );
} 