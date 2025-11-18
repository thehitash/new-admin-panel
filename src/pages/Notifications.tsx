import React, { useState } from 'react';
import {
  Send,
  Users,
  UserCheck,
  User,
  Bell,
  AlertCircle,
  CheckCircle,
  Megaphone,
  Mail,
  TestTube
} from 'lucide-react';
import {
  sendTestNotification,
  sendPromotionalNotification,
  sendNotificationToAll,
  sendNotificationToType,
  sendNotificationToUser,
  sendBulkNotification
} from '../utils/apis';

type NotificationType = 'test' | 'promotional' | 'broadcast' | 'targeted' | 'individual' | 'bulk';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotificationType>('promotional');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Promotional notification form
  const [promoTitle, setPromoTitle] = useState('');
  const [promoBody, setPromoBody] = useState('');
  const [promoUserType, setPromoUserType] = useState<'rider' | 'driver'>('rider');

  // Broadcast notification form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Targeted notification form
  const [targetedTitle, setTargetedTitle] = useState('');
  const [targetedBody, setTargetedBody] = useState('');
  const [targetedUserType, setTargetedUserType] = useState<'rider' | 'driver'>('rider');

  // Individual notification form
  const [individualUserId, setIndividualUserId] = useState('');
  const [individualTitle, setIndividualTitle] = useState('');
  const [individualBody, setIndividualBody] = useState('');

  // Bulk notification form
  const [bulkUserIds, setBulkUserIds] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkBody, setBulkBody] = useState('');

  const resetMessages = () => {
    setSuccess('');
    setError('');
  };

  const handleTestNotification = async () => {
    resetMessages();
    setLoading(true);

    try {
      const result = await sendTestNotification();
      setSuccess('Test notification sent successfully! Check your mobile device.');
      console.log('Test notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const result = await sendPromotionalNotification({
        title: promoTitle,
        body: promoBody,
        userType: promoUserType,
      });

      setSuccess(`Promotional notification sent successfully to ${promoUserType}s!`);
      setPromoTitle('');
      setPromoBody('');
      console.log('Promotional notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send promotional notification');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const result = await sendNotificationToAll({
        title: broadcastTitle,
        body: broadcastBody,
      });

      setSuccess('Broadcast notification sent to all users!');
      setBroadcastTitle('');
      setBroadcastBody('');
      console.log('Broadcast notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetedNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const result = await sendNotificationToType({
        userType: targetedUserType,
        title: targetedTitle,
        body: targetedBody,
      });

      setSuccess(`Targeted notification sent to all ${targetedUserType}s!`);
      setTargetedTitle('');
      setTargetedBody('');
      console.log('Targeted notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send targeted notification');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const result = await sendNotificationToUser({
        userId: individualUserId,
        title: individualTitle,
        body: individualBody,
      });

      setSuccess('Notification sent to individual user!');
      setIndividualUserId('');
      setIndividualTitle('');
      setIndividualBody('');
      console.log('Individual notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send individual notification');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const userIdsArray = bulkUserIds.split(',').map(id => id.trim()).filter(id => id);

      const result = await sendBulkNotification({
        userIds: userIdsArray,
        title: bulkTitle,
        body: bulkBody,
      });

      setSuccess(`Bulk notification sent to ${userIdsArray.length} users!`);
      setBulkUserIds('');
      setBulkTitle('');
      setBulkBody('');
      console.log('Bulk notification result:', result);
    } catch (err: any) {
      setError(err.message || 'Failed to send bulk notification');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'test', label: 'Test', icon: TestTube },
    { id: 'promotional', label: 'Promotional', icon: Megaphone },
    { id: 'broadcast', label: 'Broadcast', icon: Bell },
    { id: 'targeted', label: 'Targeted', icon: Users },
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'bulk', label: 'Bulk', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-600 mt-1">Send push notifications to riders and drivers</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NotificationType)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Test Notification Tab */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <TestTube className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Test Notification</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Send a test notification to yourself to verify the notification system is working.
                      You must be logged in on a mobile device with the app installed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestNotification}
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Test Notification</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Promotional Notification Tab */}
          {activeTab === 'promotional' && (
            <form onSubmit={handlePromotionalNotification} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Megaphone className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-800">Promotional Campaign</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Send special offers, discounts, or promotional messages to riders or drivers.
                      Example: "Book Now - 10% Off!"
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={promoUserType}
                  onChange={(e) => setPromoUserType(e.target.value as 'rider' | 'driver')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="rider">Riders</option>
                  <option value="driver">Drivers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="🎉 Special Offer - 10% Off!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{promoTitle.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={promoBody}
                  onChange={(e) => setPromoBody(e.target.value)}
                  placeholder="Use code SAVE10 to get 10% off your next ride. Valid until Sunday!"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{promoBody.length}/200 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Promotional Notification</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Broadcast Notification Tab */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleBroadcastNotification} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Broadcast to Everyone</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      Send important announcements to all users (both riders and drivers).
                      Example: Service updates, maintenance notifications.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="📢 Important Announcement"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{broadcastTitle.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="We're now available 24/7! Book rides anytime, day or night."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{broadcastBody.length}/200 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Broadcast to All Users</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Targeted Notification Tab */}
          {activeTab === 'targeted' && (
            <form onSubmit={handleTargetedNotification} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Targeted Notification</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Send notifications to a specific user type (all riders or all drivers).
                      Example: Driver bonuses, rider rewards.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetedUserType}
                  onChange={(e) => setTargetedUserType(e.target.value as 'rider' | 'driver')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="rider">All Riders</option>
                  <option value="driver">All Drivers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetedTitle}
                  onChange={(e) => setTargetedTitle(e.target.value)}
                  placeholder="💰 Bonus Opportunity!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{targetedTitle.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={targetedBody}
                  onChange={(e) => setTargetedBody(e.target.value)}
                  placeholder="Complete 20 rides this week and earn a £50 bonus!"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{targetedBody.length}/200 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send to {targetedUserType === 'rider' ? 'Riders' : 'Drivers'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Individual Notification Tab */}
          {activeTab === 'individual' && (
            <form onSubmit={handleIndividualNotification} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-indigo-800">Individual User</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                      Send a notification to a specific user by their user ID.
                      Example: Personal messages, account alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={individualUserId}
                  onChange={(e) => setIndividualUserId(e.target.value)}
                  placeholder="Enter user ID (e.g., 507f1f77bcf86cd799439011)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Find user ID in Customers or Drivers page</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={individualTitle}
                  onChange={(e) => setIndividualTitle(e.target.value)}
                  placeholder="Account Update"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{individualTitle.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={individualBody}
                  onChange={(e) => setIndividualBody(e.target.value)}
                  placeholder="Your account has been verified successfully."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{individualBody.length}/200 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send to User</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bulk Notification Tab */}
          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkNotification} className="space-y-4">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-pink-800">Bulk Notification</h3>
                    <p className="text-sm text-pink-700 mt-1">
                      Send notifications to multiple specific users at once.
                      Enter user IDs separated by commas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User IDs <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkUserIds}
                  onChange={(e) => setBulkUserIds(e.target.value)}
                  placeholder="Enter user IDs separated by commas&#10;Example: 507f1f77bcf86cd799439011, 507f191e810c19729de860ea, ..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkUserIds.split(',').filter(id => id.trim()).length} user(s) will receive this notification
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bulkTitle}
                  onChange={(e) => setBulkTitle(e.target.value)}
                  placeholder="Important Update"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{bulkTitle.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkBody}
                  onChange={(e) => setBulkBody(e.target.value)}
                  placeholder="You've been selected for our exclusive loyalty program!"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{bulkBody.length}/200 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Bulk Notification</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Effective Notifications</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Keep titles short and attention-grabbing (under 50 characters)</li>
          <li>Use emojis sparingly to add visual appeal</li>
          <li>Be clear and concise in your message (under 200 characters)</li>
          <li>Test notifications before sending to large audiences</li>
          <li>Send promotional messages during peak hours (7-9 AM, 5-7 PM)</li>
          <li>Avoid sending too many notifications to prevent user fatigue</li>
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
