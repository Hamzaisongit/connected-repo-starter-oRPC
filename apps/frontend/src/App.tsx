/*
 * Copyright (c) 2025 Hexatech Hub Solutions LLP, India
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { ThemeContextProvider } from "@connected-repo/ui-mui/theme/ThemeContext";
import { ErrorFallback } from "@frontend/components/error_fallback";
import { OfflineFallback } from "@frontend/components/offline_fallback";
import { router } from "@frontend/router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ErrorBoundary } from "@sentry/react";
import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePWAInstall } from "./hooks/usePwaInstall";

// App focuses on rendering the router tree and error boundaries. Providers
// (QueryClient + oRPC client) are created and mounted at the root in
// `main.tsx` following the oRPC + TanStack React Query recommended setup.
function App() {

	usePWAInstall()

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<ThemeContextProvider>
				<Suspense fallback={<LoadingSpinner text="Loading..." />}>
					<ErrorBoundary fallback={<ErrorFallback />} beforeCapture={(scope) => {
	          scope.setTag("level", "top-level");
	        }}>
						<OfflineFallback>
							<RouterProvider router={router} />
						</OfflineFallback>
					</ErrorBoundary>
				</Suspense>
				<ToastContainer
					position="top-center"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
			</ThemeContextProvider>
		</LocalizationProvider>
	);
}

export default App;
