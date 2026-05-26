import React, { useEffect, useState } from 'react';
import { db, addToQueue, getPending, removeFromQueue } from './db';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  const pakistaniJobs = [
    { id: 1, title: 'Punjab Electricity - Grid Repair', technician: 'Ahmed Khan', address: 'Lahore, Punjab', status: 'Completed', priority: 'High' },
    { id: 2, title: 'Sui Gas - Line Maintenance', technician: 'Muhammad Ali', address: 'Karachi, Sindh', status: 'Pending', priority: 'Normal' },
    { id: 3, title: 'PTCL - Cable Installation', technician: 'Saeed Ahmed', address: 'Islamabad', status: 'Completed', priority: 'Normal' },
    { id: 4, title: 'KElectric - Meter Setup', technician: 'Imran Hussain', address: 'Karachi', status: 'Pending', priority: 'High' },
    { id: 5, title: 'LESCO - Transformer Repair', technician: 'Bilal Sheikh', address: 'Lahore', status: 'Pending', priority: 'Normal' },
    { id: 6, title: 'WAPDA - Pole Replacement', technician: 'Rashid Latif', address: 'Multan', status: 'Completed', priority: 'High' },
    { id: 7, title: 'SSGC - Pipeline Fix', technician: 'Adnan Shah', address: 'Sialkot', status: 'Pending', priority: 'Normal' },
    { id: 8, title: 'GEPC - Generator Service', technician: 'Farhan Akram', address: 'Peshawar', status: 'Pending', priority: 'High' },
    { id: 9, title: 'QESCO - Power Line Check', technician: 'Javed Iqbal', address: 'Quetta', status: 'Completed', priority: 'Normal' },
    { id: 10, title: 'MEPCO - Substation Repair', technician: 'Nadeem Butt', address: 'Gujranwala', status: 'Pending', priority: 'Normal' },
  ];

  useEffect(() => {
    const init = async () => {
      const local = await db.jobs.toArray();
      if (local.length === 0) {
        await db.jobs.bulkAdd(pakistaniJobs);
        setJobs(pakistaniJobs);
      } else {
        setJobs(local);
      }
      
      const pending = await getPending();
      setSyncCount(pending.length);
      setLoading(false);
    };
    
    init();

    const handleOnline = async () => { 
      setIsOnline(true); 
      await processQueue();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt - 
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  // Install Button Click
  const handleInstall = async () => {
    if (!deferredPrompt) {
  
      alert('To install: Tap menu → Add to Home Screen');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  const processQueue = async () => {
    if (!navigator.onLine) return;
    const pending = await getPending();
    
    for (const item of pending) {
      await new Promise(r => setTimeout(r, 300));
      await removeFromQueue(item.id);
      
      if (Notification.permission === 'granted') {
        new Notification('Sync Complete', {
          body: `${item.action} synced`,
          icon: '/icon-192.png'
        });
      }
    }
    setSyncCount(0);
  };

  const handleComplete = async (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    
    const updated = { ...job, status: 'Completed' };
    setJobs(jobs.map(j => j.id === id ? updated : j));
    await db.jobs.put(updated);
    
    if (!isOnline) {
      await addToQueue('COMPLETE', updated);
      setSyncCount(c => c + 1);
      alert('Saved offline!');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    setJobs(jobs.filter(j => j.id !== id));
    await db.jobs.delete(id);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50">
      
      {/* HEADER */}
      <header className={`px-4 py-3 flex justify-between items-center text-white ${isOnline ? 'bg-blue-600' : 'bg-amber-600'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          <h1 className="font-bold text-lg">TEYZIX CORE</h1>
        </div>
        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded">
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </header>

      {/* INSTALL BUTTON  */}
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <div>
          <span className="text-sm">Install App to use offline</span>
        </div>
        <button onClick={handleInstall} className="bg-green-600 px-3 py-1 rounded text-sm font-medium">
          📥 Install
        </button>
      </div>

      {/* SYNC BANNER */}
      {syncCount > 0 && (
        <div onClick={processQueue} className="bg-indigo-600 text-white px-4 py-2 flex justify-between cursor-pointer">
          <span>🔄 {syncCount} pending</span>
          <span>SYNC →</span>
        </div>
      )}

      {/* JOBS LIST */}
      <main className="flex-1 p-4 space-y-3 pb-20">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Jobs (Pakistan)</h2>

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className={`bg-white p-4 rounded-xl shadow-sm ${job.priority === 'High' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job.status}
                </span>
                {job.priority === 'High' && job.status !== 'Completed' && <span className="text-xs text-red-600 font-bold">⚠️</span>}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{job.title}</h3>
              <p className="text-sm text-gray-500 mb-1">📍 {job.address}</p>
              <p className="text-sm text-gray-500 mb-3">👤 {job.technician}</p>
              
              <div className="flex gap-2">
                {job.status !== 'Completed' && (
                  <button onClick={() => handleComplete(job.id)} className={`flex-1 py-2 rounded-lg font-medium text-sm ${isOnline ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {isOnline ? 'Complete Job' : 'Save Offline'}
                  </button>
                )}
                <button onClick={() => handleDelete(job.id)} className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm">🗑️</button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;