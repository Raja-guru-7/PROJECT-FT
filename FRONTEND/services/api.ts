
import { MOCK_ITEMS, MOCK_CURRENT_USER, MOCK_TRANSACTIONS } from '../mockData';
import { Item, Transaction, TransactionStatus, User } from '../types';

// In production, this would be your actual API URL
const BASE_URL = 'https://api.aroundu.network/v1';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // In production: return fetch(`${BASE_URL}${endpoint}`, options).then(r => r.json());
    console.log(`[API] ${options?.method || 'GET'} ${endpoint}`);
    return new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
  }

  // Auth & User
  async getCurrentUser(): Promise<User> {
    return MOCK_CURRENT_USER;
  }

  // Assets
  async getItems(filters: { lat?: number; lng?: number; radius?: number; query?: string; category?: string }): Promise<Item[]> {
    let items = [...MOCK_ITEMS];
    if (filters.query) {
      items = items.filter(i => i.title.toLowerCase().includes(filters.query!.toLowerCase()));
    }
    if (filters.category) {
      items = items.filter(i => i.category === filters.category);
    }
    return items;
  }

  async getItemById(id: string): Promise<Item | undefined> {
    return MOCK_ITEMS.find(i => i.id === id);
  }

  async createItem(formData: FormData): Promise<Item> {
    // Simulate multipart upload
    return MOCK_ITEMS[0];
  }

  // Transactions
  async getTransactions(role: 'RENTER' | 'OWNER'): Promise<Transaction[]> {
    return MOCK_TRANSACTIONS;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return MOCK_TRANSACTIONS.find(t => t.id === id);
  }

  async verifyOtp(txId: string, otp: string): Promise<boolean> {
    const tx = MOCK_TRANSACTIONS.find(t => t.id === txId);
    return otp === tx?.otpCode || otp === '1234';
  }

  async uploadHandoverProof(txId: string, videoBlob: Blob, type: 'OWNER' | 'RENTER'): Promise<void> {
    console.log(`[API] Uploading ${type} proof for ${txId}`);
  }

  async completeTransaction(txId: string): Promise<void> {
    console.log(`[API] Completing TX ${txId}`);
  }
}

export const api = new ApiService();
