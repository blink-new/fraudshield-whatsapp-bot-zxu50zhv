import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { bankAPI, BankAccount } from '@/services/BankAPI';

interface BankAccountManagerProps {
  visible: boolean;
  onClose: () => void;
  onAccountLinked?: (account: BankAccount) => void;
}

export function BankAccountManager({ visible, onClose, onAccountLinked }: BankAccountManagerProps) {
  const [linkedAccounts, setLinkedAccounts] = useState<BankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: 'FNB',
  });

  const banks = ['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'Discovery Bank', 'TymeBank'];

  useEffect(() => {
    if (visible) {
      loadLinkedAccounts();
    }
  }, [visible]);

  const loadLinkedAccounts = () => {
    const accounts = bankAPI.getLinkedAccounts();
    setLinkedAccounts(accounts);
  };

  const handleLinkAccount = async () => {
    if (!formData.accountNumber || formData.accountNumber.length < 8) {
      Alert.alert('Error', 'Please enter a valid account number (minimum 8 digits)');
      return;
    }

    setIsLoading(true);
    try {
      const success = await bankAPI.linkBankAccount(formData.accountNumber, formData.bankName);
      
      if (success) {
        Alert.alert('Success', 'Bank account linked successfully!');
        loadLinkedAccounts();
        setShowAddForm(false);
        setFormData({ accountNumber: '', bankName: 'FNB' });
        
        if (onAccountLinked) {
          const newAccount = {
            accountNumber: `****${formData.accountNumber.slice(-4)}`,
            bankName: formData.bankName,
            accountHolder: 'Your Business Account',
            isLinked: true,
          };
          onAccountLinked(newAccount);
        }
      } else {
        Alert.alert('Error', 'Failed to link bank account. Please check your details and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while linking your account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkAccount = (accountNumber: string) => {
    Alert.alert(
      'Unlink Account',
      'Are you sure you want to unlink this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () => {
            setLinkedAccounts(prev => 
              prev.filter(account => account.accountNumber !== accountNumber)
            );
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeInDown.duration(300)}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Accounts</Text>
          <TouchableOpacity 
            onPress={() => setShowAddForm(true)} 
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Linked Accounts */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.sectionTitle}>Linked Accounts ({linkedAccounts.length})</Text>
            
            {linkedAccounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#999999" />
                <Text style={styles.emptyText}>No bank accounts linked</Text>
                <Text style={styles.emptySubtext}>
                  Link your bank accounts to enable real-time payment verification
                </Text>
                <TouchableOpacity 
                  style={styles.linkFirstButton}
                  onPress={() => setShowAddForm(true)}
                >
                  <Text style={styles.linkFirstButtonText}>Link Your First Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountsList}>
                {linkedAccounts.map((account, index) => (
                  <Animated.View
                    key={account.accountNumber}
                    style={styles.accountCard}
                    entering={FadeInUp.delay(300 + index * 100)}
                  >
                    <View style={styles.accountInfo}>
                      <View style={styles.bankIcon}>
                        <Ionicons name="card" size={24} color="#128C7E" />
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.bankName}>{account.bankName}</Text>
                        <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                        <Text style={styles.accountHolder}>{account.accountHolder}</Text>
                      </View>
                      <View style={styles.accountActions}>
                        <View style={styles.statusBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#25D366" />
                          <Text style={styles.statusText}>Active</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleUnlinkAccount(account.accountNumber)}
                          style={styles.unlinkButton}
                        >
                          <Ionicons name="unlink" size={16} color="#FF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Security Info */}
          <Animated.View style={styles.securitySection} entering={FadeInUp.delay(400)}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#25D366" />
              <Text style={styles.securityTitle}>Bank-Grade Security</Text>
            </View>
            <Text style={styles.securityText}>
              • All connections use 256-bit SSL encryption{'\n'}
              • We never store your banking passwords{'\n'}
              • Read-only access for verification only{'\n'}
              • Compliant with PCI DSS standards
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Add Account Modal */}
        <Modal
          visible={showAddForm}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={() => setShowAddForm(false)}
        >
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <TouchableOpacity 
                onPress={() => setShowAddForm(false)}
                style={styles.formCloseButton}
              >
                <Text style={styles.formCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.formTitle}>Link Bank Account</Text>
              <TouchableOpacity 
                onPress={handleLinkAccount}
                style={[styles.formSaveButton, { opacity: isLoading ? 0.5 : 1 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#25D366" />
                ) : (
                  <Text style={styles.formSaveText}>Link</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              {/* Bank Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Bank</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.bankSelector}>
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank}
                        style={[
                          styles.bankOption,
                          formData.bankName === bank && styles.bankOptionSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, bankName: bank }))}
                      >
                        <Text style={[
                          styles.bankOptionText,
                          formData.bankName === bank && styles.bankOptionTextSelected,
                        ]}>
                          {bank}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Account Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.accountNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, accountNumber: text }))}
                  placeholder="Enter your account number"
                  keyboardType="numeric"
                  maxLength={15}
                  secureTextEntry
                />
                <Text style={styles.formHint}>
                  Your account number will be encrypted and stored securely
                </Text>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>How it works:</Text>
                <Text style={styles.instructionsText}>
                  1. We'll securely connect to your bank{'\n'}
                  2. Verify your account details{'\n'}
                  3. Enable real-time payment verification{'\n'}
                  4. You can unlink anytime
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    backgroundColor: '#128C7E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
    lineHeight: 20,
  },
  linkFirstButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  linkFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  accountNumber: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  accountHolder: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  accountActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#25D366',
    fontWeight: '500',
    marginLeft: 4,
  },
  unlinkButton: {
    padding: 4,
  },
  securitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#25D366',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  // Form styles
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  formCloseButton: {
    padding: 8,
  },
  formCloseText: {
    fontSize: 16,
    color: '#FF4444',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  formSaveButton: {
    padding: 8,
  },
  formSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#25D366',
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  bankSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  bankOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bankOptionSelected: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  bankOptionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  bankOptionTextSelected: {
    color: '#FFFFFF',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  formHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  instructionsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});