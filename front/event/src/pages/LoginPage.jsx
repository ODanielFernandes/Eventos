import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      window.alert('Informe e-mail e senha.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      window.alert(err.message ?? 'Falha no login.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Entrar</h1>
      <form className="card bg-body-secondary border-secondary" onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="login-password" className="form-label">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="small text-secondary mt-3 mb-0 text-center">
            Não tem conta? <Link to="/signup">Cadastre-se</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
