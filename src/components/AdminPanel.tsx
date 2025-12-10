import React from 'react';
import { Shield, Check, Settings, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  // Show for all admins
  if (user?.role !== 'admin' || !user?.approved) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <p className="text-sm opacity-90 mt-1">Tournament administration controls</p>
      </div>

      <div className="p-6 space-y-6">
        {/* System Status */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">System Status</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-green-50/50">
              <div>
                <p className="font-medium text-slate-800">Admin Access</p>
                <p className="text-xs text-slate-500">Full tournament control enabled</p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-blue-50/50">
              <div>
                <p className="font-medium text-slate-800">Tournament Database</p>
                <p className="text-xs text-slate-500">Teams, matches, and settings</p>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-800">Account Info</h3>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Email:</strong> {user?.email}<br/>
              <strong>Role:</strong> {user?.role}<br/>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-700">
            <strong>Note:</strong> User roles are managed through the Supabase database. 
            Contact the database administrator to modify user permissions.
          </p>
        </div>
      </div>
    </div>
  );
};
