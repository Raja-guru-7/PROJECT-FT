
import { Item, User, Transaction, TransactionStatus } from './types';

export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  name: 'R G',
  avatar: 'https://picsum.photos/seed/alex/200',
  trustScore: 99,
  isVerified: true,
  kycStatus: 'VERIFIED',
  location: { lat: 40.7128, lng: -74.0060 }
};

export const MOCK_ITEMS: Item[] = [
  {
    id: 'item-1',
    ownerId: 'owner-1',
    ownerName: 'Sarah Miller',
    ownerTrustScore: 98,
    title: 'Sony A7III Professional Camera',
    description: 'Barely used mirrorless camera with 24-70mm lens. Great for high-end photography.',
    category: 'Electronics',
    pricePerDay: 450,
    depositAmount: 2000,
    insuranceFee: 150,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7150, lng: -74.0080, address: 'Tribeca District' }
  },
  {
    id: 'item-2',
    ownerId: 'owner-2',
    ownerName: 'Marcus Chen',
    ownerTrustScore: 85,
    title: 'Heavy Duty Power Drill Set',
    description: 'DeWalt brushless drill with 2 batteries and charger. Powerful and reliable for DIY projects.',
    category: 'Tools',
    pricePerDay: 150,
    depositAmount: 500,
    insuranceFee: 50,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7110, lng: -74.0100, address: 'South Financial' }
  },
  {
    id: 'item-3',
    ownerId: 'owner-3',
    ownerName: 'Elena Rodriguez',
    ownerTrustScore: 96,
    title: '4-Person Waterproof Tent',
    description: 'High-quality camping tent, easy setup, used only once. Perfect for weekend mountain trips.',
    category: 'Camping',
    pricePerDay: 250,
    depositAmount: 1000,
    insuranceFee: 100,
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7180, lng: -74.0000, address: 'East Side Hub' }
  },
  {
    id: 'item-4',
    ownerId: 'user-1',
    ownerName: 'R G',
    ownerTrustScore: 99,
    title: 'Mountain Bike X-200',
    description: 'Perfect for local trails. Well maintained, includes helmet and lock for extra safety.',
    category: 'Vehicle',
    pricePerDay: 350,
    depositAmount: 1500,
    insuranceFee: 120,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7130, lng: -74.0050, address: 'SoHo Junction' }
  },
  {
    id: 'item-5',
    ownerId: 'owner-5',
    ownerName: 'James Wilson',
    ownerTrustScore: 92,
    title: 'DJI Mavic Air 2 Drone',
    description: '4K camera drone with fly more combo. Excellent for breathtaking aerial cinematography.',
    category: 'Media',
    pricePerDay: 550,
    depositAmount: 3000,
    insuranceFee: 200,
    imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7200, lng: -74.0020, address: 'Greenwich Center' }
  },
 
  {
    id: 'item-7',
    ownerId: 'owner-7',
    ownerName: 'Liam O’Brien',
    ownerTrustScore: 89,
    title: 'Professional Steam Cleaner',
    description: 'Multi-purpose steam cleaner for deep cleaning carpets and professional upholstery care.',
    category: 'Tools',
    pricePerDay: 300,
    depositAmount: 1200,
    insuranceFee: 80,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7105, lng: -74.0040, address: 'Bridges District' }
  },
  
  {
    id: 'item-9',
    ownerId: 'owner-9',
    ownerName: 'David Zhang',
    ownerTrustScore: 82,
    title: 'Electric Pressure Washer',
    description: 'High-pressure 2000 PSI washer. Ideal for cleaning patios, cars, and home siding.',
    category: 'Tools',
    pricePerDay: 220,
    depositAmount: 700,
    insuranceFee: 60,
    imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7160, lng: -73.9980, address: 'East Side Pier' }
  },
  {
    id: 'item-10',
    ownerId: 'owner-10',
    ownerName: 'Chloe Bennett',
    ownerTrustScore: 95,
    title: 'Compact Camping Stove',
    description: 'Ultralight and fuel-efficient stove. Perfect for neighborhood backpackers.',
    category: 'Camping',
    pricePerDay: 120,
    depositAmount: 400,
    insuranceFee: 40,
    imageUrl: 'https://images.unsplash.com/photo-1536411396596-afed9fa3c1b2?auto=format&fit=crop&q=80&w=800',
    location: { lat: 40.7191, lng: -73.9973, address: 'Central Plaza' }
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    itemId: 'item-1',
    itemTitle: 'Sony A7III Professional Camera',
    renterId: 'user-1',
    ownerId: 'owner-1',
    startDate: '2023-10-25',
    endDate: '2023-10-27',
    totalAmount: 1050,
    status: TransactionStatus.HANDOVER_IN_PROGRESS,
    otpCode: '8824'
  },
  {
    id: 'tx-2',
    itemId: 'item-2',
    itemTitle: 'Heavy Duty Power Drill Set',
    renterId: 'user-1',
    ownerId: 'owner-2',
    startDate: '2023-10-20',
    endDate: '2023-10-22',
    totalAmount: 350,
    status: TransactionStatus.ACTIVE,
    otpCode: '1234'
  },
 
];
