import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/redesign/App';
import { AuthContext } from '../src/auth/authContext';

export function verifyAuthScreens() {
  const previousWindow = globalThis.window;
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  try {
    const auth = { loading: false, user: null, configured: true, cancelRecovery: () => {} };
    const reset = renderToStaticMarkup(<AuthContext.Provider value={{ ...auth, recovering: true }}><App /></AuthContext.Provider>);
    if (!reset.includes('Choose a new password.') || reset.includes('Welcome back.')) throw new Error('Signed-out reset links must show the password-reset form.');
    const login = renderToStaticMarkup(<AuthContext.Provider value={{ ...auth, recovering: false }}><App /></AuthContext.Provider>);
    if (!login.includes('Welcome back.') || login.includes('Choose a new password.')) throw new Error('Ordinary signed-out visits must show login.');
    const success = renderToStaticMarkup(<AuthContext.Provider value={{ ...auth, recovering: false, notice: 'Password updated. Sign in with your new password.' }}><App /></AuthContext.Provider>);
    if (!success.includes('Password updated.')) throw new Error('A successful reset must explain the next step.');
    return '3 authentication screen regressions passed';
  } finally { globalThis.window = previousWindow; }
}
