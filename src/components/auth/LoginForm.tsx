"use client"; // Required for client-side interactions like form handling

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// z import removed as it was unused
// import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
// Use the new Form components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export function LoginForm() {
  // 1. Define form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define submit handler
  function onSubmit(values: LoginFormData) {
    // TODO: Connect to authentication context/API
    console.log("Login form values:", values);
    alert("Login Submitted (check console)"); // Placeholder
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}> {/* Wrap with Form Provider */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center">
                     <FormLabel>Password</FormLabel>
                     {/* TODO: Add Forgot Password link */}
                     {/* <a href="#" className="ml-auto inline-block text-sm underline">
                       Forgot your password?
                     </a> */}
                   </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
            {/* TODO: Add OAuth login buttons (Google, etc.) */}
            {/* <Button variant="outline" className="w-full">
              Login with Google
            </Button> */}
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          {/* TODO: Link to Signup page */}
          <a href="#" className="underline">
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  );
} 