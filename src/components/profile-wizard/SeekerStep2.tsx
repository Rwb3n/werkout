"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
// TODO: Consider using a location autocomplete component (e.g., Google Places Autocomplete)

export function SeekerStep2() {
  const form = useFormContext(); 

  return (
    <div className="space-y-4">
       <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input placeholder="e.g., London" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State / Province</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Ontario" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Canada" {...field} />
            </FormControl>
             <FormDescription>
               This helps us find providers near you.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
        {/* TODO: Add fields for postal code, address, map selection if needed */}
    </div>
  );
} 