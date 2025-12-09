import React, { useState, useMemo, useEffect } from 'react';
import { Plus, LayoutDashboard, FileSpreadsheet, Users, CheckCircle, XCircle, Download } from 'lucide-react';
import { BeneficiaryRecord, ValidationStatus } from './types';
import { RecordList } from './components/RecordList';
import { EntryForm } from './components/EntryForm';
import { StatsCard } from './components/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function App() {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  
  // Initialize state from LocalStorage if available
  const [records, setRecords] = useState<BeneficiaryRecord[]>(() => {
    const saved = localStorage.getItem('beneficiary_records');
    if (saved) {
      return JSON.parse(saved);
    }
    return [{
      id: '1',
      serialNumber: '001',
      blockName: 'BALAGARH',
      gpName: 'Haripur',
      village: 'Gokulnagar',
      beneficiaryId: 'WB-102030',
      beneficiaryName: 'Subhash Mondal',
      status: ValidationStatus.Eligible,
      remarks: '',
      superiorName: 'Amit Roy',
      superiorDesignation: 'BDO',
      superiorIdSrh: 'SRH-9988',
      timestamp: Date.now(),
    }];
  });

  // Save to LocalStorage whenever records change
  useEffect(() => {
    localStorage.setItem('beneficiary_records', JSON.stringify(records));
  }, [records]);

  const handleSave = (data: Omit<BeneficiaryRecord, 'id' | 'timestamp'>) => {
    const newRecord: BeneficiaryRecord = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setRecords(prev => [newRecord, ...prev]);
    setView('dashboard');
  };

  const handleExportCSV = () => {
    const headers = [
      'Serial Number', 
      'Block', 
      'GP', 
      'Village', 
      'Beneficiary ID', 
      'Name', 
      'Status', 
      'Remarks', 
      'Latitude', 
      'Longitude', 
      'Superior Name', 
      'Designation', 
      'Superior ID', 
      'Timestamp'
    ];
    
    const csvRows = [headers.join(',')];

    for (const row of records) {
      const values = [
        row.serialNumber,
        row.blockName,
        row.gpName,
        row.village,
        row.beneficiaryId,
        row.beneficiaryName,
        row.status,
        `"${row.remarks || ''}"`, // Quote remarks to handle commas
        row.latitude || '',
        row.longitude || '',
        row.superiorName,
        row.superiorDesignation,
        row.superiorIdSrh,
        new Date(row.timestamp).toLocaleString()
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `beneficiary_data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    return {
      total: records.length,
      eligible: records.filter(r => r.status === ValidationStatus.Eligible).length,
      ineligible: records.filter(r => r.status === ValidationStatus.Ineligible).length,
    };
  }, [records]);

  // Generate next serial number
  const nextSerialNumber = String(records.length + 1).padStart(3, '0');

  const pieData = [
    { name: 'Eligible', value: stats.eligible },
    { name: 'Ineligible', value: stats.ineligible },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-indigo-200" />
            <h1 className="text-xl font-bold tracking-tight">FieldSurvey <span className="font-normal text-indigo-200">Re-Checker</span></h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-xs text-indigo-200 hidden sm:block">
               v1.1.0 &bull; Local Storage Active
             </div>
             <button className="bg-indigo-800 p-2 rounded-full hover:bg-indigo-600 transition-colors">
               <Users className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500 mt-1">Overview of beneficiary re-superchecking status.</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                >
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Export to CSV
                </button>
                <button 
                  onClick={() => setView('form')}
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Record
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                title="Total Checked" 
                value={stats.total} 
                icon={LayoutDashboard} 
                colorClass="bg-blue-500 text-blue-500" 
              />
              <StatsCard 
                title="Found Eligible" 
                value={stats.eligible} 
                icon={CheckCircle} 
                colorClass="bg-green-500 text-green-500" 
              />
              <StatsCard 
                title="Ineligible" 
                value={stats.ineligible} 
                icon={XCircle} 
                colorClass="bg-red-500 text-red-500" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Table Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
                </div>
                <RecordList records={records} />
              </div>

              {/* Charts Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Eligibility Ratio</h3>
                <div className="h-64 w-full">
                  {stats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No data available
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    Eligible ({stats.total ? Math.round((stats.eligible / stats.total) * 100) : 0}%)
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    Ineligible ({stats.total ? Math.round((stats.ineligible / stats.total) * 100) : 0}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
             <EntryForm 
              onSave={handleSave} 
              onCancel={() => setView('dashboard')} 
              nextSerialNumber={nextSerialNumber}
             />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;