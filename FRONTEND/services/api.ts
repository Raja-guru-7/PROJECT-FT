import { MOCK_ITEMS, MOCK_CURRENT_USER, MOCK_TRANSACTIONS } from '../mockData';
import { Item, Transaction, User } from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://aroundu-backend-hd26.onrender.com') + '/api';

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
  async login(data: { email: string; password: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Login failed');
    return json;
  }

  // ── NEW: Send OTP to email for login ────────────────────────────────────
  async sendLoginOtp(email: string, password: string): Promise<{ msg: string }> {
    const res = await fetch(`${BASE_URL}/auth/send-login-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Failed to send OTP');
    return json;
  }

  // ── UPDATED: Verify login OTP — accepts (email, otp) separately ─────────
  async verifyLoginOtp(email: string, otp: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/verify-login-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'OTP verification failed');
    if (json.token) {
      localStorage.setItem('token', json.token);
      try {
        const user = await this.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to store user data:', e);
      }
    }
    return json;
  }

  async sendRegistrationOtp(email: string, name: string): Promise<{ msg: string }> {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) {
      const text = await res.text();
      let msg = 'Failed to send OTP';
      try {
        const json = JSON.parse(text);
        msg = json.msg || msg;
      } catch (e) {
        msg = `Error ${res.status}: ${text.substring(0, 100)}`;
      }
      throw new Error(msg);
    }
    return await res.json();
  }

  async register(data: { name: string; email: string; password: string; otp: string }): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Registration failed');
    localStorage.setItem('token', json.token);
    try {
      const user = await this.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to store user data during registration:', e);
    }
    return json;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUserId');
  }

  async signInWithGoogle(userData: { email: string; name: string; googleId: string; avatar: string }): Promise<{ token: string; userId: string }> {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Google sign-in failed');
    localStorage.setItem('token', json.token);
    if (json.token) {
      try {
        const user = await this.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to store user data during Google sign-in:', e);
      }
    }
    return json;
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
        settings: json.settings,
        paymentMethod: json.paymentMethod,
        savedAssets: json.savedAssets || [],
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
      params.append('status', 'available');
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
        owner: p.owner,
        ownerId: p.owner?._id || p.owner,
        ownerName: p.owner?.name || 'Unknown',
        ownerTrustScore: p.owner?.trustScore || 30,
        ownerAvatar: p.owner?.avatar || '',
        title: p.title,
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
        id: p._id,
        owner: p.owner,
        ownerId: p.owner?._id || p.owner,
        ownerName: p.owner?.name || 'Unknown',
        ownerTrustScore: p.owner?.trustScore || 30,
        ownerAvatar: p.owner?.avatar || '',
        title: p.title,
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
        ownerVideoUrl: t.ownerVideoUrl || '',
        renterVideoUrl: t.renterVideoUrl || '',
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
        ownerVideoUrl: json.ownerVideoUrl || '',
        renterVideoUrl: json.renterVideoUrl || '',
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
      return false;
    }
  }

  async uploadHandoverProof(txId: string, videoBlob: Blob, type: 'OWNER' | 'RENTER'): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, `${type.toLowerCase()}-proof.webm`);
      formData.append('type', type);
      const res = await fetch(`${BASE_URL}/transaction/${txId}/upload-proof`, {
        method: 'POST',
        headers: { 'x-auth-token': this.getToken() || '' },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
    } catch (err) {
      console.error(`uploadHandoverProof error:`, err);
    }
  }

  async completeTransaction(txId: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/complete`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Complete failed');
    } catch (err) {
      console.error(`completeTransaction error:`, err);
    }
  }

  async requestReturn(txId: string): Promise<{ success: boolean; msg?: string; returnOtpCode?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/request-return`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Request return failed');
      return { success: true, msg: json.msg, returnOtpCode: json.returnOtpCode };
    } catch (err) {
      console.error(`requestReturn error:`, err);
      return { success: false, msg: 'Failed to request return' };
    }
  }

  async completeReturn(txId: string, otp: string): Promise<{ success: boolean; msg?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/complete-return`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Return completion failed');
      return { success: true, msg: json.msg };
    } catch (err) {
      console.error(`completeReturn error:`, err);
      return { success: false, msg: 'Failed to complete return' };
    }
  }

  async initiateReturn(txId: string): Promise<{ success: boolean; msg?: string; returnOtpCode?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/transaction/${txId}/initiate-return`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Initiate return failed');
      return { success: true, msg: json.msg, returnOtpCode: json.returnOtpCode || '123456' };
    } catch (err) {
      console.error(`initiateReturn error:`, err);
      return { success: false, msg: 'Failed to initiate return', returnOtpCode: '123456' };
    }
  }

  async toggleSaveAsset(itemId: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/user/toggle-save/${itemId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Toggle save failed');
      return json;
    } catch (err) {
      console.error(`toggleSaveAsset error:`, err);
    }
  }

  async getSavedAssets(): Promise<Item[]> {
    try {
      const res = await fetch(`${BASE_URL}/user/saved-assets`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Failed to fetch saved assets');
      return json.map((p: any) => ({
        id: p._id,
        owner: p.owner,
        ownerId: p.owner?._id || p.owner,
        ownerName: p.owner?.name || 'Unknown',
        ownerTrustScore: p.owner?.trustScore || 30,
        ownerAvatar: p.owner?.avatar || '',
        title: p.title,
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
      console.error(`getSavedAssets error:`, err);
      return [];
    }
  }
}

export const api = new ApiService();