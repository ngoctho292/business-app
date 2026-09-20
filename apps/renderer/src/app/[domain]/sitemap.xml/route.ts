/**
 * Sitemap.xml động cho từng tenant domain.
 * Route: GET /[domain]/sitemap.xml
 *
 * Next.js App Router — Route Handler trả về XML
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

export async function GET(
  _req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const { domain } = params;

  let pageEntries: { slug: string; updated_at: string }[] = [];

  try {
    const res = await fetch(`${BACKEND_URL}/v1/public/pages/${domain}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      pageEntries = await res.json();
    }
  } catch (_err) {
    // Backend unreachable — trả về sitemap rỗng
  }

  // Xác định base URL cho tenant này
  const baseUrl = domain.includes('localhost')
    ? `http://localhost:3000/?site=${domain}`
    : `https://${domain}`;

  const urlSet = pageEntries
    .map((entry) => {
      // Convert slug "home" → "/" ; slug "about" → "/about"
      const loc =
        entry.slug === 'home'
          ? baseUrl
          : `${baseUrl}/${entry.slug}`;

      return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${entry.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${entry.slug === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${urlSet}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
