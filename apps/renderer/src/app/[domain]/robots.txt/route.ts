/**
 * robots.txt động cho từng tenant domain.
 * Route: GET /[domain]/robots.txt
 *
 * Next.js App Router — Route Handler
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const { domain } = params;

  // Xác định sitemap URL cho tenant này
  const sitemapUrl = domain.includes('localhost')
    ? `http://localhost:3000/${domain}/sitemap.xml`
    : `https://${domain}/sitemap.xml`;

  const robots = `# Robots.txt được tạo tự động bởi T-Business CMS
# Domain: ${domain}

User-agent: *
Allow: /

# Không crawl trang admin hoặc API nội bộ
Disallow: /api/
Disallow: /_next/

Sitemap: ${sitemapUrl}
`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
