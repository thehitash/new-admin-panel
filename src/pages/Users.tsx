// src/pages/Users.tsx
import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import type { AppUser } from '../types';

// centralized API functions (adjust path if needed)
import {
  getDriversManagers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive
} from '../utils/apis';

const Users: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const roleParam = roleFilter === 'all' ? undefined : (roleFilter as 'driver' | 'manager');
      const json = await getDriversManagers(roleParam);

      if (json && (json.success || json.users || Array.isArray(json))) {
        const arr = json.users ?? (Array.isArray(json) ? json : []);
        // filter out admin users
        const filtered = arr.filter((u: AppUser) => u.role !== 'admin');
        setUsers(filtered);
      } else {
        setError(json?.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('loadUsers error', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      const json = await toggleUserActive(userId);
      if (json && (json.success || json.user)) {
        const updated = json.user ?? json;
        if (updated.role === 'admin') {
          setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
          setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
        }
      } else {
        alert(json?.message || 'Failed to toggle user status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to toggle user status');
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const json = await deleteUser(userId);
      if (json && (json.success || json.message === undefined)) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(json?.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    // using same User icon for manager/driver
    return User;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.contactNumber || '').includes(searchTerm) ||
      (user.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeUsers = users.filter(u => u.isActive).length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const driverCount = users.filter(u => u.role === 'driver').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="driver">Driver</option>
          </select>

          <button
            onClick={handleAddUser}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
          { label: 'Active Users', value: activeUsers, color: 'bg-green-500' },
          { label: 'Managers', value: managerCount, color: 'bg-purple-500' },
          { label: 'Drivers', value: driverCount, color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-2 h-8 rounded ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {loading && <div className="p-6 text-center">Loading...</div>}
          {error && <div className="p-6 text-center text-red-600">{error}</div>}
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{user.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.contactNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900 max-w-32 truncate">{user.address}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="w-4 h-4 text-gray-500" />
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-sm font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleViewUser(user)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEditUser(user)} className="p-1 text-gray-500 hover:text-green-600 transition-colors" title="Edit User"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleActive(user.id)} className="p-1 text-gray-500 hover:text-purple-600 transition-colors" title={`${user.isActive ? 'Deactivate' : 'Activate'} User`}>
                          {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
            setIsEditing(false);
          }}
          title={isEditing ? (selectedUser ? 'Edit User' : 'Add New User') : 'User Details'}
          size="lg"
        >
          {isEditing ? (
            <UserForm
              user={selectedUser}
              onClose={() => {
                setShowModal(false);
                setSelectedUser(null);
                setIsEditing(false);
              }}
              onSave={async (userData, password) => {
                try {
                  if (selectedUser) {
                    // Update user
                    // include password only if provided (optional password change)
                    const payload = { ...userData } as any;
                    if (password) payload.password = password;
                    const json = await updateUser(selectedUser.id, payload);
                    if (json && (json.success || json.user)) {
                      const updated = json.user ?? json;
                      if (updated.role === 'admin') {
                        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                      } else {
                        setUsers(prev => prev.map(u => (u.id === selectedUser.id ? updated : u)));
                      }
                    } else {
                      alert(json?.message || 'Failed to update user');
                      return;
                    }
                  } else {
                    // Create user (password required)
                    if (!userData.password && !userData.password === undefined) {
                      // ensure password present — but the form enforces it
                    }
                    const payload: any = { ...userData };
                    if (userData.password) payload.password = userData.password;
                    const json = await createUser(payload);
                    if (json && (json.success || json.user)) {
                      const created = json.user ?? json;
                      if (created.role !== 'admin') {
                        setUsers(prev => [created, ...prev]);
                      }
                    } else {
                      alert(json?.message || 'Failed to create user');
                      return;
                    }
                  }

                  setShowModal(false);
                  setSelectedUser(null);
                  setIsEditing(false);
                } catch (err) {
                  console.error(err);
                  alert('Failed to save user');
                }
              }}
            />
          ) : selectedUser ? (
            <UserDetails user={selectedUser} />
          ) : null}
        </Modal>
      )}
    </div>
  );
};

/* ----------------------
   UserForm & UserDetails
   (Password: required when creating, optional when editing)
   ---------------------- */

const UserForm: React.FC<{
  user: AppUser | null;
  onClose: () => void;
  onSave: (data: Omit<AppUser, 'id' | 'createdAt' | 'password'> & { password?: string }, password?: string) => void | Promise<void>;
}> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber,
    email: user?.email || '',
    address: user?.address || '',
    role: (user?.role as 'manager' | 'driver') || 'driver',
    isActive: user?.isActive ?? true
  });

  // password handling: required for create, optional for edit
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!formData.name || !formData.email) {
      alert('Please fill required fields');
      return;
    }

    if (!user) {
      // creating: password required
      if (!password || password.length < 6) {
        alert('Please provide a password with at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
    } else {
      // editing: if password provided, validate it
      if (password) {
        if (password.length < 6) {
          alert('If changing password, it must be at least 6 characters.');
          return;
        }
        if (password !== confirmPassword) {
          alert('Passwords do not match.');
          return;
        }
      }
    }

    // onSave receives form data and password separately for clarity
    void onSave({
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      address: formData.address,
      role: formData.role,
      isActive: formData.isActive,
      // include password in data for creation convenience — handler will also accept separate password param
      ...(password ? { password } : {}),
    }, password || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+44 7700 900123"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'manager' | 'driver' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {/* Admin option intentionally removed */}
            <option value="manager">Manager</option>
            <option value="driver">Driver</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter full address..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password: required when creating; optional when editing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {user ? 'Change Password (optional)' : 'Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={user ? 'Leave empty to keep current password' : 'Enter password (min 6 chars)'}
            minLength={user ? 0 : 6}
            {...(user ? {} : { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={user ? 'Confirm new password (optional)' : 'Confirm password'}
            {...(user ? {} : { required: true })}
          />
        </div>
      </div>

      <div className="flex items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Active User</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {user ? 'Update User' : 'Add User'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const UserDetails: React.FC<{ user: AppUser }> = ({ user }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RoleIcon = User;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xl font-medium text-gray-600">{user.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <RoleIcon className="w-4 h-4 text-gray-500" />
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{user.contactNumber}</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-900">{user.address}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">Created {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-900">{user.isActive ? 'Active Account' : 'Inactive Account'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
        <div className="text-sm text-gray-600">
          {user.role === 'manager' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Manage rides and driver assignments</li>
              <li>View customer information and history</li>
              <li>Generate operational reports</li>
              <li>Handle customer support issues</li>
            </ul>
          )}
          {user.role === 'driver' && (
            <ul className="list-disc list-inside space-y-1">
              <li>View assigned rides and customer details</li>
              <li>Update ride status and location</li>
              <li>Access driver mobile application</li>
              <li>View personal earnings and statistics</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
