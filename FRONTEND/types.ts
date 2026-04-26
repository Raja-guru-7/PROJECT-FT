export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  avatar: string;
  trustScore: number;
  isVerified: boolean;
  kycStatus: string;
  livenessStatus?: boolean;
  phoneVerified?: boolean;
  location: { lat: number; lng: number };
  successfulTransactions?: number;
  averageRating?: number;
  settings?: {

    biometricLogin: boolean;
    stealthMode: boolean;
    metadataEncryption: boolean;
    handoverAlerts: boolean;
    escrowSummaries: boolean;
  };
  paymentMethod?: {
    cardType: string;
    last4: string;
    expiry: string;
  };
  savedAssets?: string[];
}

export interface Item {
  id: string;
  ownerId: string;
  owner?: any;
  ownerName: string;
  ownerTrustScore: number;
  ownerAvatar?: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  insuranceFee: number;
  imageUrl: string;
  videoUrl?: string;
  location: { lat: number; lng: number; address: string };
  distance?: number;
  // No changes were made to the Item interface as the provided code edit does not specify any changes.
}

export enum TransactionStatus {
  REQUESTED = 'REQUESTED',
  ESCROW_HELD = 'ESCROW_HELD',
  HANDOVER_IN_PROGRESS = 'HANDOVER_IN_PROGRESS',
  ACTIVE = 'ACTIVE',
  RETURN_IN_PROGRESS = 'RETURN_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED'
}

export interface Transaction {
  id: string;
  _id?: string;
  itemId: string;
  itemTitle: string;
  renterId: string | { _id: string };
  ownerId: string | { _id: string };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: TransactionStatus | string;
  otpCode?: string;
  returnOtpCode?: string;
  ownerVideoUrl?: string;
  renterVideoUrl?: string;
}

export interface Item {
  id: string;
  ownerId: string;
  owner?: any;
  ownerName: string;
  ownerTrustScore: number;
  ownerAvatar?: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  insuranceFee: number;
  imageUrl: string;
  videoUrl?: string;
  paymentMode?: string;  // 
  location: { lat: number; lng: number; address: string };
  distance?: number;
}