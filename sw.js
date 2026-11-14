const VERSION="weather-sphere-v2";
const SHELL=[ "./", "./index.html", "./manifest.webmanifest", "./icon.svg" ];
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{const cache=await caches.open(VERSION);await cache.addAll(SHELL);await self.skipWaiting()})());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(request.mode==="navigate"){
  event.respondWith((async()=>{try{const response=await fetch(request);const cache=await caches.open(VERSION);cache.put("./index.html",response.clone());return response}catch(e){return (await caches.match("./index.html"))||Response.error()}})());
  return;
 }
 if(url.origin===self.location.origin){
  event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok){const cache=await caches.open(VERSION);cache.put(request,response.clone())}return response}catch(e){return cached||Response.error()}})());
  return;
 }
 if(url.hostname==="api.open-meteo.com"||url.hostname==="geocoding-api.open-meteo.com"){
  event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok){const cache=await caches.open(VERSION);cache.put(request,response.clone())}return response}catch(e){return (await caches.match(request))||Response.error()}})());
  return;
 }
 if(url.hostname==="unpkg.com"||url.hostname.endsWith("fonts.googleapis.com")||url.hostname.endsWith("fonts.gstatic.com")){
  event.respondWith((async()=>{const cache=await caches.open(VERSION);const cached=await cache.match(request);const network=fetch(request).then(response=>{if(response.ok||response.type==="opaque")cache.put(request,response.clone());return response}).catch(()=>cached);return cached||network})());
 }
});