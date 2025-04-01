import { SignUp } from "@clerk/nextjs";
import Head from "next/head";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Sign Up - Werkout.in</title>
        <meta name="description" content="Create your Werkout.in account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20">
        <div className="flex flex-col items-center justify-center rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Join Werkout.in</h1>
          <p className="text-center text-gray-600 mb-8">
            Create an account to find or offer fitness services
          </p>
          <div className="w-full sm:w-96">
            <SignUp 
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              redirectUrl="/onboarding"
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