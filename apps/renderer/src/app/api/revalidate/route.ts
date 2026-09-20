import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-revalidate-secret');
    const expectedSecret =
      process.env.RENDERER_REVALIDATE_SECRET ||
      'secret_revalidate_token_between_backend_and_renderer_123';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid revalidation secret token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { domain, slug } = body;

    if (!domain) {
      return NextResponse.json(
        { message: 'Missing domain parameter' },
        { status: 400 }
      );
    }

    const cleanSlug = slug === 'home' || !slug ? 'home' : slug;

    // 1. On-demand Tag Revalidation
    revalidateTag(`page-${domain}-${cleanSlug}`);
    revalidateTag(`page-${domain}`);

    // 2. On-demand Path Revalidation
    revalidatePath(`/${domain}`);
    revalidatePath(`/${domain}/${cleanSlug}`);
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      domain,
      slug: cleanSlug,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating path', error: err.message },
      { status: 500 }
    );
  }
}
