// Document Validation API with ML/OCR and Registry Matching
export interface DocumentValidationResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    companyName?: string;
    registrationNumber?: string;
    vatNumber?: string;
    bankDetails?: {
      accountNumber?: string;
      branchCode?: string;
      bankName?: string;
    };
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    documentType?: 'PO' | 'RFQ' | 'Invoice' | 'PoP' | 'EFT' | 'Unknown';
    amount?: number;
    currency?: string;
    date?: string;
    reference?: string;
  };
  validationChecks: {
    ocrQuality: number;
    companyRegistration: {
      status: 'verified' | 'not_found' | 'suspended' | 'error';
      cipciMatch: boolean;
      registrationDate?: string;
      directors?: string[];
    };
    domainValidation: {
      status: 'verified' | 'suspicious' | 'not_found' | 'error';
      whoisMatch: boolean;
      domainAge?: number;
      registrar?: string;
    };
    bankValidation: {
      status: 'verified' | 'invalid' | 'suspicious' | 'error';
      safpsCheck: boolean;
      accountExists?: boolean;
      branchValid?: boolean;
    };
    fraudIndicators: string[];
  };
  riskScore: number;
  recommendations: string[];
}

export interface RegistryData {
  cipc: {
    companyName: string;
    registrationNumber: string;
    status: 'active' | 'suspended' | 'deregistered';
    registrationDate: string;
    directors: string[];
    address: string;
  };
  whois: {
    domain: string;
    registrar: string;
    creationDate: string;
    expirationDate: string;
    nameServers: string[];
    registrantOrg?: string;
  };
  safps: {
    accountNumber: string;
    branchCode: string;
    bankName: string;
    accountType: string;
    status: 'active' | 'closed' | 'frozen';
  };
}

class DocumentValidationAPI {
  private static instance: DocumentValidationAPI;
  private ocrEngine: any; // Simulated OCR engine
  private mlModel: any; // Simulated ML model

  private constructor() {
    this.initializeMLModels();
  }

  public static getInstance(): DocumentValidationAPI {
    if (!DocumentValidationAPI.instance) {
      DocumentValidationAPI.instance = new DocumentValidationAPI();
    }
    return DocumentValidationAPI.instance;
  }

  private initializeMLModels() {
    // Simulate ML model initialization
    this.ocrEngine = {
      confidence: 0.95,
      languages: ['en', 'af'],
    };
    this.mlModel = {
      documentClassifier: true,
      fraudDetection: true,
      confidenceThreshold: 0.8,
    };
  }

  // Main document validation function
  async validateDocument(
    documentUri: string,
    documentType?: string
  ): Promise<DocumentValidationResult> {
    try {
      // Step 1: OCR Processing
      const ocrResult = await this.performOCR(documentUri);
      
      // Step 2: Extract structured data using ML
      const extractedData = await this.extractStructuredData(ocrResult.text, documentType);
      
      // Step 3: Registry validations
      const validationChecks = await this.performRegistryValidations(extractedData);
      
      // Step 4: Calculate risk score
      const riskScore = this.calculateRiskScore(extractedData, validationChecks);
      
      // Step 5: Generate recommendations
      const recommendations = this.generateRecommendations(validationChecks, riskScore);

      return {
        isValid: riskScore < 30 && validationChecks.companyRegistration.status === 'verified',
        confidence: ocrResult.confidence,
        extractedData,
        validationChecks,
        riskScore,
        recommendations,
      };
    } catch (error) {
      console.error('Document validation error:', error);
      throw new Error('Failed to validate document');
    }
  }

  // OCR Processing with confidence scoring
  private async performOCR(documentUri: string): Promise<{ text: string; confidence: number }> {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different document types and OCR results
    const mockOCRResults = {
      'po_document': {
        text: `
          PURCHASE ORDER
          ABC Manufacturing (Pty) Ltd
          Registration: 2019/123456/07
          VAT: 4123456789
          
          Email: orders@abcmanufacturing.co.za
          Phone: +27 11 123 4567
          Address: 123 Industrial Ave, Johannesburg, 2001
          
          PO Number: PO-2024-001234
          Date: 2024-01-15
          
          Banking Details:
          Account: 1234567890
          Branch: 632005
          Bank: First National Bank
          
          Total Amount: R 25,750.00
          
          Supplier: XYZ Supplies
          Delivery Date: 2024-01-30
        `,
        confidence: 0.94
      },
      'rfq_document': {
        text: `
          REQUEST FOR QUOTATION
          TechCorp Solutions
          Reg No: 2020/987654/07
          
          Contact: procurement@techcorp.co.za
          Tel: 021 555 0123
          
          RFQ-2024-0567
          Date: 2024-01-20
          
          Required: IT Equipment
          Quantity: 50 units
          Budget: R 150,000
          
          Closing Date: 2024-02-05
        `,
        confidence: 0.91
      },
      'pop_document': {
        text: `
          PROOF OF PAYMENT
          
          From: Standard Bank
          Reference: SB240115001234
          Date: 2024-01-15 14:32
          
          From Account: ****7890
          To Account: 1234567890
          Branch: 051001
          
          Amount: R 12,500.00
          Description: Payment for Invoice INV-2024-001
          
          Transaction Successful
          Balance: R 45,230.15
        `,
        confidence: 0.96
      }
    };

    // Determine document type based on URI or content
    const documentKey = documentUri.includes('po') ? 'po_document' : 
                       documentUri.includes('rfq') ? 'rfq_document' : 'pop_document';
    
    return mockOCRResults[documentKey] || mockOCRResults['po_document'];
  }

  // ML-based structured data extraction
  private async extractStructuredData(text: string, documentType?: string): Promise<any> {
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const extractedData: any = {
      documentType: this.classifyDocument(text),
    };

    // Extract company information
    const companyMatch = text.match(/([A-Z][a-zA-Z\s&()]+(?:Pty|Ltd|CC|Inc)[^a-zA-Z]*)/);
    if (companyMatch) {
      extractedData.companyName = companyMatch[1].trim();
    }

    // Extract registration number
    const regMatch = text.match(/(?:Registration|Reg\s*No|Reg):\s*(\d{4}\/\d{6}\/\d{2})/i);
    if (regMatch) {
      extractedData.registrationNumber = regMatch[1];
    }

    // Extract VAT number
    const vatMatch = text.match(/VAT:\s*(\d{10})/i);
    if (vatMatch) {
      extractedData.vatNumber = vatMatch[1];
    }

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      extractedData.contactInfo = { email: emailMatch[1] };
    }

    // Extract bank details
    const accountMatch = text.match(/Account:\s*(\d{8,12})/i);
    const branchMatch = text.match(/Branch:\s*(\d{6})/i);
    const bankMatch = text.match(/Bank:\s*([A-Za-z\s]+Bank[A-Za-z\s]*)/i);
    
    if (accountMatch || branchMatch || bankMatch) {
      extractedData.bankDetails = {
        accountNumber: accountMatch?.[1],
        branchCode: branchMatch?.[1],
        bankName: bankMatch?.[1]?.trim(),
      };
    }

    // Extract amount
    const amountMatch = text.match(/(?:Amount|Total):\s*R\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      extractedData.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      extractedData.currency = 'ZAR';
    }

    // Extract reference
    const refMatch = text.match(/(?:Reference|Ref|PO|RFQ):\s*([A-Z0-9-]+)/i);
    if (refMatch) {
      extractedData.reference = refMatch[1];
    }

    // Extract date
    const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      extractedData.date = dateMatch[1];
    }

    return extractedData;
  }

  // Document classification using ML
  private classifyDocument(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('purchase order') || lowerText.includes('po number')) {
      return 'PO';
    } else if (lowerText.includes('request for quotation') || lowerText.includes('rfq')) {
      return 'RFQ';
    } else if (lowerText.includes('proof of payment') || lowerText.includes('transaction successful')) {
      return 'PoP';
    } else if (lowerText.includes('eft') || lowerText.includes('electronic transfer')) {
      return 'EFT';
    } else if (lowerText.includes('invoice')) {
      return 'Invoice';
    }
    
    return 'Unknown';
  }

  // Registry validations against CIPC, SAFPS, WHOIS
  private async performRegistryValidations(extractedData: any): Promise<any> {
    // Simulate registry API calls
    await new Promise(resolve => setTimeout(resolve, 3000));

    const validationChecks: any = {
      ocrQuality: 0.94,
      companyRegistration: await this.validateWithCIPC(extractedData),
      domainValidation: await this.validateWithWHOIS(extractedData),
      bankValidation: await this.validateWithSAFPS(extractedData),
      fraudIndicators: [],
    };

    // Add fraud indicators based on validation results
    if (validationChecks.companyRegistration.status !== 'verified') {
      validationChecks.fraudIndicators.push('Company not found in CIPC registry');
    }
    
    if (validationChecks.domainValidation.status === 'suspicious') {
      validationChecks.fraudIndicators.push('Domain registration suspicious');
    }
    
    if (validationChecks.bankValidation.status === 'invalid') {
      validationChecks.fraudIndicators.push('Invalid bank account details');
    }

    return validationChecks;
  }

  // CIPC Registry Validation
  private async validateWithCIPC(extractedData: any): Promise<any> {
    if (!extractedData.companyName && !extractedData.registrationNumber) {
      return { status: 'error', cipciMatch: false };
    }

    // Mock CIPC database
    const cipciDatabase = [
      {
        companyName: 'ABC Manufacturing (Pty) Ltd',
        registrationNumber: '2019/123456/07',
        status: 'active',
        registrationDate: '2019-03-15',
        directors: ['John Smith', 'Mary Johnson'],
      },
      {
        companyName: 'TechCorp Solutions',
        registrationNumber: '2020/987654/07',
        status: 'active',
        registrationDate: '2020-08-22',
        directors: ['David Wilson', 'Sarah Brown'],
      },
    ];

    const match = cipciDatabase.find(company => 
      company.companyName.toLowerCase().includes(extractedData.companyName?.toLowerCase()) ||
      company.registrationNumber === extractedData.registrationNumber
    );

    if (match) {
      return {
        status: 'verified',
        cipciMatch: true,
        registrationDate: match.registrationDate,
        directors: match.directors,
      };
    }

    return {
      status: 'not_found',
      cipciMatch: false,
    };
  }

  // WHOIS Domain Validation
  private async validateWithWHOIS(extractedData: any): Promise<any> {
    const email = extractedData.contactInfo?.email;
    if (!email) {
      return { status: 'error', whoisMatch: false };
    }

    const domain = email.split('@')[1];
    
    // Mock WHOIS database
    const whoisDatabase = [
      {
        domain: 'abcmanufacturing.co.za',
        registrar: 'ZACR',
        creationDate: '2019-04-01',
        registrantOrg: 'ABC Manufacturing (Pty) Ltd',
      },
      {
        domain: 'techcorp.co.za',
        registrar: 'ZACR',
        creationDate: '2020-09-01',
        registrantOrg: 'TechCorp Solutions',
      },
    ];

    const match = whoisDatabase.find(record => record.domain === domain);
    
    if (match) {
      const domainAge = Math.floor((Date.now() - new Date(match.creationDate).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        status: domainAge > 90 ? 'verified' : 'suspicious',
        whoisMatch: true,
        domainAge,
        registrar: match.registrar,
      };
    }

    return {
      status: 'not_found',
      whoisMatch: false,
    };
  }

  // SAFPS Bank Validation
  private async validateWithSAFPS(extractedData: any): Promise<any> {
    const bankDetails = extractedData.bankDetails;
    if (!bankDetails?.accountNumber || !bankDetails?.branchCode) {
      return { status: 'error', safpsCheck: false };
    }

    // Mock SAFPS database
    const safpsDatabase = [
      {
        accountNumber: '1234567890',
        branchCode: '632005',
        bankName: 'First National Bank',
        status: 'active',
      },
      {
        accountNumber: '9876543210',
        branchCode: '051001',
        bankName: 'Standard Bank',
        status: 'active',
      },
    ];

    const match = safpsDatabase.find(account => 
      account.accountNumber === bankDetails.accountNumber &&
      account.branchCode === bankDetails.branchCode
    );

    if (match) {
      return {
        status: 'verified',
        safpsCheck: true,
        accountExists: true,
        branchValid: true,
      };
    }

    return {
      status: 'invalid',
      safpsCheck: false,
      accountExists: false,
      branchValid: false,
    };
  }

  // Risk score calculation
  private calculateRiskScore(extractedData: any, validationChecks: any): number {
    let riskScore = 0;

    // OCR quality impact
    if (validationChecks.ocrQuality < 0.8) riskScore += 20;
    else if (validationChecks.ocrQuality < 0.9) riskScore += 10;

    // Company registration impact
    if (validationChecks.companyRegistration.status === 'not_found') riskScore += 40;
    else if (validationChecks.companyRegistration.status === 'suspended') riskScore += 60;
    else if (validationChecks.companyRegistration.status === 'error') riskScore += 30;

    // Domain validation impact
    if (validationChecks.domainValidation.status === 'suspicious') riskScore += 25;
    else if (validationChecks.domainValidation.status === 'not_found') riskScore += 35;

    // Bank validation impact
    if (validationChecks.bankValidation.status === 'invalid') riskScore += 45;
    else if (validationChecks.bankValidation.status === 'suspicious') riskScore += 30;

    // Additional fraud indicators
    riskScore += validationChecks.fraudIndicators.length * 15;

    return Math.min(riskScore, 100);
  }

  // Generate recommendations based on validation results
  private generateRecommendations(validationChecks: any, riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('🚨 HIGH RISK: Do not proceed with transaction');
      recommendations.push('Contact customer directly using verified contact details');
    } else if (riskScore > 40) {
      recommendations.push('⚠️ MEDIUM RISK: Additional verification required');
      recommendations.push('Request additional documentation');
    } else if (riskScore > 20) {
      recommendations.push('✅ LOW RISK: Proceed with caution');
      recommendations.push('Monitor transaction closely');
    } else {
      recommendations.push('✅ VERIFIED: Safe to proceed');
    }

    if (validationChecks.companyRegistration.status !== 'verified') {
      recommendations.push('Verify company registration independently');
    }

    if (validationChecks.domainValidation.status === 'suspicious') {
      recommendations.push('Domain appears recently registered - verify legitimacy');
    }

    if (validationChecks.bankValidation.status === 'invalid') {
      recommendations.push('Bank details invalid - request correct banking information');
    }

    return recommendations;
  }
}

export default DocumentValidationAPI.getInstance();