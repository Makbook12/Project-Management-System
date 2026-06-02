import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as S from '../styles/shared';

export const Register = () => {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name:'name',     label:'Full name',        type:'text',     placeholder:'Jane Doe' },
    { name:'email',    label:'Email',             type:'email',    placeholder:'you@example.com' },
    { name:'password', label:'Password',          type:'password', hint:'Min. 6 characters' },
    { name:'confirm',  label:'Confirm password',  type:'password' },
  ];

  return (
    <div style={S.authPage}>
      <div style={S.authCard}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={S.brandTitle}>Create account</h1>
          <p style={S.brandSub}>Join and start managing projects</p>
        </div>

        {error && <div style={S.alertBox('error')}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type, placeholder, hint }) => (
            <div key={name} style={S.fieldGroup}>
              <label style={S.label}>
                {label}{' '}
                {hint && <span style={S.labelHint}>({hint})</span>}
              </label>
              <input
                type={type} name={name} value={form[name]}
                onChange={update} placeholder={placeholder}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused('')}
                style={S.input(focused === name)}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={S.submitBtn(loading)}
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p style={S.mutedText}>
          Already have an account?{' '}
          <Link to="/login" style={S.linkStyle}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};