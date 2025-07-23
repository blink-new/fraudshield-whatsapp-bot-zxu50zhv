import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { authAPI, type Company, type BankAccount } from '../services/AuthAPI';

interface CompanyProfileProps {
  onClose: () => void;
}

export default function CompanyProfile({ onClose }: CompanyProfileProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'users'>('profile');
  const [showAddBank, setShowAddBank] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    registrationNumber: '',
    vatNumber: '',
    industry: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    website: ''
  });

  const [bankForm, setBankForm] = useState({
    bankName: 'FNB',
    accountNumber: '',
    accountType: 'business' as const,
    branchCode: '',
    isPrimary: false
  });

  const [users, setUsers] = useState<any[]>([]);

  const banks = ['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'African Bank', 'Investec'];
  const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'];

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    const session = authAPI.getCurrentSession();
    if (session) {
      setCompany(session.company);
      setProfileForm({
        name: session.company.name,
        registrationNumber: session.company.registrationNumber,
        vatNumber: session.company.vatNumber || '',
        industry: session.company.industry,
        street: session.company.address.street,
        city: session.company.address.city,
        province: session.company.address.province,
        postalCode: session.company.address.postalCode,
        phone: session.company.contactInfo.phone,
        email: session.company.contactInfo.email,
        website: session.company.contactInfo.website || ''
      });

      // Load users if owner
      if (session.user.role === 'owner') {
        try {
          const companyUsers = await authAPI.getCompanyUsers();
          setUsers(companyUsers);
        } catch (error) {
          console.error('Failed to load users:', error);
        }
      }
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const updates: Partial<Company> = {
        name: profileForm.name,
        vatNumber: profileForm.vatNumber,
        industry: profileForm.industry,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          province: profileForm.province,
          postalCode: profileForm.postalCode,
          country: 'South Africa'
        },
        contactInfo: {
          phone: profileForm.phone,
          email: profileForm.email,
          website: profileForm.website
        }
      };

      const updatedCompany = await authAPI.updateCompanyProfile(updates);
      setCompany(updatedCompany);
      Alert.alert('Success', 'Company profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!bankForm.accountNumber || !bankForm.branchCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await authAPI.addBankAccount({
        bankName: bankForm.bankName,
        accountNumber: bankForm.accountNumber,
        accountType: bankForm.accountType,
        branchCode: bankForm.branchCode,
        isActive: true,
        isPrimary: bankForm.isPrimary,
        verificationStatus: 'pending'
      });

      setBankForm({
        bankName: 'FNB',
        accountNumber: '',
        accountType: 'business',
        branchCode: '',
        isPrimary: false
      });
      setShowAddBank(false);
      await loadCompanyData();
      Alert.alert('Success', 'Bank account added successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBankAccount = async (accountId: string) => {
    Alert.alert(
      'Remove Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.removeBankAccount(accountId);
              await loadCompanyData();
              Alert.alert('Success', 'Bank account removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove bank account');
            }
          }
        }
      ]
    );
  };

  const renderProfileTab = () => (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Company Information</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Company Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.name}
                onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
              />
            </View>

            <View className="grid grid-cols-2 gap-4">
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Registration Number</Text>
                <TextInput
                  className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-600"
                  value={profileForm.registrationNumber}
                  editable={false}
                />
              </View>

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">VAT Number</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={profileForm.vatNumber}
                  onChangeText={(text) => setProfileForm({ ...profileForm, vatNumber: text })}
                  placeholder="Optional"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Industry</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.industry}
                onChangeText={(text) => setProfileForm({ ...profileForm, industry: text })}
              />
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Address</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Street Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.street}
                onChangeText={(text) => setProfileForm({ ...profileForm, street: text })}
                placeholder="123 Business Park Drive"
              />
            </View>

            <View className="grid grid-cols-2 gap-4">
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">City</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={profileForm.city}
                  onChangeText={(text) => setProfileForm({ ...profileForm, city: text })}
                  placeholder="Johannesburg"
                />
              </View>

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Postal Code</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={profileForm.postalCode}
                  onChangeText={(text) => setProfileForm({ ...profileForm, postalCode: text })}
                  placeholder="2001"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Province</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                <View className="flex-row space-x-2">
                  {provinces.map((province) => (
                    <TouchableOpacity
                      key={province}
                      className={`px-3 py-2 rounded-full border ${
                        profileForm.province === province
                          ? 'bg-green-100 border-green-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                      onPress={() => setProfileForm({ ...profileForm, province })}
                    >
                      <Text className={`text-sm ${
                        profileForm.province === province ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {province}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Phone Number</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.phone}
                onChangeText={(text) => setProfileForm({ ...profileForm, phone: text })}
                placeholder="+27 11 123 4567"
              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.email}
                onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
                placeholder="info@company.co.za"
              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">Website</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={profileForm.website}
                onChangeText={(text) => setProfileForm({ ...profileForm, website: text })}
                placeholder="https://company.co.za"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          className={`bg-green-600 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text className="text-white text-center text-base font-semibold">
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBankingTab = () => (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-900">Bank Accounts</Text>
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-lg"
            onPress={() => setShowAddBank(true)}
          >
            <Text className="text-white text-sm font-medium">Add Account</Text>
          </TouchableOpacity>
        </View>

        {company?.bankAccounts.map((account) => (
          <View key={account.id} className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{account.bankName}</Text>
                <Text className="text-gray-600">****{account.accountNumber.slice(-4)}</Text>
                <Text className="text-sm text-gray-500 capitalize">{account.accountType} Account</Text>
              </View>
              <View className="items-end">
                {account.isPrimary && (
                  <View className="bg-green-100 px-2 py-1 rounded-full mb-1">
                    <Text className="text-green-700 text-xs font-medium">Primary</Text>
                  </View>
                )}
                <View className={`px-2 py-1 rounded-full ${
                  account.verificationStatus === 'verified' 
                    ? 'bg-green-100' 
                    : account.verificationStatus === 'pending'
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    account.verificationStatus === 'verified' 
                      ? 'text-green-700' 
                      : account.verificationStatus === 'pending'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {account.verificationStatus === 'verified' ? '✅ Verified' : 
                     account.verificationStatus === 'pending' ? '🕒 Pending' : '❌ Failed'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
              <Text className="text-sm text-gray-500">
                Added {new Date(account.linkedAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                className="text-red-600"
                onPress={() => handleRemoveBankAccount(account.id)}
              >
                <Text className="text-red-600 text-sm font-medium">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {company?.bankAccounts.length === 0 && (
          <View className="bg-gray-50 rounded-lg p-8 items-center">
            <Text className="text-gray-500 text-center mb-4">No bank accounts linked</Text>
            <TouchableOpacity
              className="bg-green-600 px-6 py-3 rounded-lg"
              onPress={() => setShowAddBank(true)}
            >
              <Text className="text-white font-medium">Add Your First Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Bank Account Modal */}
      <Modal visible={showAddBank} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowAddBank(false)}>
                <Text className="text-blue-600 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Add Bank Account</Text>
              <TouchableOpacity onPress={handleAddBankAccount} disabled={loading}>
                <Text className={`text-base font-medium ${loading ? 'text-gray-400' : 'text-blue-600'}`}>
                  {loading ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Bank</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                  <View className="flex-row space-x-2">
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank}
                        className={`px-4 py-2 rounded-full border ${
                          bankForm.bankName === bank
                            ? 'bg-green-100 border-green-500'
                            : 'bg-white border-gray-300'
                        }`}
                        onPress={() => setBankForm({ ...bankForm, bankName: bank })}
                      >
                        <Text className={`text-sm ${
                          bankForm.bankName === bank ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {bank}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Account Number</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Enter account number"
                  value={bankForm.accountNumber}
                  onChangeText={(text) => setBankForm({ ...bankForm, accountNumber: text })}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Branch Code</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Enter branch code"
                  value={bankForm.branchCode}
                  onChangeText={(text) => setBankForm({ ...bankForm, branchCode: text })}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">Account Type</Text>
                <View className="flex-row space-x-2">
                  {['business', 'current', 'savings'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`flex-1 py-3 rounded-lg border ${
                        bankForm.accountType === type
                          ? 'bg-green-100 border-green-500'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => setBankForm({ ...bankForm, accountType: type as any })}
                    >
                      <Text className={`text-center text-sm capitalize ${
                        bankForm.accountType === type ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className={`flex-row items-center py-3 ${
                  bankForm.isPrimary ? 'opacity-100' : 'opacity-60'
                }`}
                onPress={() => setBankForm({ ...bankForm, isPrimary: !bankForm.isPrimary })}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  bankForm.isPrimary ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}>
                  {bankForm.isPrimary && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-gray-700">Set as primary account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );

  const renderUsersTab = () => {
    const session = authAPI.getCurrentSession();
    const isOwner = session?.user.role === 'owner';

    if (!isOwner) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500 text-center">
            Only company owners can manage users
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">Team Members</Text>
            <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
              <Text className="text-white text-sm font-medium">Invite User</Text>
            </TouchableOpacity>
          </View>

          {users.map((user) => (
            <View key={user.id} className="bg-white rounded-lg p-4 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text className="text-gray-600">{user.email}</Text>
                  <View className="flex-row items-center mt-2">
                    <View className={`px-2 py-1 rounded-full mr-2 ${
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
                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-600 mb-2">Permissions:</Text>
                <View className="flex-row flex-wrap">
                  {user.permissions.map((permission: string) => (
                    <View key={permission} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                      <Text className="text-xs text-gray-700">{permission.replace('_', ' ')}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {user.lastLogin && (
                <Text className="text-xs text-gray-500 mt-2">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 text-base">Done</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Company Profile</Text>
            <View className="w-12" />
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <View className="flex-row space-x-6 py-3">
              {[
                { key: 'profile', label: 'Profile', icon: '🏢' },
                { key: 'banking', label: 'Banking', icon: '🏦' },
                { key: 'users', label: 'Users', icon: '👥' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  className={`flex-row items-center px-3 py-2 rounded-lg ${
                    activeTab === tab.key ? 'bg-green-100' : ''
                  }`}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text className="mr-2">{tab.icon}</Text>
                  <Text className={`font-medium ${
                    activeTab === tab.key ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'banking' && renderBankingTab()}
        {activeTab === 'users' && renderUsersTab()}
      </View>
    </Modal>
  );
}