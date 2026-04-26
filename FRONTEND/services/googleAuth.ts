import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from "../src/firebase"; // Unga path thevaiya padi maathikonga

// 🔥 THE FIX: Dynamic API URL (Vite environment variable support)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const signInWithGoogle = async (): Promise<{ email: string; name: string; googleId: string; avatar: string; redirectTo: string; token?: string }> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Call backend to create/update user and get MongoDB userId
  try {
    // 🔥 THE FIX: Hardcoded localhost-ah thookittu API_URL variable pottachu
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email || '',
        name: user.displayName || '',
        googleId: user.uid,
        avatar: user.photoURL || ''
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save token if available (for verified users)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Save MongoDB userId for KYC
      localStorage.setItem('pendingUserId', data.userId);
      localStorage.setItem('tempGoogleData', JSON.stringify({
        email: user.email || '',
        name: user.displayName || '',
        googleId: user.uid,
        avatar: user.photoURL || ''
      }));

      // Return redirectTo for frontend navigation
      return {
        email: user.email || '',
        name: user.displayName || '',
        googleId: user.uid,
        avatar: user.photoURL || '',
        redirectTo: data.redirectTo || '/kyc-verification',
        token: data.token
      };
    } else {
      throw new Error(data.msg || 'Google auth failed');
    }
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};