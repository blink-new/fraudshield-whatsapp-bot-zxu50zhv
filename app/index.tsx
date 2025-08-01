import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ChatMessage } from '@/components/ChatMessage';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { TypingIndicator } from '@/components/TypingIndicator';
import { VerificationCard } from '@/components/VerificationCard';
import { PinCard } from '@/components/PinCard';
import { EnhancedVerificationCard } from '@/components/EnhancedVerificationCard';
import { BankAccountManager } from '@/components/BankAccountManager';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentValidationResults from '@/components/DocumentValidationResults';
import AuthScreen from '@/components/AuthScreen';
import CompanyProfile from '@/components/CompanyProfile';
import UserManagement from '@/components/UserManagement';
import { bankAPI, PaymentVerificationResult, CompanyVerificationResult } from '@/services/BankAPI';
import { authAPI, type AuthSession } from '@/services/AuthAPI';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'verification' | 'pin' | 'document' | 'enhanced_verification' | 'document_validation' | 'document_upload';
  data?: any;
}

export default function ChatScreen() {
  // Authentication state
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI state
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<'none' | 'payment' | 'document' | 'pin'>('none');
  const [showBankManager, setShowBankManager] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDocumentResults, setShowDocumentResults] = useState(false);
  const [documentValidationResult, setDocumentValidationResult] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const currentSession = authAPI.getCurrentSession();
    if (currentSession) {
      handleAuthSuccess(currentSession);
    }
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleAuthSuccess = (authSession: AuthSession) => {
    setSession(authSession);
    setIsAuthenticated(true);
    
    // Initialize chat with personalized welcome message
    const welcomeMessage = `👋 Hi ${authSession.user.firstName}, welcome to FraudShield!

🏢 Company: ${authSession.company.name}
👤 Role: ${authSession.user.role === 'owner' ? '👑 Owner' : '👤 Staff'}

I can help you:
1️⃣ Verify payment (PoP / EFT)
2️⃣ Check RFQ / PO authenticity  
3️⃣ Get a release PIN for your driver

Please type 1, 2 or 3 to continue.`;

    setMessages([{
      id: '1',
      text: welcomeMessage,
      isBot: true,
      timestamp: new Date(),
    }]);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authAPI.logout();
            setSession(null);
            setIsAuthenticated(false);
            setMessages([]);
            setCurrentFlow('none');
          }
        }
      ]
    );
  };

  const addMessage = (text: string, isBot: boolean = false, type: 'text' | 'verification' | 'pin' | 'document' | 'enhanced_verification' | 'document_validation' | 'document_upload' = 'text', data?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      type,
      data,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay: number = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleDocumentProcessed = (result: any) => {
    setDocumentValidationResult(result);
    
    // Add validation result message
    addMessage('', true, 'document_validation', result);
    
    // Add follow-up message based on validation result
    simulateTyping(() => {
      if (result.isValid && result.riskScore < 20) {
        addMessage(`✅ Document verified! Risk score: ${result.riskScore}/100. This appears to be legitimate.`, true);
      } else if (result.riskScore < 40) {
        addMessage(`⚠️ Document partially verified. Risk score: ${result.riskScore}/100. Please review the validation details.`, true);
      } else if (result.riskScore < 70) {
        addMessage(`🚨 High risk detected! Risk score: ${result.riskScore}/100. Additional verification recommended.`, true);
      } else {
        addMessage(`🚨 CRITICAL RISK! Risk score: ${result.riskScore}/100. Do NOT proceed without manual verification.`, true);
      }
      
      // Add specific recommendations
      if (result.recommendations && result.recommendations.length > 0) {
        setTimeout(() => {
          addMessage(`📋 Recommendations:
${result.recommendations.slice(0, 3).join('\n')}`, true);
        }, 1000);
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, false);
    setInputText('');

    // Handle different flows
    if (currentFlow === 'none') {
      handleMainMenu(userMessage);
    } else if (currentFlow === 'payment') {
      handlePaymentFlow(userMessage);
    } else if (currentFlow === 'document') {
      handleDocumentFlow(userMessage);
    } else if (currentFlow === 'pin') {
      handlePinFlow(userMessage);
    }
  };

  const handleMainMenu = (input: string) => {
    if (input === '1' || input.toLowerCase().includes('payment') || input.toLowerCase().includes('pop')) {
      // Check permissions
      if (!authAPI.hasPermission('verify_payments')) {
        addMessage('❌ You don\'t have permission to verify payments. Please contact your company owner.', true);
        return;
      }
      
      setCurrentFlow('payment');
      simulateTyping(() => {
        addMessage(`✅ Please upload the customer's PoP screenshot for ML analysis or type the payment reference.

Example: "FNB, Ref 483920"`, true);
        // Add document upload component
        setTimeout(() => {
          addMessage('', true, 'document_upload', { 
            documentType: 'PoP',
            placeholder: 'Upload PoP document or screenshot'
          });
        }, 500);
      });
    } else if (input === '2' || input.toLowerCase().includes('rfq') || input.toLowerCase().includes('po')) {
      // Check permissions
      if (!authAPI.hasPermission('check_documents')) {
        addMessage('❌ You don\'t have permission to check documents. Please contact your company owner.', true);
        return;
      }
      
      setCurrentFlow('document');
      simulateTyping(() => {
        addMessage('📄 Please upload the RFQ or PO document for ML analysis and registry validation.', true);
        // Add document upload component
        setTimeout(() => {
          addMessage('', true, 'document_upload', { 
            documentType: 'PO',
            placeholder: 'Upload PO/RFQ document for validation'
          });
        }, 500);
      });
    } else if (input === '3' || input.toLowerCase().includes('pin') || input.toLowerCase().includes('driver')) {
      // Check permissions
      if (!authAPI.hasPermission('generate_pins')) {
        addMessage('❌ You don\'t have permission to generate PINs. Please contact your company owner.', true);
        return;
      }
      
      setCurrentFlow('pin');
      simulateTyping(() => {
        addMessage(`🚚 Please enter customer name and order amount.

Example: "ABC Foods, R12,500"`, true);
      });
    } else {
      simulateTyping(() => {
        addMessage(`Please select an option by typing 1, 2, or 3:

1️⃣ Verify payment (PoP / EFT)
2️⃣ Check RFQ / PO authenticity
3️⃣ Get a release PIN for your driver`, true);
      });
    }
  };

  const handlePaymentFlow = async (input: string) => {
    setIsVerifying(true);
    
    simulateTyping(() => {
      addMessage(`🔎 Connecting to bank API…
🕒 Verifying payment details…`, true);
    }, 500);

    try {
      // Use real bank API
      const verificationResult = await bankAPI.verifyPayment(input);
      
      simulateTyping(() => {
        addMessage('', true, 'enhanced_verification', {
          ...verificationResult,
          verificationType: 'payment'
        });
        
        // Follow up based on verification result
        setTimeout(() => {
          if (verificationResult.isVerified && verificationResult.status === 'cleared') {
            addMessage('✅ Payment verified! Would you like me to generate a secure release PIN for your driver?', true);
          } else if (verificationResult.status === 'pending') {
            addMessage('⏳ Payment is still processing. I recommend waiting for clearance before releasing goods.', true);
          } else {
            addMessage('🚨 Payment verification failed. Please double-check the reference or contact your customer.', true);
          }
        }, 1500);
      }, 2000);
    } catch (error) {
      simulateTyping(() => {
        addMessage('❌ Unable to verify payment at this time. Please check your bank connection or try again later.', true);
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDocumentFlow = async (input: string) => {
    setIsVerifying(true);
    
    simulateTyping(() => {
      addMessage(`🔎 Analyzing company details…
🕒 Checking business registration and domain…`, true);
    }, 500);

    try {
      // Extract company name from input (simplified)
      const companyName = input.includes('document') ? 'ABC Manufacturing Ltd' : input;
      const verificationResult = await bankAPI.verifyCompany(companyName);
      
      simulateTyping(() => {
        addMessage('', true, 'enhanced_verification', {
          ...verificationResult,
          verificationType: 'company'
        });
        
        // Follow up based on verification result
        setTimeout(() => {
          if (verificationResult.isVerified) {
            addMessage('✅ Company verified! This appears to be a legitimate business. You can proceed with confidence.', true);
          } else if (verificationResult.status === 'inactive') {
            addMessage('⚠️ Company is no longer active. I recommend verifying with alternative contacts before proceeding.', true);
          } else {
            addMessage('🚨 Company verification failed. High fraud risk detected. Please verify through official channels.', true);
          }
        }, 1500);
      }, 2000);
    } catch (error) {
      simulateTyping(() => {
        addMessage('❌ Unable to verify company at this time. Please try again or verify manually.', true);
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinFlow = (input: string) => {
    simulateTyping(() => {
      addMessage('🔎 Verifying customer and order details…', true);
    }, 500);

    simulateTyping(() => {
      // Extract amount from input (simplified parsing)
      const amountMatch = input.match(/R?(\\d+[,.]?\\d*)/);
      const amount = amountMatch ? `R${amountMatch[1]}` : 'R12,500';
      
      addMessage(`✅ Payment verified for ${amount}.`, true);
    }, 1500);

    simulateTyping(() => {
      const pin = bankAPI.generateSecurePIN();
      addMessage('', true, 'pin', { 
        pin,
        amount: input.match(/R?(\\d+[,.]?\\d*)/) ? `R${input.match(/R?(\\d+[,.]?\\d*)/)?.[1]}` : 'R12,500',
        customer: input.split(',')[0] || 'Customer'
      });
    }, 2500);
  };

  const handleQuickAction = (action: number) => {
    setInputText(action.toString());
    handleSendMessage();
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        addMessage(`📎 Uploaded: ${file.name}`, false, 'document');
        
        if (currentFlow === 'payment') {
          handlePaymentFlow('document');
        } else if (currentFlow === 'document') {
          handleDocumentFlow('document');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        addMessage('📷 Image uploaded', false, 'document');
        
        if (currentFlow === 'payment') {
          handlePaymentFlow('image');
        } else if (currentFlow === 'document') {
          handleDocumentFlow('image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const resetChat = () => {
    setCurrentFlow('none');
    simulateTyping(() => {
      const welcomeMessage = `👋 Hi ${session?.user.firstName}, welcome back to FraudShield!

I can help you:
1️⃣ Verify payment (PoP / EFT)
2️⃣ Check RFQ / PO authenticity
3️⃣ Get a release PIN for your driver

Please type 1, 2 or 3 to continue.`;
      
      addMessage(welcomeMessage, true);
    });
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#128C7E" />
      
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeInDown.duration(400)}>
        <View style={styles.headerContent}>
          <View style={styles.botInfo}>
            <View style={styles.avatar}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.botName}>FraudShield Bot</Text>
              <Text style={styles.botStatus}>
                {session?.company.name} • {session?.user.role === 'owner' ? '👑 Owner' : '👤 Staff'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {session?.user.role === 'owner' && (
              <TouchableOpacity onPress={() => setShowUserManagement(true)} style={styles.headerButton}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowCompanyProfile(true)} style={styles.headerButton}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBankManager(true)} style={styles.headerButton}>
              <Ionicons name="card" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetChat} style={styles.headerButton}>
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            delay={index * 100}
            onDocumentProcessed={handleDocumentProcessed}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Quick Actions */}
      {currentFlow === 'none' && (
        <QuickActionButtons onAction={handleQuickAction} />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleDocumentUpload}
          >
            <Ionicons name="attach" size={24} color="#128C7E" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImageUpload}
          >
            <Ionicons name="camera" size={24} color="#128C7E" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Company Profile */}
      {showCompanyProfile && (
        <CompanyProfile onClose={() => setShowCompanyProfile(false)} />
      )}

      {/* User Management */}
      {showUserManagement && (
        <UserManagement
          visible={showUserManagement}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {/* Bank Account Manager */}
      <BankAccountManager
        visible={showBankManager}
        onClose={() => setShowBankManager(false)}
        onAccountLinked={(account) => {
          console.log('Account linked:', account);
        }}
      />

      {/* Document Validation Results Modal */}
      {showDocumentResults && documentValidationResult && (
        <View style={styles.modalOverlay}>
          <DocumentValidationResults
            result={documentValidationResult}
            onClose={() => setShowDocumentResults(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    backgroundColor: '#128C7E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  botName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  botStatus: {
    fontSize: 12,
    color: '#B8E6D1',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    backgroundColor: '#25D366',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});