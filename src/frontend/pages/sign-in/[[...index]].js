import { SignIn } from "@clerk/nextjs";
import Head from "next/head";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Sign In - Werkout.in</title>
        <meta name="description" content="Sign in to your Werkout.in account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20">
        <div className="flex flex-col items-center justify-center rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Welcome Back to Werkout.in</h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to connect with fitness professionals in your area
          </p>
          <div className="w-full sm:w-96">
            <SignIn 
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  footerActionLink: "text-blue-600 hover:text-blue-700"
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 