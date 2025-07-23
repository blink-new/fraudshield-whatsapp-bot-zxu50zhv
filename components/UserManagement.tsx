import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { authAPI, type User } from '../services/AuthAPI';

interface UserManagementProps {
  visible: boolean;
  onClose: () => void;
}

export default function UserManagement({ visible, onClose }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const availablePermissions = [
    { key: 'verify_payments', label: 'Verify Payments', description: 'Can verify PoP and EFT payments' },
    { key: 'check_documents', label: 'Check Documents', description: 'Can validate RFQ/PO documents' },
    { key: 'generate_pins', label: 'Generate PINs', description: 'Can create release PINs for drivers' },
    { key: 'view_reports', label: 'View Reports', description: 'Can access activity logs and reports' },
    { key: 'manage_settings', label: 'Manage Settings', description: 'Can modify company settings' },
    { key: 'manage_users', label: 'Manage Users', description: 'Can invite and manage team members' }
  ];

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const companyUsers = await authAPI.getCompanyUsers();
      setUsers(companyUsers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.inviteUser(inviteEmail, 'staff');
      setInviteEmail('');
      setShowInviteModal(false);
      await loadUsers();
      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    setLoading(true);
    try {
      await authAPI.updateUserPermissions(userId, permissions);
      await loadUsers();
      setShowPermissionsModal(false);
      setSelectedUser(null);
      Alert.alert('Success', 'User permissions updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${userName}? They will lose access to FraudShield.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.deactivateUser(userId);
              await loadUsers();
              Alert.alert('Success', 'User deactivated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate user');
            }
          }
        }
      ]
    );
  };

  const renderUserCard = (user: User) => {
    const session = authAPI.getCurrentSession();
    const isCurrentUser = session?.user.id === user.id;
    const canManage = session?.user.role === 'owner' && !isCurrentUser;

    return (
      <View key={user.id} className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-semibold text-gray-900 mr-2">
                {user.firstName} {user.lastName}
              </Text>
              {isCurrentUser && (
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-blue-700 text-xs font-medium">You</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-600 mb-2">{user.email}</Text>
            
            <View className="flex-row items-center space-x-2">
              <View className={`px-2 py-1 rounded-full ${
                user.role === 'owner' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  user.role === 'owner' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {user.role === 'owner' ? '👑 Owner' : '👤 Staff'}
                </Text>
              </View>
              
              <View className={`px-2 py-1 rounded-full ${
                user.isActive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  user.isActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {user.isActive ? '✅ Active' : user.lastLogin ? '❌ Inactive' : '🕒 Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Permissions */}
        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-2">Permissions:</Text>
          <View className="flex-row flex-wrap">
            {user.permissions.length > 0 ? (
              user.permissions.map((permission) => (
                <View key={permission} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                  <Text className="text-xs text-gray-700">
                    {availablePermissions.find(p => p.key === permission)?.label || permission}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-xs text-gray-500 italic">No permissions assigned</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        {canManage && (
          <View className="flex-row space-x-2 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="flex-1 bg-blue-50 py-2 px-3 rounded-lg"
              onPress={() => {
                setSelectedUser(user);
                setShowPermissionsModal(true);
              }}
            >
              <Text className="text-blue-700 text-sm font-medium text-center">Edit Permissions</Text>
            </TouchableOpacity>
            
            {user.isActive && (
              <TouchableOpacity
                className="bg-red-50 py-2 px-3 rounded-lg"
                onPress={() => handleDeactivateUser(user.id, `${user.firstName} ${user.lastName}`)}
              >
                <Text className="text-red-700 text-sm font-medium">Deactivate</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Last Login */}
        {user.lastLogin && (
          <Text className="text-xs text-gray-500 mt-2">
            Last login: {new Date(user.lastLogin).toLocaleDateString()} at {new Date(user.lastLogin).toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  };

  const renderPermissionsModal = () => {
    if (!selectedUser) return null;

    const [tempPermissions, setTempPermissions] = useState<string[]>(selectedUser.permissions);

    const togglePermission = (permission: string) => {
      if (tempPermissions.includes(permission)) {
        setTempPermissions(tempPermissions.filter(p => p !== permission));
      } else {
        setTempPermissions([...tempPermissions, permission]);
      }
    };

    return (
      <Modal visible={showPermissionsModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => {
                setShowPermissionsModal(false);
                setSelectedUser(null);
              }}>
                <Text className="text-blue-600 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Edit Permissions</Text>
              <TouchableOpacity 
                onPress={() => handleUpdatePermissions(selectedUser.id, tempPermissions)}
                disabled={loading}
              >
                <Text className={`text-base font-medium ${loading ? 'text-gray-400' : 'text-blue-600'}`}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                {selectedUser.firstName} {selectedUser.lastName}
              </Text>
              <Text className="text-gray-600">{selectedUser.email}</Text>
            </View>

            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Available Permissions</Text>
              
              {availablePermissions.map((permission) => {
                const isSelected = tempPermissions.includes(permission.key);
                const isOwnerOnly = ['manage_users', 'manage_settings'].includes(permission.key);
                
                return (
                  <TouchableOpacity
                    key={permission.key}
                    className={`bg-white rounded-lg p-4 shadow-sm ${
                      isOwnerOnly ? 'opacity-50' : ''
                    }`}
                    onPress={() => !isOwnerOnly && togglePermission(permission.key)}
                    disabled={isOwnerOnly}
                  >
                    <View className="flex-row items-start">
                      <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${
                        isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Text className="text-white text-xs">✓</Text>}
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-base font-medium text-gray-900 mr-2">
                            {permission.label}
                          </Text>
                          {isOwnerOnly && (
                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                              <Text className="text-blue-700 text-xs font-medium">Owner Only</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-600 mt-1">
                          {permission.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 text-base">Done</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Team Management</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(true)}>
              <Text className="text-blue-600 text-base font-medium">Invite</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {loading && users.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-gray-500">Loading users...</Text>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Team Members ({users.length})
              </Text>
              
              {users.map(renderUserCard)}
              
              {users.length === 0 && (
                <View className="bg-gray-50 rounded-lg p-8 items-center">
                  <Text className="text-gray-500 text-center mb-4">No team members yet</Text>
                  <TouchableOpacity
                    className="bg-green-600 px-6 py-3 rounded-lg"
                    onPress={() => setShowInviteModal(true)}
                  >
                    <Text className="text-white font-medium">Invite Your First Team Member</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Invite User Modal */}
        <Modal visible={showInviteModal} animationType="slide" presentationStyle="pageSheet">
          <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}>
                  <Text className="text-blue-600 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Invite Team Member</Text>
                <TouchableOpacity onPress={handleInviteUser} disabled={loading}>
                  <Text className={`text-base font-medium ${loading ? 'text-gray-400' : 'text-blue-600'}`}>
                    {loading ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-4">
              <View className="bg-white rounded-lg p-4 shadow-sm">
                <Text className="text-base font-medium text-gray-900 mb-4">
                  Invite a new team member to your company
                </Text>
                
                <View className="mb-4">
                  <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="colleague@company.co.za"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View className="bg-blue-50 p-3 rounded-lg">
                  <Text className="text-blue-800 text-sm font-medium mb-1">What happens next?</Text>
                  <Text className="text-blue-700 text-sm">
                    • They'll receive an invitation email{'\n'}
                    • They can create their account and join your company{'\n'}
                    • You can assign permissions after they join
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Permissions Modal */}
        {renderPermissionsModal()}
      </View>
    </Modal>
  );
}