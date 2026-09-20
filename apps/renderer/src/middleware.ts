import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. favicon.ico, images, fonts
     */
    '/((?!api/|_next/|_static/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|css|js)).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'localhost:3000';

  // 1. Kiểm tra query param ?site= hoặc ?domain=
  let queryDomain = url.searchParams.get('site') || url.searchParams.get('domain');
  let extraPath = '';

  // Xử lý thông minh nếu truyền ?site=nhahangabc.local/home
  if (queryDomain && queryDomain.includes('/')) {
    const parts = queryDomain.split('/');
    queryDomain = parts[0];
    extraPath = '/' + parts.slice(1).join('/');
  }

  // 2. Trích xuất hostname sạch (loại bỏ port và www)
  let currentHost = (queryDomain || hostname)
    .replace(`:${process.env.PORT || 3000}`, '')
    .replace(/^www\./, '');

  // 3. Nếu truy cập trực tiếp root localhost / 127.0.0.1 mà không truyền ?site=
  if (!queryDomain && (currentHost === 'localhost' || currentHost === '127.0.0.1')) {
    // Nếu truy cập root landing page
    if (url.pathname === '/') {
      return NextResponse.next();
    }

    // Nếu đường dẫn có dạng /[domain]/sitemap.xml hoặc /[domain]/robots.txt hoặc /[domain]/[slug]
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 1 && pathParts[0] !== 'api' && pathParts[0] !== '_next') {
      currentHost = pathParts[0];
      const remainingPath = pathParts.slice(1).join('/');
      return NextResponse.rewrite(
        new URL(`/${currentHost}/${remainingPath}`, req.url)
      );
    }
  }

  // Mặc định fallback về demo site nếu có path con nhưng không có domain
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    currentHost = 'nhahangabc.local';
  }

  // 4. Chuẩn hóa path (mặc định vào /home nếu ở trang chủ của tenant)
  let path = url.pathname;
  if (path === '/') {
    path = extraPath || '/home';
  } else if (extraPath) {
    path = path + extraPath;
  }

  // Rewrite request sang dynamic route: /[domain]/[slug]
  return NextResponse.rewrite(
    new URL(`/${currentHost}${path}`, req.url)
  );
}


