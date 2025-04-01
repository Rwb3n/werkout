import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Workouts() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    workoutType: 'strength',
    duration: 30,
    intensityLevel: 'medium',
    notes: '',
    metrics: {
      distance: '',
      sets: '',
      reps: '',
      weight: '',
      caloriesBurned: ''
    },
    isPublic: false
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchWorkouts();
    }
  }, [isSignedIn]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const token = await user.getToken();
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile/workouts`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setWorkouts(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setError("Failed to fetch your workouts");
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('metrics.')) {
      const metricName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricName]: type === 'number' ? Number(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? Number(value) || '' : value
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty metrics
      const metrics = {};
      Object.entries(formData.metrics).forEach(([key, value]) => {
        if (value !== '') {
          metrics[key] = value;
        }
      });
      
      const token = await user.getToken();
      
      const payload = {
        ...formData,
        metrics
      };
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile/workouts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Reset form and fetch updated workouts
      setFormData({
        workoutType: 'strength',
        duration: 30,
        intensityLevel: 'medium',
        notes: '',
        metrics: {
          distance: '',
          sets: '',
          reps: '',
          weight: '',
          caloriesBurned: ''
        },
        isPublic: false
      });
      setShowForm(false);
      fetchWorkouts();
    } catch (err) {
      console.error("Error adding workout:", err);
      setError("Failed to add workout");
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      try {
        const token = await user.getToken();
        
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile/workouts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        fetchWorkouts();
      } catch (err) {
        console.error("Error deleting workout:", err);
        setError("Failed to delete workout");
      }
    }
  };

  const viewWorkout = (id) => {
    router.push(`/workouts/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isLoaded) {
    return <div>Loading user data...</div>;
  }

  if (!isSignedIn) {
    return <div>You need to be signed in to access this page.</div>;
  }

  // Helper function to render appropriate metrics based on workout type
  const renderMetricsForm = () => {
    switch(formData.workoutType) {
      case 'strength':
        return (
          <>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="metrics.sets" className="block text-sm font-medium text-gray-700">Sets</label>
              <input
                type="number"
                name="metrics.sets"
                id="metrics.sets"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.metrics.sets}
                onChange={handleFormChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="metrics.reps" className="block text-sm font-medium text-gray-700">Reps</label>
              <input
                type="number"
                name="metrics.reps"
                id="metrics.reps"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.metrics.reps}
                onChange={handleFormChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="metrics.weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="metrics.weight"
                id="metrics.weight"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.metrics.weight}
                onChange={handleFormChange}
              />
            </div>
          </>
        );
      case 'cardio':
        return (
          <>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="metrics.distance" className="block text-sm font-medium text-gray-700">Distance (km)</label>
              <input
                type="number"
                name="metrics.distance"
                id="metrics.distance"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.metrics.distance}
                onChange={handleFormChange}
                step="0.01"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Workout Tracker - Werkout.in</title>
        <meta name="description" content="Track your workouts with Werkout.in" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workout Tracker</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchWorkouts();
              }}
              className="mt-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Workouts</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showForm ? "Cancel" : "Add Workout"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Workout</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Fill out the details of your workout session.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="workoutType" className="block text-sm font-medium text-gray-700">Workout Type</label>
                    <select
                      id="workoutType"
                      name="workoutType"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.workoutType}
                      onChange={handleFormChange}
                    >
                      <option value="strength">Strength</option>
                      <option value="cardio">Cardio</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="sports">Sports</option>
                      <option value="crossfit">CrossFit</option>
                      <option value="hiit">HIIT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="intensityLevel" className="block text-sm font-medium text-gray-700">Intensity Level</label>
                    <select
                      id="intensityLevel"
                      name="intensityLevel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.intensityLevel}
                      onChange={handleFormChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="extreme">Extreme</option>
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.duration}
                      onChange={handleFormChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="metrics.caloriesBurned" className="block text-sm font-medium text-gray-700">Calories Burned</label>
                    <input
                      type="number"
                      name="metrics.caloriesBurned"
                      id="metrics.caloriesBurned"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.metrics.caloriesBurned}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  {/* Render workout-specific metrics */}
                  {renderMetricsForm()}
                  
                  <div className="col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.notes}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                  <div className="col-span-6">
                    <div className="flex items-center">
                      <input
                        id="isPublic"
                        name="isPublic"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.isPublic}
                        onChange={handleFormChange}
                      />
                      <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                        Make this workout public on your profile
                      </label>
                    </div>
                  </div>
                </div>
                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg py-8">
            <p className="text-center">Loading your workouts...</p>
          </div>
        ) : workouts.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intensity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workouts.map((workout) => (
                  <tr key={workout._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(workout.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {workout.workoutType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workout.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${workout.intensityLevel === 'low' ? 'bg-green-100 text-green-800' : 
                          workout.intensityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          workout.intensityLevel === 'high' ? 'bg-red-100 text-red-800' : 
                          'bg-purple-100 text-purple-800'}`}>
                        {workout.intensityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => viewWorkout(workout._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your fitness journey by adding your first workout.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Your First Workout
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 