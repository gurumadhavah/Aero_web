// In app/sitemap.ts

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sjecaero.in'

  // List of all your public pages
  const routes = [
    '/',
    '/projects',
    '/team',
    '/recruitment',
    '/gallery',
    '/events',
    '/achievements',
    '/contact'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  return routes;
}