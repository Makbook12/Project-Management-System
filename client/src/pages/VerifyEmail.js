import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import * as S from '../styles/shared';

const spinner = {
  width:'40px', height:'40px', borderRadius:'50%',
  border:'3px solid rgba(255,255,255,0.1)',
  borderTopColor:'#818cf8',
  animation:'spin 0.8s linear infinite',
  margin:'0 auto 1rem',
};

export const VerifyEmail = () => {
  const [searchParams]            = useSearchParams();
  const token                     = searchParams.get('token');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const navigate                  = useNavigate();

  useEffect(() => {
    if (!token) { setError('Invalid verification link'); setLoading(false); return; }

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setSuccess('Email verified! Redirecting…');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setError(err.response?.data?.msg || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div style={S.authPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.authCard}>
        <h1 style={{ ...S.brandTitle, marginBottom:'1.5rem' }}>Email verification</h1>

        {loading && (
          <div style={{ textAlign:'center', padding:'1rem 0' }}>
            <div style={spinner} />
            <p style={S.brandSub}>Verifying your email…</p>
          </div>
        )}

        {!loading && error && (
          <>
            <div style={S.alertBox('error')}>{error}</div>
            <p style={S.mutedText}>
              <Link to="/register" style={S.linkStyle}>Try registering again</Link>
              {' · '}
              <Link to="/login" style={S.linkStyle}>Back to sign in</Link>
            </p>
          </>
        )}

        {!loading && success && (
          <>
            <div style={S.alertBox('success')}>{success}</div>
            <p style={S.mutedText}>
              <Link to="/dashboard" style={S.linkStyle}>Go to dashboard →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};