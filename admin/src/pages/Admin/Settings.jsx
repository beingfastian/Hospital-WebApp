import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaWhatsapp, FaEnvelope, FaBell, FaSave, FaCheck, FaTimes, FaCog, FaServer, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [settings, setSettings] = useState({
    whatsappEnabled: false,
    emailEnabled: true,
    twilioConfigured: false,
    emailConfigured: false,
    defaultReminderTime: 24,
    autoReminders: false
  });
  const [loading, setLoading] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  const loadSettings = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/notification-settings', {
        headers: { aToken }
      });
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/notification-settings',
        settings,
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testWhatsApp = async () => {
    setTestingWhatsApp(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/test-whatsapp',
        {},
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success('Test WhatsApp message sent successfully!');
      } else {
        toast.error('WhatsApp test failed: ' + data.message);
      }
    } catch (error) {
      toast.error('WhatsApp test failed');
    } finally {
      setTestingWhatsApp(false);
    }
  };

  useEffect(() => {
    if (aToken) {
      loadSettings();
    }
  }, [aToken]);

  const SettingCard = ({ icon, title, description, children, status }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {status && (
            <div className="flex items-center gap-2">
              {status.configured ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <FaCheck className="w-4 h-4" />
                  Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                  <FaTimes className="w-4 h-4" />
                  Not Configured
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure notification preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Configuration */}
        <SettingCard
          icon={<FaWhatsapp className="text-2xl text-green-500" />}
          title="WhatsApp Notifications"
          description="Powered by Twilio WhatsApp Business API"
          status={{ configured: settings.twilioConfigured }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable WhatsApp Notifications</p>
                <p className="text-sm text-gray-500 mt-1">Send appointment confirmations via WhatsApp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsappEnabled}
                  onChange={(e) => setSettings({...settings, whatsappEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            
            {settings.whatsappEnabled && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={testWhatsApp}
                    disabled={testingWhatsApp}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testingWhatsApp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Testing...
                      </>
                    ) : (
                      "Test WhatsApp Connection"
                    )}
                  </button>
                  
                  {settings.twilioConfigured && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FaCheck className="w-4 h-4" />
                      <span>API Connected</span>
                    </div>
                  )}
                </div>
                
                {!settings.twilioConfigured && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Configuration Required:</strong> Please configure your Twilio WhatsApp Business API credentials in the environment settings.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SettingCard>

        {/* Email Configuration */}
        <SettingCard
          icon={<FaEnvelope className="text-2xl text-blue-500" />}
          title="Email Notifications"
          description="SMTP email notifications for appointments"
          status={{ configured: settings.emailConfigured }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Email Notifications</p>
                <p className="text-sm text-gray-500 mt-1">Send appointment confirmations via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailEnabled}
                  onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {!settings.emailConfigured && settings.emailEnabled && (
              <div className="pt-4 border-t border-gray-200">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Configuration Required:</strong> Please configure your SMTP email settings in the environment configuration.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SettingCard>

        {/* Reminder Settings */}
        <SettingCard
          icon={<FaBell className="text-2xl text-yellow-500" />}
          title="Appointment Reminders"
          description="Automatic reminder notifications before appointments"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Auto Reminders</p>
                <p className="text-sm text-gray-500 mt-1">Send automatic reminders before appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoReminders}
                  onChange={(e) => setSettings({...settings, autoReminders: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
            
            {settings.autoReminders && (
              <div className="pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Time (hours before appointment)
                  </label>
                  <select
                    value={settings.defaultReminderTime}
                    onChange={(e) => setSettings({...settings, defaultReminderTime: parseInt(e.target.value)})}
                    className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={4}>4 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Reminders will be sent automatically {settings.defaultReminderTime} hour(s) before each appointment
                  </p>
                </div>
              </div>
            )}
          </div>
        </SettingCard>

        {/* System Information */}
        <SettingCard
          icon={<FaServer className="text-2xl text-purple-500" />}
          title="System Information"
          description="Current system status and configuration"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Application Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Database Connection</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Version</p>
                <p className="text-sm text-gray-600 mt-1">v2.1.0</p>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* Save Settings */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <FaSave />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;