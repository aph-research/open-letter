'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      console.error('No token provided');
      setStatus('error');
      return;
    }
  
    console.log('Verifying token:', token);
    fetch(`/api/signatures?token=${token}`, {  // Changed: token in URL params
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
      // Removed body since token is in URL
    })
    .then(async res => {
      const data = await res.json();
      console.log('Verification response:', data);
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setStatus('success');
    })
    .catch(err => {
      console.error('Verification error:', err);
      setStatus('error');
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="max-w-md p-8 text-center">
        {status === 'loading' && <p>Verifying your signature...</p>}
        {status === 'success' && <p>Your signature has been verified. Thank you!</p>}
        {status === 'error' && <p>Verification failed. Please try again or contact support.</p>}
      </div>
    </div>
  );
}