import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import * as S from '../styles/shared';

export const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess('Password reset email sent. Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.authPage}>
      <div style={S.authCard}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={S.brandTitle}>Reset password</h1>
          <p style={S.brandSub}>We'll send a link to your inbox</p>
        </div>

        {error   && <div style={S.alertBox('error')}>{error}</div>}
        {success && <div style={S.alertBox('success')}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={S.input(focused)}
              placeholder="you@example.com"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
            {loading ? 'Sending…' : 'Send reset email'}
          </button>
        </form>

        <p style={{ ...S.mutedText, marginTop:'1.5rem' }}>
          <Link to="/login"    style={S.linkStyle}>Back to sign in</Link>
          {' · '}
          <Link to="/register" style={S.linkStyle}>Create account</Link>
        </p>
      </div>
    </div>
  );
};