import React, { useState } from 'react';
import Header from '@/components/Header';
import MedicationForm from '@/components/MedicationForm';
import MedicationList from '@/components/MedicationList';
import WeeklyAdherenceChart from '@/components/WeeklyAdherenceChart';
import UpcomingReminders from '@/components/UpcomingReminders';
import Notifications from '@/components/Notifications';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('medications');

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tabs */}
        <div className="mb-8 border-b border-neutral-200">
          <div className="flex space-x-8">
            <button 
              className={`pb-4 px-1 font-medium ${
                activeTab === 'medications' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-neutral-300 hover:text-neutral-400'
              }`}
              onClick={() => setActiveTab('medications')}
            >
              Medications
            </button>
            <button 
              className={`pb-4 px-1 font-medium ${
                activeTab === 'history' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-neutral-300 hover:text-neutral-400'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button 
              className={`pb-4 px-1 font-medium ${
                activeTab === 'settings' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-neutral-300 hover:text-neutral-400'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === 'medications' && (
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:col-span-1">
              <MedicationForm />
              <MedicationList />
            </div>
            
            <div className="lg:col-span-1 mt-6 lg:mt-0">
              <WeeklyAdherenceChart />
              <UpcomingReminders />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-neutral-500 mb-4">Medication History</h2>
            <p className="text-neutral-400">View your medication history here. This feature is coming soon.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-neutral-500 mb-4">Settings</h2>
            <p className="text-neutral-400">Adjust your preferences and settings here. This feature is coming soon.</p>
          </div>
        )}
      </main>

      <Notifications />
    </div>
  );
};

export default Home;
