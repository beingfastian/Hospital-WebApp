import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaWhatsapp, FaEnvelope, FaBell, FaSave, FaCheck, FaTimes } from 'react-icons/fa';
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
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/test-whatsapp',
        {},
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success('Test WhatsApp message sent!');
      } else {
        toast.error('WhatsApp test failed: ' + data.message);
      }
    } catch (error) {
      toast.error('WhatsApp test failed');
    }
  };

  useEffect(() => {
    if (aToken) {
      loadSettings();
    }
  }, [aToken]);

  return (
    <div className='m-5 max-w-4xl'>
      <h1 className='text-2xl font-medium mb-5'>Notification Settings</h1>
      
      {/* WhatsApp Configuration */}
      <div className='bg-white rounded border p-6 mb-5'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <FaWhatsapp className='text-3xl text-green-500' />
            <div>
              <h2 className='text-lg font-semibold'>WhatsApp Notifications</h2>
              <p className='text-sm text-gray-600'>Powered by Twilio WhatsApp Business API</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {settings.twilioConfigured ? (
              <span className='flex items-center gap-1 text-green-600 text-sm'>
                <FaCheck /> Configured
              </span>
            ) : (
              <span className='flex items-center gap-1 text-red-600 text-sm'>
                <FaTimes /> Not Configured
              </span>
            )}
          </div>
        </div>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium'>Enable WhatsApp Notifications</p>
              <p className='text-sm text-gray-500'>Send appointment confirmations via WhatsApp</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={settings.whatsappEnabled}
                onChange={(e) => setSettings({...settings, whatsappEnabled: e.target.checked})}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          
          {settings.whatsappEnabled && (
            <div className='border-t pt-4'>
              <button
                onClick={testWhatsApp}
                className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
              >
                Test WhatsApp Connection
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Email Configuration */}
      <div className='bg-white rounded border p-6 mb-5'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <FaEnvelope className='text-3xl text-blue-500' />
            <div>
              <h2 className='text-lg font-semibold'>Email Notifications</h2>
              <p className='text-sm text-gray-600'>SMTP email notifications</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {settings.emailConfigured ? (
              <span className='flex items-center gap-1 text-green-600 text-sm'>
                <FaCheck /> Configured
              </span>
            ) : (
              <span className='flex items-center gap-1 text-red-600 text-sm'>
                <FaTimes /> Not Configured
              </span>
            )}
          </div>
        </div>
        
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>Enable Email Notifications</p>
            <p className='text-sm text-gray-500'>Send appointment confirmations via email</p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.emailEnabled}
              onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
      
      {/* Reminder Settings */}
      <div className='bg-white rounded border p-6 mb-5'>
        <div className='flex items-center gap-3 mb-4'>
          <FaBell className='text-3xl text-yellow-500' />
          <div>
            <h2 className='text-lg font-semibold'>Appointment Reminders</h2>
            <p className='text-sm text-gray-600'>Automatic reminder notifications</p>
          </div>
        </div>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium'>Enable Auto Reminders</p>
              <p className='text-sm text-gray-500'>Send automatic reminders before appointments</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={settings.autoReminders}
                onChange={(e) => setSettings({...settings, autoReminders: e.target.checked})}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          
          {settings.autoReminders && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Reminder Time (hours before appointment)
              </label>
              <select
                value={settings.defaultReminderTime}
                onChange={(e) => setSettings({...settings, defaultReminderTime: parseInt(e.target.value)})}
                className='border rounded px-3 py-2 w-full max-w-xs outline-primary'
              >
                <option value={1}>1 hour before</option>
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={12}>12 hours before</option>
                <option value={24}>24 hours before</option>
                <option value={48}>48 hours before</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className='flex justify-end'>
        <button
          onClick={saveSettings}
          disabled={loading}
          className='px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50'
        >
          {loading ? 'Saving...' : (
            <>
              <FaSave /> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;