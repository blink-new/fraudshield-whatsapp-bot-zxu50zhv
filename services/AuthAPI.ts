export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'staff';
  companyId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  vatNumber?: string;
  industry: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  bankAccounts: BankAccount[];
  ownerId: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  settings: {
    allowStaffPinGeneration: boolean;
    requireOwnerApproval: boolean;
    maxDailyTransactions: number;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
  };
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'current' | 'savings' | 'business';
  branchCode: string;
  isActive: boolean;
  isPrimary: boolean;
  linkedAt: string;
  lastVerified: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface AuthSession {
  user: User;
  company: Company;
  token: string;
  expiresAt: string;
}

class AuthAPI {
  private currentSession: AuthSession | null = null;

  // Authentication Methods
  async login(email: string, password: string): Promise<AuthSession> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock user data based on email
    const mockUsers = {
      'john@acmecorp.co.za': {
        id: 'user_001',
        email: 'john@acmecorp.co.za',
        firstName: 'John',
        lastName: 'Smith',
        role: 'owner' as const,
        companyId: 'comp_001',
        isActive: true,
        createdAt: '2024-01-15T08:00:00Z',
        lastLogin: new Date().toISOString(),
        permissions: ['verify_payments', 'manage_users', 'generate_pins', 'view_reports', 'manage_settings']
      },
      'sarah@acmecorp.co.za': {
        id: 'user_002',
        email: 'sarah@acmecorp.co.za',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'staff' as const,
        companyId: 'comp_001',
        isActive: true,
        createdAt: '2024-02-01T09:00:00Z',
        lastLogin: new Date().toISOString(),
        permissions: ['verify_payments', 'generate_pins']
      }
    };

    const mockCompanies = {
      'comp_001': {
        id: 'comp_001',
        name: 'ACME Corporation (Pty) Ltd',
        registrationNumber: '2019/123456/07',
        vatNumber: '4123456789',
        industry: 'Manufacturing',
        address: {
          street: '123 Business Park Drive',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '2001',
          country: 'South Africa'
        },
        contactInfo: {
          phone: '+27 11 123 4567',
          email: 'info@acmecorp.co.za',
          website: 'https://acmecorp.co.za'
        },
        bankAccounts: [
          {
            id: 'bank_001',
            bankName: 'FNB',
            accountNumber: '62123456789',
            accountType: 'business' as const,
            branchCode: '250655',
            isActive: true,
            isPrimary: true,
            linkedAt: '2024-01-15T10:00:00Z',
            lastVerified: '2024-01-20T14:30:00Z',
            verificationStatus: 'verified' as const
          },
          {
            id: 'bank_002',
            bankName: 'Standard Bank',
            accountNumber: '12345678901',
            accountType: 'current' as const,
            branchCode: '051001',
            isActive: true,
            isPrimary: false,
            linkedAt: '2024-02-01T11:00:00Z',
            lastVerified: '2024-02-01T11:30:00Z',
            verificationStatus: 'verified' as const
          }
        ],
        ownerId: 'user_001',
        isVerified: true,
        verificationStatus: 'verified' as const,
        createdAt: '2024-01-15T08:00:00Z',
        settings: {
          allowStaffPinGeneration: true,
          requireOwnerApproval: false,
          maxDailyTransactions: 50,
          notificationPreferences: {
            email: true,
            sms: true,
            whatsapp: true
          }
        }
      }
    };

    const user = mockUsers[email as keyof typeof mockUsers];
    const company = mockCompanies[user?.companyId as keyof typeof mockCompanies];

    if (!user || !company) {
      throw new Error('Invalid email or password');
    }

    const session: AuthSession = {
      user,
      company,
      token: `token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.currentSession = session;
    return session;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    registrationNumber: string;
    industry: string;
    phone: string;
  }): Promise<AuthSession> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const companyId = `comp_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    const user: User = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'owner',
      companyId,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      permissions: ['verify_payments', 'manage_users', 'generate_pins', 'view_reports', 'manage_settings']
    };

    const company: Company = {
      id: companyId,
      name: userData.companyName,
      registrationNumber: userData.registrationNumber,
      industry: userData.industry,
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa'
      },
      contactInfo: {
        phone: userData.phone,
        email: userData.email
      },
      bankAccounts: [],
      ownerId: userId,
      isVerified: false,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      settings: {
        allowStaffPinGeneration: true,
        requireOwnerApproval: false,
        maxDailyTransactions: 20,
        notificationPreferences: {
          email: true,
          sms: false,
          whatsapp: true
        }
      }
    };

    const session: AuthSession = {
      user,
      company,
      token: `token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.currentSession = session;
    return session;
  }

  async logout(): Promise<void> {
    this.currentSession = null;
  }

  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  hasPermission(permission: string): boolean {
    return this.currentSession?.user.permissions.includes(permission) || false;
  }

  // Company Management
  async updateCompanyProfile(updates: Partial<Company>): Promise<Company> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    // Simulate updating company profile
    this.currentSession.company = {
      ...this.currentSession.company,
      ...updates
    };

    return this.currentSession.company;
  }

  async addBankAccount(bankAccount: Omit<BankAccount, 'id' | 'linkedAt' | 'lastVerified'>): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const newAccount: BankAccount = {
      ...bankAccount,
      id: `bank_${Date.now()}`,
      linkedAt: new Date().toISOString(),
      lastVerified: new Date().toISOString()
    };

    this.currentSession.company.bankAccounts.push(newAccount);
    return newAccount;
  }

  async removeBankAccount(accountId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    this.currentSession.company.bankAccounts = this.currentSession.company.bankAccounts.filter(
      account => account.id !== accountId
    );
  }

  // User Management
  async inviteUser(email: string, role: 'staff'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.currentSession || this.currentSession.user.role !== 'owner') {
      throw new Error('Only company owners can invite users');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      firstName: '',
      lastName: '',
      role,
      companyId: this.currentSession.company.id,
      isActive: false, // Pending acceptance
      createdAt: new Date().toISOString(),
      lastLogin: '',
      permissions: role === 'staff' ? ['verify_payments', 'generate_pins'] : []
    };

    return newUser;
  }

  async getCompanyUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    // Mock company users
    return [
      this.currentSession.user,
      {
        id: 'user_002',
        email: 'sarah@acmecorp.co.za',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'staff',
        companyId: this.currentSession.company.id,
        isActive: true,
        createdAt: '2024-02-01T09:00:00Z',
        lastLogin: '2024-01-22T14:30:00Z',
        permissions: ['verify_payments', 'generate_pins']
      },
      {
        id: 'user_003',
        email: 'mike@acmecorp.co.za',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'staff',
        companyId: this.currentSession.company.id,
        isActive: false, // Pending invitation
        createdAt: '2024-01-20T16:00:00Z',
        lastLogin: '',
        permissions: ['verify_payments']
      }
    ];
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentSession || this.currentSession.user.role !== 'owner') {
      throw new Error('Only company owners can update user permissions');
    }

    // Mock update - in real implementation, this would update the database
    const users = await this.getCompanyUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.permissions = permissions;
    return user;
  }

  async deactivateUser(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentSession || this.currentSession.user.role !== 'owner') {
      throw new Error('Only company owners can deactivate users');
    }

    // Mock deactivation
  }
}

export const authAPI = new AuthAPI();