import React from 'react';
import { Metadata } from 'next';
import { BlockNode, compilePageStyles } from '@t-business/shared-types';
import {

  HeaderSSR,
  FooterSSR,
  HeadingSSR,
  TextSSR,
  ImageSSR,
  ButtonSSR,
  SectionSSR,
  DividerSSR,
  CollectionListSSR,
  FormSSR,
  VideoSSR,
  EmbedSSR,
  IconSSR,
  ContainerSSR,
} from '../../../components/blocks';

interface PageProps {
  params: {
    domain: string;
    slug?: string[];
  };
}

export const dynamic = 'auto';
export const revalidate = 0;

async function getPageData(domain: string, slugArray?: string[]) {
  const slug = slugArray && slugArray.length > 0 ? slugArray.join('/') : 'home';
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${backendUrl}/v1/public/render/${domain}/${slug}`, {
      next: { tags: [`page-${domain}-${slug}`, `page-${domain}`] },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[Renderer] Lỗi kết nối tới Backend API cho ${domain}/${slug}:`, error);
    return null;
  }
}

async function getAnalyticsSettings(siteId?: string) {
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
  const effectiveId = siteId || 'site-1';
  try {
    const res = await fetch(`${backendUrl}/v1/ab-test/analytics/${effectiveId}`, {
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }
  return { ga4Id: 'G-XXXXXXXXXX', fbPixelId: '112233445566778', enableEcommerceTracking: true };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getPageData(params.domain, params.slug);

  if (!data) {
    return {
      title: `Trang không tồn tại | ${params.domain}`,
    };
  }

  const seo = data.page?.seo_meta || {};
  const siteName = data.site?.name || params.domain;

  return {
    title: seo.title || `${siteName} — Website Doanh Nghiệp`,
    description: seo.description || `Chào mừng bạn đến với ${siteName}`,
    openGraph: {
      title: seo.title || siteName,
      description: seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
  };
}

export default async function TenantPage({ params }: PageProps) {
  const data = await getPageData(params.domain, params.slug);
  const analytics = await getAnalyticsSettings(data?.site?.id);

  if (!data) {
    return (
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <h1 style={{ fontSize: '32px', color: '#1F1E1B', marginBottom: '8px' }}>
          404 — Chưa tìm thấy trang web
        </h1>
        <p style={{ color: '#6B6A63', maxWidth: '480px', marginBottom: '24px' }}>
          Tên miền <strong>{params.domain}</strong> hoặc đường dẫn này chưa được xuất bản.
        </p>
      </main>
    );
  }

  const allBlocks: BlockNode[] = data.blocks || [];
  const rootBlocks = allBlocks
    .filter((b) => !b.parent_id)
    .sort((a, b) => a.order_index - b.order_index);

  // Dynamic CSS Engine
  const dynamicCss = compilePageStyles(allBlocks);


  let hasRenderedFirstImage = false;

  return (
    <>
      {/* GA4 Script Injection */}
      {analytics?.ga4Id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`}
          />
          <script
            id="ga4-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analytics.ga4Id}', { page_path: window.location.pathname });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel Script Injection */}
      {analytics?.fbPixelId && (
        <script
          id="fb-pixel-init"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${analytics.fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Dynamic CSS Engine */}
      {dynamicCss && (
        <style
          id="tb-page-css"
          dangerouslySetInnerHTML={{ __html: dynamicCss }}
        />
      )}

      {/* Global Theme CSS Variables */}
      <style
        id="tb-theme-css"
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${data.site?.theme?.primaryColor || '#2F6F4F'};
              --tb-primary: ${data.site?.theme?.primaryColor || '#2F6F4F'};
              --tb-primary-hover: ${data.site?.theme?.primaryColor || '#24563E'};
              --color-accent: ${data.site?.theme?.accentColor || '#6B4EFF'};
              --tb-secondary: ${data.site?.theme?.accentColor || '#6B4EFF'};
              --color-bg-base: ${data.site?.theme?.backgroundColor || '#FFFFFF'};
              --color-text-base: ${data.site?.theme?.textColor || '#1F1E1B'};
              --font-heading: ${data.site?.theme?.fontHeading ? `'${data.site?.theme?.fontHeading}', sans-serif` : 'Inter, sans-serif'};
              --font-body: ${data.site?.theme?.fontBody ? `'${data.site?.theme?.fontBody}', sans-serif` : 'Inter, sans-serif'};
              --global-radius: ${data.site?.theme?.borderRadius || '8px'};
            }
          `,
        }}
      />

      <main className="tb-page-main">

        {rootBlocks.map((block) => {
          const isHero = block.type === 'image' && !hasRenderedFirstImage;
          if (isHero) hasRenderedFirstImage = true;
          return (
            <BlockRenderer
              key={block.id}
              block={block}
              allBlocks={allBlocks}
              isHero={isHero}
              siteId={data.site?.id}
            />
          );
        })}
      </main>
    </>
  );
}

function BlockRenderer({
  block,
  allBlocks,
  isHero = false,
  siteId,
}: {
  block: BlockNode;
  allBlocks: BlockNode[];
  isHero?: boolean;
  siteId?: string;
}) {
  const childrenBlocks = allBlocks
    .filter((b) => b.parent_id === block.id)
    .sort((a, b) => a.order_index - b.order_index);

  switch (block.type) {
    case 'header':
      return <HeaderSSR id={block.id} props={block.props as any} />;
    case 'footer':
      return <FooterSSR id={block.id} props={block.props as any} />;
    case 'heading':
      return <HeadingSSR id={block.id} props={block.props as any} />;
    case 'text':
      return <TextSSR id={block.id} props={block.props as any} />;
    case 'image':
      return <ImageSSR id={block.id} props={block.props as any} isHero={isHero} />;
    case 'button':
      return <ButtonSSR id={block.id} props={block.props as any} />;
    case 'divider':
      return <DividerSSR id={block.id} props={block.props as any} />;
    case 'collection_list':
      return <CollectionListSSR id={block.id} props={block.props as any} siteId={siteId} />;
    case 'form':
      return <FormSSR id={block.id} props={block.props as any} />;
    case 'video':
      return <VideoSSR id={block.id} props={block.props as any} />;
    case 'embed':
      return <EmbedSSR id={block.id} props={block.props as any} />;
    case 'icon':
      return <IconSSR id={block.id} props={block.props as any} />;
    case 'section':
      return (
        <SectionSSR id={block.id} props={block.props as any}>
          {childrenBlocks.map((child) => (
            <BlockRenderer key={child.id} block={child} allBlocks={allBlocks} siteId={siteId} />
          ))}
        </SectionSSR>
      );
    case 'container':
      return (
        <ContainerSSR id={block.id} props={block.props as any}>
          {childrenBlocks.map((child) => (
            <BlockRenderer key={child.id} block={child} allBlocks={allBlocks} siteId={siteId} />
          ))}
        </ContainerSSR>
      );
    default:
      return null;
  }
}
