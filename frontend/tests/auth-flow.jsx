import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/redesign/App';
import { AuthContext } from '../src/auth/authContext';

export function verifyAuthScreens() {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { pathname: '/' }, matchMedia: () => ({ matches: false }) };
  const auth = { loading: false, user: null, configured: true, cancelRecovery: () => {} };
  const render = (path, overrides = {}) => {
    globalThis.window.location.pathname = path;
    return renderToStaticMarkup(<AuthContext.Provider value={{ ...auth, ...overrides }}><App /></AuthContext.Provider>);
  };
  try {
    const landing = render('/');
    if (!landing.includes('Less last-minute.') || landing.includes('Welcome back.')) throw new Error('The homepage must introduce DeadlineAI without requiring login.');
    if (!landing.includes('Sign in') || !landing.includes('Get started')) throw new Error('The public homepage needs sign-in and signup entry points.');
    const signedInHome = render('/', { user: { id: 42 } });
    if (!signedInHome.includes('Less last-minute.') || !signedInHome.includes('Open workspace')) throw new Error('Signed-in users should still have a public home and a workspace entry point.');
    const reset = render('/', { recovering: true });
    if (!reset.includes('Choose a new password.') || reset.includes('Less last-minute.')) throw new Error('Signed-out reset links must take precedence over the landing page.');
    const login = render('/login');
    if (!login.includes('Welcome back.') || login.includes('Choose a new password.')) throw new Error('The login route must show login.');
    const signup = render('/signup');
    if (!signup.includes('Create your student workspace.')) throw new Error('The signup route must open registration directly.');
    const protectedPage = render('/app');
    if (!protectedPage.includes('Welcome back.') || protectedPage.includes('Your notices. Made clearer.')) throw new Error('Signed-out users cannot enter the workspace.');
    const success = render('/login', { notice: 'Password updated. Sign in with your new password.' });
    if (!success.includes('Password updated.')) throw new Error('A successful reset must explain the next step.');
    const missing = render('/missing-page');
    if (!missing.includes('Back to home')) throw new Error('Unknown routes need a way back home.');
    return '8 landing, authentication and protected-route regressions passed';
  } finally { globalThis.window = previousWindow; }
}
