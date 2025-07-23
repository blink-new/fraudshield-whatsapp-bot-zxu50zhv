import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DocumentValidationResultsProps {
  result: any;
  onClose?: () => void;
}

export default function DocumentValidationResults({ result, onClose }: DocumentValidationResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'registries'>('overview');

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 20) return 'text-green-600';
    if (riskScore < 40) return 'text-yellow-600';
    if (riskScore < 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskBgColor = (riskScore: number) => {
    if (riskScore < 20) return 'bg-green-100';
    if (riskScore < 40) return 'bg-yellow-100';
    if (riskScore < 70) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return { name: 'checkmark-circle', color: '#22c55e' };
      case 'suspicious': return { name: 'warning', color: '#f59e0b' };
      case 'not_found': return { name: 'close-circle', color: '#ef4444' };
      case 'error': return { name: 'alert-circle', color: '#6b7280' };
      default: return { name: 'help-circle', color: '#6b7280' };
    }
  };

  const renderOverviewTab = () => (
    <View className="p-4">
      {/* Risk Score Card */}
      <View className={`rounded-lg p-4 mb-4 ${getRiskBgColor(result.riskScore)}`}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-800">Risk Assessment</Text>
            <Text className={`text-2xl font-bold ${getRiskColor(result.riskScore)}`}>
              {result.riskScore}/100
            </Text>
          </View>
          <View className="items-center">
            <Ionicons 
              name={result.isValid ? "shield-checkmark" : "shield"} 
              size={40} 
              color={result.isValid ? "#22c55e" : "#ef4444"} 
            />
            <Text className={`font-medium ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {result.isValid ? 'VERIFIED' : 'SUSPICIOUS'}
            </Text>
          </View>
        </View>
      </View>

      {/* Document Info */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">Document Information</Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Type:</Text>
            <Text className="font-medium">{result.extractedData.documentType || 'Unknown'}</Text>
          </View>
          
          {result.extractedData.companyName && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Company:</Text>
              <Text className="font-medium flex-1 text-right" numberOfLines={2}>
                {result.extractedData.companyName}
              </Text>
            </View>
          )}
          
          {result.extractedData.amount && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Amount:</Text>
              <Text className="font-medium">
                {result.extractedData.currency} {result.extractedData.amount.toLocaleString()}
              </Text>
            </View>
          )}
          
          {result.extractedData.reference && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Reference:</Text>
              <Text className="font-medium">{result.extractedData.reference}</Text>
            </View>
          )}
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">OCR Confidence:</Text>
            <Text className="font-medium">{(result.confidence * 100).toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      {/* Quick Validation Status */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">Validation Status</Text>
        
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Company Registration</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.companyRegistration.status)} 
                size={20} 
              />
              <Text className="ml-2 font-medium capitalize">
                {result.validationChecks.companyRegistration.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Domain Validation</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.domainValidation.status)} 
                size={20} 
              />
              <Text className="ml-2 font-medium capitalize">
                {result.validationChecks.domainValidation.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Bank Validation</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.bankValidation.status)} 
                size={20} 
              />
              <Text className="ml-2 font-medium capitalize">
                {result.validationChecks.bankValidation.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">Recommendations</Text>
        {result.recommendations.map((recommendation: string, index: number) => (
          <View key={index} className="flex-row items-start mb-2">
            <Text className="text-gray-600 mr-2">•</Text>
            <Text className="text-gray-700 flex-1">{recommendation}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDetailsTab = () => (
    <View className="p-4">
      {/* Extracted Data */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">ML Extracted Data</Text>
        
        {result.extractedData.companyName && (
          <View className="mb-3">
            <Text className="text-sm text-gray-500 uppercase tracking-wide">Company Name</Text>
            <Text className="text-gray-800 font-medium">{result.extractedData.companyName}</Text>
          </View>
        )}
        
        {result.extractedData.registrationNumber && (
          <View className="mb-3">
            <Text className="text-sm text-gray-500 uppercase tracking-wide">Registration Number</Text>
            <Text className="text-gray-800 font-medium">{result.extractedData.registrationNumber}</Text>
          </View>
        )}
        
        {result.extractedData.vatNumber && (
          <View className="mb-3">
            <Text className="text-sm text-gray-500 uppercase tracking-wide">VAT Number</Text>
            <Text className="text-gray-800 font-medium">{result.extractedData.vatNumber}</Text>
          </View>
        )}
        
        {result.extractedData.contactInfo?.email && (
          <View className="mb-3">
            <Text className="text-sm text-gray-500 uppercase tracking-wide">Email</Text>
            <Text className="text-gray-800 font-medium">{result.extractedData.contactInfo.email}</Text>
          </View>
        )}
        
        {result.extractedData.bankDetails && (
          <View className="mb-3">
            <Text className="text-sm text-gray-500 uppercase tracking-wide">Bank Details</Text>
            <Text className="text-gray-800">Account: {result.extractedData.bankDetails.accountNumber}</Text>
            <Text className="text-gray-800">Branch: {result.extractedData.bankDetails.branchCode}</Text>
            <Text className="text-gray-800">Bank: {result.extractedData.bankDetails.bankName}</Text>
          </View>
        )}
      </View>

      {/* Fraud Indicators */}
      {result.validationChecks.fraudIndicators.length > 0 && (
        <View className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
          <Text className="text-lg font-bold text-red-800 mb-3">Fraud Indicators</Text>
          {result.validationChecks.fraudIndicators.map((indicator: string, index: number) => (
            <View key={index} className="flex-row items-start mb-2">
              <Ionicons name="warning" size={16} color="#dc2626" />
              <Text className="text-red-700 ml-2 flex-1">{indicator}</Text>
            </View>
          ))}
        </View>
      )}

      {/* OCR Quality */}
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">OCR Analysis</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">Text Recognition Quality</Text>
          <View className="flex-row items-center">
            <View className="w-20 bg-gray-200 rounded-full h-2 mr-2">
              <View 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${result.validationChecks.ocrQuality * 100}%` }}
              />
            </View>
            <Text className="font-medium">{(result.validationChecks.ocrQuality * 100).toFixed(1)}%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRegistriesTab = () => (
    <View className="p-4">
      {/* CIPC Registry */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Ionicons name="business" size={24} color="#25D366" />
          <Text className="text-lg font-bold text-gray-800 ml-2">CIPC Registry</Text>
        </View>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Status:</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.companyRegistration.status)} 
                size={16} 
              />
              <Text className="ml-1 font-medium capitalize">
                {result.validationChecks.companyRegistration.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">CIPC Match:</Text>
            <Text className="font-medium">
              {result.validationChecks.companyRegistration.cipciMatch ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {result.validationChecks.companyRegistration.registrationDate && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Registration Date:</Text>
              <Text className="font-medium">
                {result.validationChecks.companyRegistration.registrationDate}
              </Text>
            </View>
          )}
          
          {result.validationChecks.companyRegistration.directors && (
            <View>
              <Text className="text-gray-600 mb-1">Directors:</Text>
              {result.validationChecks.companyRegistration.directors.map((director: string, index: number) => (
                <Text key={index} className="font-medium ml-4">• {director}</Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* WHOIS Registry */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Ionicons name="globe" size={24} color="#25D366" />
          <Text className="text-lg font-bold text-gray-800 ml-2">WHOIS Registry</Text>
        </View>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Status:</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.domainValidation.status)} 
                size={16} 
              />
              <Text className="ml-1 font-medium capitalize">
                {result.validationChecks.domainValidation.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Domain Match:</Text>
            <Text className="font-medium">
              {result.validationChecks.domainValidation.whoisMatch ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {result.validationChecks.domainValidation.domainAge && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Domain Age:</Text>
              <Text className="font-medium">
                {result.validationChecks.domainValidation.domainAge} days
              </Text>
            </View>
          )}
          
          {result.validationChecks.domainValidation.registrar && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Registrar:</Text>
              <Text className="font-medium">
                {result.validationChecks.domainValidation.registrar}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* SAFPS Registry */}
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <Ionicons name="card" size={24} color="#25D366" />
          <Text className="text-lg font-bold text-gray-800 ml-2">SAFPS Registry</Text>
        </View>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Status:</Text>
            <View className="flex-row items-center">
              <Ionicons 
                {...getStatusIcon(result.validationChecks.bankValidation.status)} 
                size={16} 
              />
              <Text className="ml-1 font-medium capitalize">
                {result.validationChecks.bankValidation.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">SAFPS Check:</Text>
            <Text className="font-medium">
              {result.validationChecks.bankValidation.safpsCheck ? 'Passed' : 'Failed'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Account Exists:</Text>
            <Text className="font-medium">
              {result.validationChecks.bankValidation.accountExists ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Branch Valid:</Text>
            <Text className="font-medium">
              {result.validationChecks.bankValidation.branchValid ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Validation Results</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Tabs */}
        <View className="flex-row mt-3">
          <TouchableOpacity
            onPress={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              activeTab === 'overview' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text className={`font-medium ${
              activeTab === 'overview' ? 'text-green-700' : 'text-gray-600'
            }`}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              activeTab === 'details' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text className={`font-medium ${
              activeTab === 'details' ? 'text-green-700' : 'text-gray-600'
            }`}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('registries')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'registries' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text className={`font-medium ${
              activeTab === 'registries' ? 'text-green-700' : 'text-gray-600'
            }`}>
              Registries
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'registries' && renderRegistriesTab()}
      </ScrollView>
    </View>
  );
}