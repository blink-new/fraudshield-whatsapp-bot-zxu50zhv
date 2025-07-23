import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { authAPI, type AuthSession } from '../services/AuthAPI';

interface AuthScreenProps {
  onAuthSuccess: (session: AuthSession) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: 'john@acmecorp.co.za',
    password: 'password123'
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    registrationNumber: '',
    industry: 'Manufacturing',
    phone: ''
  });

  const industries = [
    'Manufacturing', 'Retail', 'Construction', 'Technology', 'Healthcare',
    'Finance', 'Education', 'Transportation', 'Agriculture', 'Other'
  ];

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const session = await authAPI.login(loginForm.email, loginForm.password);
      onAuthSuccess(session);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.email || !registerForm.password || !registerForm.firstName || 
        !registerForm.lastName || !registerForm.companyName || !registerForm.registrationNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const session = await authAPI.register(registerForm);
      Alert.alert('Success', 'Company registered successfully! You can now start using FraudShield.');
      onAuthSuccess(session);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
          placeholder="Enter your email"
          value={loginForm.email}
          onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View>
        <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
          placeholder="Enter your password"
          value={loginForm.password}
          onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
          secureTextEntry
          autoComplete="password"
        />
      </View>

      <TouchableOpacity
        className={`bg-green-600 rounded-lg py-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center text-base font-semibold">
          {loading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View className="bg-blue-50 p-4 rounded-lg">
        <Text className="text-blue-800 text-sm font-medium mb-2">Demo Accounts:</Text>
        <Text className="text-blue-700 text-xs">Owner: john@acmecorp.co.za / password123</Text>
        <Text className="text-blue-700 text-xs">Staff: sarah@acmecorp.co.za / password123</Text>
      </View>
    </View>
  );

  const renderRegisterForm = () => (
    <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
      <View className="grid grid-cols-2 gap-4">
        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">First Name *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="John"
            value={registerForm.firstName}
            onChangeText={(text) => setRegisterForm({ ...registerForm, firstName: text })}
            autoComplete="given-name"
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Last Name *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Smith"
            value={registerForm.lastName}
            onChangeText={(text) => setRegisterForm({ ...registerForm, lastName: text })}
            autoComplete="family-name"
          />
        </View>
      </View>

      <View>
        <Text className="text-gray-700 text-sm font-medium mb-2">Email Address *</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
          placeholder="john@company.co.za"
          value={registerForm.email}
          onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View>
        <Text className="text-gray-700 text-sm font-medium mb-2">Phone Number</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
          placeholder="+27 11 123 4567"
          value={registerForm.phone}
          onChangeText={(text) => setRegisterForm({ ...registerForm, phone: text })}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>

      <View className="grid grid-cols-2 gap-4">
        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Password *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Min 6 characters"
            value={registerForm.password}
            onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Confirm Password *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Confirm password"
            value={registerForm.confirmPassword}
            onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>
      </View>

      <View className="border-t border-gray-200 pt-4 mt-6">
        <Text className="text-gray-800 text-lg font-semibold mb-4">Company Information</Text>
        
        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Company Name *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="ACME Corporation (Pty) Ltd"
            value={registerForm.companyName}
            onChangeText={(text) => setRegisterForm({ ...registerForm, companyName: text })}
            autoComplete="organization"
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Registration Number *</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="2019/123456/07"
            value={registerForm.registrationNumber}
            onChangeText={(text) => setRegisterForm({ ...registerForm, registrationNumber: text })}
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-medium mb-2">Industry</Text>
          <View className="bg-white border border-gray-300 rounded-lg">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
              <View className="flex-row space-x-2">
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry}
                    className={`px-3 py-2 rounded-full border ${
                      registerForm.industry === industry
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                    onPress={() => setRegisterForm({ ...registerForm, industry })}
                  >
                    <Text className={`text-sm ${
                      registerForm.industry === industry ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {industry}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-green-600 rounded-lg py-4 mt-6 ${loading ? 'opacity-50' : ''}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center text-base font-semibold">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-green-600 w-16 h-16 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">🛡️</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">FraudShield</Text>
            <Text className="text-gray-600 text-center">
              {isLogin ? 'Sign in to your account' : 'Create your company account'}
            </Text>
          </View>

          {/* Toggle Buttons */}
          <View className="flex-row bg-gray-200 rounded-lg p-1 mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-md ${isLogin ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setIsLogin(true)}
            >
              <Text className={`text-center font-medium ${isLogin ? 'text-gray-900' : 'text-gray-600'}`}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-md ${!isLogin ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setIsLogin(false)}
            >
              <Text className={`text-center font-medium ${!isLogin ? 'text-gray-900' : 'text-gray-600'}`}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          {isLogin ? renderLoginForm() : renderRegisterForm()}

          {/* Footer */}
          <View className="mt-8 pt-6 border-t border-gray-200">
            <Text className="text-center text-xs text-gray-500">
              By using FraudShield, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}