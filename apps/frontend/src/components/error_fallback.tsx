import { logSessionException } from "@frontend/utils/session-logger.utils";
import { useEffect } from "react";
import { useRouteError } from "react-router";

export const ErrorFallback = () => {
	return <div>Something went wrong!!!</div>;
};

export const CustomErrorBoundary = () => {
	const error = useRouteError() as Error;

  useEffect(() => {
    logSessionException(error, {
      error_type: 'route_error',
    }, 'Route error occurred');
  }, [error]);

	return <ErrorFallback />;
}