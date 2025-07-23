import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PaymentVerificationResult, CompanyVerificationResult } from '@/services/BankAPI';

interface EnhancedVerificationCardProps {
  data: PaymentVerificationResult | CompanyVerificationResult;
  type: 'payment' | 'company';
}

export function EnhancedVerificationCard({ data, type }: EnhancedVerificationCardProps) {
  const isPayment = type === 'payment';
  const paymentData = isPayment ? data as PaymentVerificationResult : null;
  const companyData = !isPayment ? data as CompanyVerificationResult : null;
  
  const isVerified = data.isVerified;
  const riskLevel = data.riskScore < 30 ? 'low' : data.riskScore < 70 ? 'medium' : 'high';

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return '#25D366';
      case 'medium': return '#FFA500';
      case 'high': return '#FF4444';
      default: return '#999999';
    }
  };

  const getStatusIcon = () => {
    if (isVerified) return 'checkmark-circle';
    if (riskLevel === 'high') return 'warning';
    return 'alert-circle';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { 
          backgroundColor: isVerified ? '#E8F5E8' : '#FFE8E8',
          borderLeftColor: getRiskColor(),
        }
      ]}
      entering={FadeInDown.duration(400)}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Ionicons
            name={getStatusIcon()}
            size={24}
            color={getRiskColor()}
          />
          <Text style={[styles.status, { color: getRiskColor() }]}>
            {isVerified ? 'Verified' : 'Suspicious'}
          </Text>
        </View>
        
        <View style={styles.riskBadge}>
          <Text style={[styles.riskText, { color: getRiskColor() }]}>
            {riskLevel.toUpperCase()} RISK
          </Text>
        </View>
      </View>

      {/* Payment Details */}
      {isPayment && paymentData && (
        <View style={styles.detailsSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{paymentData.amount}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(paymentData.status) }]}>
              <Text style={styles.statusBadgeText}>{paymentData.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bank</Text>
              <Text style={styles.infoValue}>{paymentData.bank}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Reference</Text>
              <Text style={styles.infoValue}>{paymentData.reference}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(paymentData.transactionDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Confidence</Text>
              <Text style={styles.infoValue}>{paymentData.confidence.toFixed(0)}%</Text>
            </View>
          </View>

          {/* Verification Details */}
          <View style={styles.checksSection}>
            <Text style={styles.checksTitle}>Verification Checks</Text>
            <View style={styles.checksList}>
              <CheckItem 
                label="Account Match" 
                passed={paymentData.details.accountMatch} 
              />
              <CheckItem 
                label="Amount Match" 
                passed={paymentData.details.amountMatch} 
              />
              <CheckItem 
                label="Timeline Valid" 
                passed={paymentData.details.timelineValid} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Company Details */}
      {!isPayment && companyData && (
        <View style={styles.detailsSection}>
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>{companyData.companyName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getCompanyStatusColor(companyData.status) }]}>
              <Text style={styles.statusBadgeText}>{companyData.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Domain</Text>
              <Text style={styles.infoValue}>{companyData.domain}</Text>
            </View>
            {companyData.registrationNumber && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Reg Number</Text>
                <Text style={styles.infoValue}>{companyData.registrationNumber}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Domain Match</Text>
              <Text style={styles.infoValue}>{companyData.domainMatch ? 'Yes' : 'No'}</Text>
            </View>
            {companyData.details.businessType && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Business Type</Text>
                <Text style={styles.infoValue}>{companyData.details.businessType}</Text>
              </View>
            )}
          </View>

          {companyData.details.registeredAddress && (
            <View style={styles.addressSection}>
              <Text style={styles.infoLabel}>Registered Address</Text>
              <Text style={styles.addressText}>{companyData.details.registeredAddress}</Text>
            </View>
          )}
        </View>
      )}

      {/* Fraud Indicators */}
      {data.riskScore > 50 && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>⚠️ Fraud Indicators</Text>
          {(isPayment ? paymentData?.details.fraudIndicators : companyData?.details.fraudAlerts)?.map((indicator, index) => (
            <Text key={index} style={styles.alertText}>• {indicator}</Text>
          ))}
        </View>
      )}

      {/* Action Button */}
      <View style={styles.actionSection}>
        {isVerified ? (
          <TouchableOpacity style={styles.successButton}>
            <Ionicons name="shield-checkmark" size={16} color="#25D366" />
            <Text style={styles.successButtonText}>Safe to Proceed</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.warningButton}>
            <Ionicons name="alert-circle" size={16} color="#FF4444" />
            <Text style={styles.warningButtonText}>Review Required</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Helper component for verification checks
function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons
        name={passed ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={passed ? '#25D366' : '#FF4444'}
      />
      <Text style={[styles.checkLabel, { color: passed ? '#25D366' : '#FF4444' }]}>
        {label}
      </Text>
    </View>
  );
}

// Helper functions
function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'cleared': return '#25D366';
    case 'pending': return '#FFA500';
    case 'failed': return '#FF4444';
    case 'not_found': return '#999999';
    default: return '#999999';
  }
}

function getCompanyStatusColor(status: string) {
  switch (status) {
    case 'active': return '#25D366';
    case 'inactive': return '#FFA500';
    case 'suspended': return '#FF4444';
    default: return '#999999';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  addressSection: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  checksSection: {
    marginBottom: 12,
  },
  checksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  checksList: {
    gap: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkLabel: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  alertsSection: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
    marginBottom: 6,
  },
  alertText: {
    fontSize: 13,
    color: '#FF4444',
    lineHeight: 18,
  },
  actionSection: {
    alignItems: 'center',
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F4DD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successButtonText: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '600',
    marginLeft: 6,
  },
  warningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD4D4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  warningButtonText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
    marginLeft: 6,
  },
});