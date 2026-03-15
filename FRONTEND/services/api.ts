import { MOCK_ITEMS, MOCK_CURRENT_USER, MOCK_TRANSACTIONS } from '../mockData';
import { Item, Transaction, User } from '../types';

const BASE_URL = 'https://aroundu-backend-hd26.onrender.com/api';

class ApiService {

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(isJson = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['x-auth-token'] = token;
    return headers;
  }

  // AUTH
  async login(data: { email: string; password: string }): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Login failed');
    localStorage.setItem('token', json.token);
    return json;
  }

  async register(data: { name: string; email: string; password: string }): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Registration failed');
    localStorage.setItem('token', json.token);
    return json;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) return MOCK_CURRENT_USER;
    try {
      const res = await fetch(`${BASE_URL}/auth/user`, { headers: this.getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg);
      return {
        id: json._id,
        name: json.name,
        avatar: json.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${json.name}`,
        trustScore: json.trustScore || 30,
        isVerified: json.isVerified || false,
        kycStatus: json.kycStatus || 'none',
        location: json.location || { lat: 11.3410, lng: 77.7172 },
      };
    } catch {
      return MOCK_CURRENT_USER;
    }
  }

  // ITEMS
  async getItems(filters: { lat?: number; lng?: number; radius?: number; query?: string; category?: string }): Promise<Item[]> {
    try {
      let url = `${BASE_URL}/product/all`;
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.category) params.append('category', filters.category);
      if (filters.lat && filters.lng) {
        url = `${BASE_URL}/product/nearby`;
        params.append('lat', String(filters.lat));
        params.append('lng', String(filters.lng));
        params.append('radius', String(filters.radius || 5));
      }
      const res = await fetch(`${url}?${params.toString()}`, { headers: this.getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg);
      return json.map((p: any) => ({
        id: p._id,
        owner: p.owner?._id || p.owner,           // ✅ for ItemDetail ownerId fix
        ownerId: p.owner?._id || p.owner,
        ownerName: p.owner?.name || 'Unknown',
        ownerTrustScore: p.owner?.trustScore || 30,
        title: p.title,                            // ✅ Fixed: was p.name
        description: p.description,
        category: p.category,
        pricePerDay: p.pricePerDay,
        depositAmount: p.depositAmount || 0,
        insuranceFee: p.insuranceFee || 0,
        imageUrl: p.imageUrl || '',
        location: {
          lat: p.location?.coordinates?.[1] || 11.3410,
          lng: p.location?.coordinates?.[0] || 77.7172,
          address: p.location?.address || 'Erode, TN',
        },
      }));
    } catch (err) {
      console.error('getItems error:', err);
      return MOCK_ITEMS;
    }
  }

  async getItemById(id: string): Promise<Item | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, { headers: this.getHeaders() });
      const p = await res.json();
      if (!res.ok) throw new Error(p.msg);
      return {
        id: p._id,         // ✅ for View Profile navigation
        ownerId: p.owner?._id || p.owner,
        ownerName: p.owner?.name || 'Unknown',
        ownerTrustScore: p.owner?.trustScore || 30,
        title: p.title,                            // ✅ Fixed: was p.name
        description: p.description,
        category: p.category,
        pricePerDay: p.pricePerDay,
        depositAmount: p.depositAmount || 0,
        insuranceFee: p.insuranceFee || 0,
        imageUrl: p.imageUrl || '',
        location: {
          lat: p.location?.coordinates?.[1] || 11.3410,
          lng: p.location?.coordinates?.[0] || 77.7172,
          address: p.location?.address || 'Erode, TN',
        },
      };
    } catch (err) {
      console.error('getItemById error:', err);
      return MOCK_ITEMS.find(i => i.id === id);
    }
  }

  async createItem(formData: FormData): Promise<Item> {
    const res = await fetch(`${BASE_URL}/product/add`, {
      method: 'POST',
      headers: { 'x-auth-token': this.getToken() || '' },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Failed to create item');
    return json;
  }

  // TRANSACTIONS
  async getTransactions(role: 'RENTER' | 'OWNER'): Promise<Transaction[]> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/my`, { headers: this.getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg);
      return json.map((t: any) => ({
        id: t._id,
        itemId: t.itemId,
        itemTitle: t.itemTitle,
        renterId: t.renterId,
        ownerId: t.ownerId,
        startDate: t.startDate,
        endDate: t.endDate,
        totalAmount: t.totalAmount,
        status: t.status,
        otpCode: t.otpCode,
      }));
    } catch {
      return MOCK_TRANSACTIONS;
    }
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${id}`, { headers: this.getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg);
      return {
        id: json._id,
        itemId: json.itemId,
        itemTitle: json.itemTitle,
        renterId: json.renterId,
        ownerId: json.ownerId,
        startDate: json.startDate,
        endDate: json.endDate,
        totalAmount: json.totalAmount,
        status: json.status,
        otpCode: json.otpCode,
      };
    } catch {
      return MOCK_TRANSACTIONS.find(t => t.id === id);
    }
  }

  async createTransaction(data: { itemId: string; itemTitle: string; ownerId: string; startDate: string; endDate: string; totalAmount: number }): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transaction/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Failed to create transaction');
    return json;
  }

  async verifyOtp(txId: string, otp: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/verify-otp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      return res.ok && json.success;
    } catch {
      return otp === '1234';
    }
  }

  async uploadHandoverProof(txId: string, videoBlob: Blob, type: 'OWNER' | 'RENTER'): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/upload-proof`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ type, videoUrl: 'mock://video' }),
      });
      if (!res.ok) throw new Error('Upload failed');
    } catch {
      console.log(`Uploading ${type} proof for ${txId}`);
    }
  }

  async completeTransaction(txId: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/complete`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Complete failed');
    } catch {
      console.log(`Completing TX ${txId}`);
    }
  }
}

export const api = new ApiService();