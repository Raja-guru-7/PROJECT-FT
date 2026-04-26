import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from "../src/firebase";

// 🔥 THE ULTIMATE FIX: Direct-aah Live Backend URL-ah potachu! 
// Fallback (localhost) ellam eduthutom.
const API_URL = 'https://aroundu-backend-hd26.onrender.com';

export const signInWithGoogle = async (): Promise<{ email: string; name: string; googleId: string; avatar: string; redirectTo: string; token?: string }> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  try {
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
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      localStorage.setItem('pendingUserId', data.userId);
      localStorage.setItem('tempGoogleData', JSON.stringify({
        email: user.email || '',
        name: user.displayName || '',
        googleId: user.uid,
        avatar: user.photoURL || ''
      }));

      return {
        email: user.email || '',
        name: user.displayName || '',
        googleId: user.uid,
        avatar: user.photoURL || '',
        redirectTo: data.redirectTo || '/kyc',
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