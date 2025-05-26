import { AppProviders } from '../contexts/AppProviders';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}

export default MyApp;
