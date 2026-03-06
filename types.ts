
export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  trustScore: number;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  location: { lat: number; lng: number };
}

export interface Item {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerTrustScore: number;
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
  itemId: string;
  itemTitle: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: TransactionStatus;
  otpCode?: string;
}
