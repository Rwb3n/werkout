import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function WorkoutDetail() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { id } = router.query;
  
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    workoutType: '',
    duration: 0,
    intensityLevel: '',
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
    if (isSignedIn && id) {
      fetchWorkout();
    }
  }, [isSignedIn, id]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const token = await user.getToken();
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile/workouts/${id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const workoutData = response.data.data;
      setWorkout(workoutData);
      setFormData({
        workoutType: workoutData.workoutType || '',
        duration: workoutData.duration || 0,
        intensityLevel: workoutData.intensityLevel || '',
        notes: workoutData.notes || '',
        metrics: {
          distance: workoutData.metrics?.distance || '',
          sets: workoutData.metrics?.sets || '',
          reps: workoutData.metrics?.reps || '',
          weight: workoutData.metrics?.weight || '',
          caloriesBurned: workoutData.metrics?.caloriesBurned || ''
        },
        isPublic: workoutData.isPublic || false
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout:", err);
      setError("Failed to fetch workout details");
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
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/seekers/profile/workouts/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Exit edit mode and refresh data
      setEditing(false);
      fetchWorkout();
    } catch (err) {
      console.error("Error updating workout:", err);
      setError("Failed to update workout");
    }
  };

  const handleDeleteWorkout = async () => {
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
        
        router.push('/workouts');
      } catch (err) {
        console.error("Error deleting workout:", err);
        setError("Failed to delete workout");
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
        <title>Workout Details - Werkout.in</title>
        <meta name="description" content="View and edit your workout details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workout Details</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/workouts')}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Workouts
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
                fetchWorkout();
              }}
              className="mt-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg py-8">
            <p className="text-center">Loading workout details...</p>
          </div>
        ) : workout ? (
          <>
            {editing ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Edit Workout</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Update your workout details below
                    </p>
                  </div>
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
                          onClick={() => setEditing(false)}
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
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{workout.workoutType} Workout</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {formatDate(workout.date)}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteWorkout}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Workout Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 capitalize">{workout.workoutType}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{workout.duration} minutes</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Intensity Level</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${workout.intensityLevel === 'low' ? 'bg-green-100 text-green-800' : 
                            workout.intensityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            workout.intensityLevel === 'high' ? 'bg-red-100 text-red-800' : 
                            'bg-purple-100 text-purple-800'}`}>
                          {workout.intensityLevel}
                        </span>
                      </dd>
                    </div>
                    
                    {workout.metrics && Object.keys(workout.metrics).length > 0 && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Metrics</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                          <ul className="divide-y divide-gray-200">
                            {workout.metrics.sets && (
                              <li className="py-2">
                                <span className="font-medium">Sets:</span> {workout.metrics.sets}
                              </li>
                            )}
                            {workout.metrics.reps && (
                              <li className="py-2">
                                <span className="font-medium">Reps:</span> {workout.metrics.reps}
                              </li>
                            )}
                            {workout.metrics.weight && (
                              <li className="py-2">
                                <span className="font-medium">Weight:</span> {workout.metrics.weight} kg
                              </li>
                            )}
                            {workout.metrics.distance && (
                              <li className="py-2">
                                <span className="font-medium">Distance:</span> {workout.metrics.distance} km
                              </li>
                            )}
                            {workout.metrics.caloriesBurned && (
                              <li className="py-2">
                                <span className="font-medium">Calories Burned:</span> {workout.metrics.caloriesBurned}
                              </li>
                            )}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    {workout.notes && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{workout.notes}</dd>
                      </div>
                    )}
                    
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {workout.isPublic ? 'Public (visible on your profile)' : 'Private (only visible to you)'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workout not found</h3>
            <p className="text-gray-500 mb-4">The workout you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/workouts')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Workouts
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 