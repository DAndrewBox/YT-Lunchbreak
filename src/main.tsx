import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
});

const root = document.createElement('div');
root.id = 'crx-root';
document.body.append(root);

// biome-ignore lint/style/noNonNullAssertion: Vite default
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</StrictMode>,
);
