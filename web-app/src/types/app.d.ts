export type UserType = {
  id: string;
  email: string;
  password: string;
  name: string;
  isEmailVerified: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  accountLockedUntil: string | null;
  lastLoginAt: string;
  lastLoginIp: string;
  oauthProvider: string;
  oauthId: string;
  profilePicture: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  twoFactorTempSecret: string;
  twoFactorBackupCodes: string[];
  emailVerificationToken: string;
  emailVerificationTokenExpires: string;
  passwordResetToken: string;
  passwordResetTokenExpires: string;
  tempAuthToken: string;
  tempAuthTokenExpires: string;
  createdAt: string;
  updatedAt: string;
};

export interface DashboardData {
  message: string;
  dashboard: {
    totalAccounts: number;
    totalServices: number;
    totalMonthlyCost: number;
    activeAlerts: number;
    criticalAlerts: number;
    potentialSavings: number;
    accounts: AccountDataType[];
    recentAlerts: any[];
  };
}

export type ConnectAwsAccountType = {
  id: string;
  name: string;
  status: string;
  totalServices: number;
  awsAccountId: string;
};

export type CollectionServicesDataType = {
  message: string;
  services: ServiceDataType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type ServiceDataType = {
  id: string;
  awsAccountId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  resourceId: string;
  resourceArn: string;
  serviceName: string;
  serviceType: string;
  region: string;
  configuration: object;
  tags: object | null;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  lastMonthCost: number;
  metrics: object | null;
  lastMetricsUpdate: Date | null;
  recommendations: object | null;
  lastStateChange: Date | null;
};

export type FetchAccountType = {
  message: string;
  account: ConnectAwsAccountType;
};
