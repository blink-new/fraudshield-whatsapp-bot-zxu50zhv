import { Alert } from 'react-native';

// Bank API Types
export interface PaymentReference {
  bank: string;
  reference: string;
  amount?: string;
  date?: string;
}

export interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  isLinked: boolean;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  amount: string;
  status: 'cleared' | 'pending' | 'failed' | 'not_found';
  transactionDate: string;
  reference: string;
  bank: string;
  confidence: number;
  riskScore: number;
  details: {
    accountMatch: boolean;
    amountMatch: boolean;
    timelineValid: boolean;
    fraudIndicators: string[];
  };
}

export interface CompanyVerificationResult {
  isVerified: boolean;
  companyName: string;
  registrationNumber?: string;
  status: 'active' | 'inactive' | 'suspended';
  domain: string;
  domainMatch: boolean;
  riskScore: number;
  details: {
    registeredAddress?: string;
    directors?: string[];
    businessType?: string;
    fraudAlerts: string[];
  };
}

// Mock Bank API Service
class BankAPIService {
  private linkedAccounts: BankAccount[] = [
    {
      accountNumber: '****1234',
      bankName: 'FNB',
      accountHolder: 'Your Business Account',
      isLinked: true,
    },
    {
      accountNumber: '****5678',
      bankName: 'Standard Bank',
      accountHolder: 'Your Business Account',
      isLinked: true,
    },
  ];

  // Simulate API delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Parse payment reference from text
  parsePaymentReference(text: string): PaymentReference | null {
    const patterns = [
      // FNB pattern: "FNB, Ref 483920"
      /(?:FNB|fnb).*?(?:ref|reference)[\s:]*([0-9]+)/i,
      // Standard Bank pattern: "Standard Bank Ref: 123456"
      /(?:standard\s*bank|stb).*?(?:ref|reference)[\s:]*([0-9]+)/i,
      // ABSA pattern: "ABSA REF 789012"
      /(?:ABSA|absa).*?(?:ref|reference)[\s:]*([0-9]+)/i,
      // Nedbank pattern: "Nedbank Ref: 345678"
      /(?:nedbank|ned).*?(?:ref|reference)[\s:]*([0-9]+)/i,
      // Capitec pattern: "Capitec Ref 901234"
      /(?:capitec|cap).*?(?:ref|reference)[\s:]*([0-9]+)/i,
      // Generic pattern: "Ref: 123456" or "Reference: 123456"
      /(?:ref|reference)[\s:]*([0-9]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const bankMatch = text.match(/(FNB|Standard Bank|ABSA|Nedbank|Capitec)/i);
        return {
          bank: bankMatch ? bankMatch[1] : 'Unknown Bank',
          reference: match[1],
        };
      }
    }

    return null;
  }

  // Verify payment against bank records
  async verifyPayment(reference: PaymentReference | string): Promise<PaymentVerificationResult> {
    await this.delay(2000 + Math.random() * 2000); // Simulate API call

    let parsedRef: PaymentReference;
    
    if (typeof reference === 'string') {
      const parsed = this.parsePaymentReference(reference);
      if (!parsed) {
        return {
          isVerified: false,
          amount: 'R0.00',
          status: 'not_found',
          transactionDate: new Date().toISOString(),
          reference: reference,
          bank: 'Unknown',
          confidence: 0,
          riskScore: 100,
          details: {
            accountMatch: false,
            amountMatch: false,
            timelineValid: false,
            fraudIndicators: ['Invalid reference format'],
          },
        };
      }
      parsedRef = parsed;
    } else {
      parsedRef = reference;
    }

    // Simulate different verification scenarios
    const scenarios = [
      {
        weight: 0.6, // 60% chance
        result: {
          isVerified: true,
          amount: `R${(Math.random() * 50000 + 1000).toFixed(2)}`,
          status: 'cleared' as const,
          confidence: 95 + Math.random() * 5,
          riskScore: Math.random() * 20,
          details: {
            accountMatch: true,
            amountMatch: true,
            timelineValid: true,
            fraudIndicators: [],
          },
        },
      },
      {
        weight: 0.2, // 20% chance
        result: {
          isVerified: false,
          amount: `R${(Math.random() * 30000 + 500).toFixed(2)}`,
          status: 'pending' as const,
          confidence: 40 + Math.random() * 30,
          riskScore: 60 + Math.random() * 30,
          details: {
            accountMatch: true,
            amountMatch: false,
            timelineValid: true,
            fraudIndicators: ['Payment still processing'],
          },
        },
      },
      {
        weight: 0.15, // 15% chance
        result: {
          isVerified: false,
          amount: 'R0.00',
          status: 'not_found' as const,
          confidence: 10 + Math.random() * 20,
          riskScore: 80 + Math.random() * 20,
          details: {
            accountMatch: false,
            amountMatch: false,
            timelineValid: false,
            fraudIndicators: ['Reference not found in bank records'],
          },
        },
      },
      {
        weight: 0.05, // 5% chance
        result: {
          isVerified: false,
          amount: `R${(Math.random() * 20000 + 100).toFixed(2)}`,
          status: 'failed' as const,
          confidence: 85 + Math.random() * 10,
          riskScore: 90 + Math.random() * 10,
          details: {
            accountMatch: false,
            amountMatch: false,
            timelineValid: false,
            fraudIndicators: ['Suspicious transaction pattern', 'Account mismatch'],
          },
        },
      },
    ];

    // Select scenario based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedScenario = scenarios[0];

    for (const scenario of scenarios) {
      cumulativeWeight += scenario.weight;
      if (random <= cumulativeWeight) {
        selectedScenario = scenario;
        break;
      }
    }

    return {
      ...selectedScenario.result,
      transactionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reference: parsedRef.reference,
      bank: parsedRef.bank,
    };
  }

  // Verify company/PO authenticity
  async verifyCompany(companyName: string, domain?: string): Promise<CompanyVerificationResult> {
    await this.delay(1500 + Math.random() * 2000);

    // Extract domain from email or text
    const extractedDomain = domain || this.extractDomain(companyName);
    
    // Simulate company verification scenarios
    const scenarios = [
      {
        weight: 0.65, // 65% chance - legitimate company
        result: {
          isVerified: true,
          status: 'active' as const,
          domainMatch: true,
          riskScore: Math.random() * 25,
          details: {
            registeredAddress: '123 Business Park, Johannesburg, 2000',
            directors: ['John Smith', 'Sarah Johnson'],
            businessType: 'Manufacturing',
            fraudAlerts: [],
          },
        },
      },
      {
        weight: 0.2, // 20% chance - suspicious domain
        result: {
          isVerified: false,
          status: 'active' as const,
          domainMatch: false,
          riskScore: 70 + Math.random() * 20,
          details: {
            registeredAddress: 'Address not verified',
            directors: [],
            businessType: 'Unknown',
            fraudAlerts: ['Domain mismatch with registered company'],
          },
        },
      },
      {
        weight: 0.1, // 10% chance - inactive company
        result: {
          isVerified: false,
          status: 'inactive' as const,
          domainMatch: false,
          riskScore: 85 + Math.random() * 15,
          details: {
            registeredAddress: 'Company deregistered',
            directors: [],
            businessType: 'Deregistered',
            fraudAlerts: ['Company no longer active'],
          },
        },
      },
      {
        weight: 0.05, // 5% chance - high risk/fraud
        result: {
          isVerified: false,
          status: 'suspended' as const,
          domainMatch: false,
          riskScore: 95 + Math.random() * 5,
          details: {
            registeredAddress: 'Flagged address',
            directors: ['Flagged individuals'],
            businessType: 'High Risk',
            fraudAlerts: ['Company flagged for fraudulent activity', 'Multiple fraud reports'],
          },
        },
      },
    ];

    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedScenario = scenarios[0];

    for (const scenario of scenarios) {
      cumulativeWeight += scenario.weight;
      if (random <= cumulativeWeight) {
        selectedScenario = scenario;
        break;
      }
    }

    return {
      ...selectedScenario.result,
      companyName,
      domain: extractedDomain || 'unknown.com',
      registrationNumber: selectedScenario.result.isVerified ? 
        `${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
    };
  }

  // Extract domain from text
  private extractDomain(text: string): string | null {
    const emailPattern = /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const domainPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    
    const emailMatch = text.match(emailPattern);
    if (emailMatch) return emailMatch[1];
    
    const domainMatch = text.match(domainPattern);
    if (domainMatch) return domainMatch[1];
    
    return null;
  }

  // Get linked bank accounts
  getLinkedAccounts(): BankAccount[] {
    return this.linkedAccounts;
  }

  // Link new bank account (mock)
  async linkBankAccount(accountNumber: string, bankName: string): Promise<boolean> {
    await this.delay(3000);
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      this.linkedAccounts.push({
        accountNumber: `****${accountNumber.slice(-4)}`,
        bankName,
        accountHolder: 'Your Business Account',
        isLinked: true,
      });
    }
    
    return success;
  }

  // Generate secure PIN
  generateSecurePIN(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate PIN format
  validatePIN(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  }

  // Get transaction history (mock)
  async getTransactionHistory(days: number = 7): Promise<any[]> {
    await this.delay(1000);
    
    const transactions = [];
    const now = Date.now();
    
    for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) {
      transactions.push({
        id: `txn_${Math.random().toString(36).substr(2, 9)}`,
        amount: `R${(Math.random() * 10000 + 100).toFixed(2)}`,
        reference: Math.floor(Math.random() * 1000000).toString(),
        bank: ['FNB', 'Standard Bank', 'ABSA', 'Nedbank'][Math.floor(Math.random() * 4)],
        status: ['cleared', 'pending'][Math.floor(Math.random() * 2)],
        date: new Date(now - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const bankAPI = new BankAPIService();