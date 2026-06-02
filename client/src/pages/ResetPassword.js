import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import * as S from '../styles/shared';

const InvalidLink = () => (
  <div style={S.authPage}>
    <div style={S.authCard}>
      <h1 style={{ ...S.brandTitle, marginBottom:'12px' }}>Invalid link</h1>
      <p style={{ ...S.brandSub, marginBottom:'1.5rem' }}>
        This password reset link is invalid or has expired.
      </p>
      <Link to="/forgot-password" style={S.linkStyle}>Request a new reset link →</Link>
    </div>
  </div>
);

export const ResetPassword = () => {
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get('token');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState('');
  const navigate                    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm)      return setError('Passwords do not match');
    if (password.length < 6)       return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess('Password reset successfully! Redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <InvalidLink />;

  return (
    <div style={S.authPage}>
      <div style={S.authCard}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={S.brandTitle}>Create new password</h1>
          <p style={S.brandSub}>Choose something strong</p>
        </div>

        {error   && <div style={S.alertBox('error')}>{error}</div>}
        {success && <div style={S.alertBox('success')}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { id:'password', label:'New password',      value:password, set:setPassword },
            { id:'confirm',  label:'Confirm password',  value:confirm,  set:setConfirm  },
          ].map(({ id, label, value, set }) => (
            <div key={id} style={S.fieldGroup}>
              <label style={S.label}>{label}</label>
              <input
                type="password" value={value}
                onChange={(e) => set(e.target.value)}
                onFocus={() => setFocused(id)}
                onBlur={() => setFocused('')}
                style={S.input(focused === id)}
                placeholder="••••••••"
                required
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p style={S.mutedText}>
          <Link to="/login" style={S.linkStyle}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};