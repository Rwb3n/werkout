import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch profile data if user is signed in
    if (isSignedIn) {
      fetchUserProfile();
    }
  }, [isSignedIn]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Get the token from Clerk
      const token = await user.getToken();
      
      // Make API request to backend
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setProfile(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch your profile data");
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading user data...</div>;
  }

  if (!isSignedIn) {
    return <div>You need to be signed in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Werkout.in</title>
        <meta name="description" content="Your Werkout.in dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/workouts')}
              className="text-gray-500 hover:text-gray-700"
            >
              Workout Tracker
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Welcome, {user.firstName || "User"}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your personal profile information and fitness journey.
            </p>
          </div>
          
          {loading ? (
            <div className="px-4 py-5 sm:p-6">
              <p>Loading your profile information...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-5 sm:p-6 text-red-600">
              <p>{error}</p>
              <button 
                onClick={fetchUserProfile}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          ) : profile ? (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Profile Completion</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {profile.completionScore || 0}%
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fitness Level</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {profile.fitnessLevel || "Not set"}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fitness Goals</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {profile.fitnessGoals?.length > 0 
                      ? profile.fitnessGoals.join(", ") 
                      : "No goals set yet"}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fitness Journey</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {profile.fitnessJourney?.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {profile.fitnessJourney.map((milestone, index) => (
                          <li key={index} className="py-2">
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-gray-600">{milestone.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No journey milestones recorded yet"
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Workout Tracking</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="mb-2 sm:mb-0 sm:mr-4">
                        {profile.workouts && profile.workouts.length > 0 
                          ? `You have logged ${profile.workouts.length} workouts` 
                          : "You haven't logged any workouts yet"}
                      </p>
                      <button
                        onClick={() => router.push('/workouts')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        {profile.workouts && profile.workouts.length > 0 
                          ? "View Workouts" 
                          : "Start Tracking"}
                      </button>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <p>No profile found. Create one to get started!</p>
              <button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => window.location.href = "/profile/create"}
              >
                Create Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 