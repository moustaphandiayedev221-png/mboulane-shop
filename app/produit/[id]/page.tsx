import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getProducts } from "@/lib/catalog"
import { getSiteBaseUrl } from "@/lib/site/base-url"
import { ProductDetail } from "./product-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 300

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Produit non trouvé | MBOULANE SHOP",
    }
  }

  const base = getSiteBaseUrl()
  const canonical = `${base}/produit/${product.id}`

  return {
    title: `${product.name} | MBOULANE SHOP`,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description: product.description,
      url: canonical,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const [product, allProducts] = await Promise.all([getProductById(id), getProducts()])

  if (!product) {
    notFound()
  }

  const base = getSiteBaseUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${base}/produit/${product.id}`,
      priceCurrency: 'XOF',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} allProducts={allProducts} />
    </>
  )
}
