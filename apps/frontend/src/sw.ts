declare const self: ServiceWorkerGlobalScope;

// Optional: allow the app to tell SW to skip waiting on update
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

// Optional: simple fetch handler (can be customized for smarter caching)
self.addEventListener("fetch", () => {
	// Default network behavior; customize if you want advanced strategies
});
