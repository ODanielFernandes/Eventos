import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      window.alert('Preencha e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      window.alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      window.alert('A confirmação da senha não confere.');
      return;
    }
    setSubmitting(true);
    try {
      await signup(email.trim(), password);
      window.alert('Cadastro concluído. Faça login para continuar.');
      navigate('/login', { replace: true });
    } catch (err) {
      window.alert(err.message ?? 'Não foi possível concluir o cadastro.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-4">Cadastro</h1>
      <form className="card bg-body-secondary border-secondary" onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="signup-email" className="form-label">
              E-mail
            </label>
            <input
              id="signup-email"
              type="email"
              className="form-control"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signup-password" className="form-label">
              Senha
            </label>
            <input
              id="signup-password"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signup-confirm" className="form-label">
              Confirmar senha
            </label>
            <input
              id="signup-confirm"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Criar conta'}
          </button>
          <p className="small text-secondary mt-3 mb-0 text-center">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
