importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js');
importScripts('https://ssl.widgets.webengage.com/js/service-worker.js');
workbox.setConfig({debug: false});
workbox.recipes.pageCache({networkTimoutSeconds: 5});
workbox.recipes.googleFontsCache();
workbox.recipes.staticResourceCache();
workbox.recipes.imageCache();
workbox.recipes.offlineFallback();
