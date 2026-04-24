export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  description: string
  category: string
  sizes: number[]
  colors: string[]
  inStock: boolean
  badge?: string
  rating: number
  reviews: number
}

export const COLOR_MAP: Record<string, string> = {
  "Marron": "#8B5E3C",
  "Noir": "#000000",
  "Beige": "#FDF5E6",
  "Marron Cognac": "#A3663E",
  "Beige Sable": "#D2B48C",
  "Blanc": "#FFFFFF",
  "Marron Tribal": "#704214",
  "Noir & Or": "linear-gradient(45deg, #000000 50%, #D4AF37 50%)",
  "Gris": "#808080",
  "Vert Forêt": "#228B22",
  "Marron Profond": "#4B2D15",
  "Bleu Marine": "#000080",
}

// Products data
export const products: Product[] = [
  {
    id: '1',
    name: 'Sandale Dakar Classic',
    price: 35000,
    originalPrice: 45000,
    image: '/products/sandal-1.jpg',
    images: ['/products/sandal-1.jpg', '/products/sandal-2.jpg', '/products/sandal-3.jpg', '/products/sandal-4.jpg'],
    description: 'Sandale en cuir marron avec boucle métallique dorée. Design élégant inspiré de l\'artisanat sénégalais traditionnel. Confort optimal pour un usage quotidien.',
    category: 'Classique',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Marron', 'Noir', 'Beige'],
    inStock: true,
    badge: 'Made in Senegal 🇸🇳',
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'Sandale Gorée Luxe',
    price: 48000,
    image: '/products/sandal-2.jpg',
    images: ['/products/sandal-2.jpg', '/products/sandal-1.jpg', '/products/sandal-5.jpg', '/products/sandal-6.jpg'],
    description: 'Sandale premium à lanières croisées en cuir pleine fleur. Finitions artisanales exceptionnelles. Semelle en cuir véritable pour un confort inégalé.',
    category: 'Premium',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['Marron Cognac', 'Noir'],
    inStock: true,
    badge: 'Cuir Premium',
    rating: 4.9,
    reviews: 87
  },
  {
    id: '3',
    name: 'Sandale Teranga Slip-On',
    price: 32000,
    image: '/products/sandal-3.jpg',
    images: ['/products/sandal-3.jpg', '/products/sandal-4.jpg', '/products/sandal-7.jpg', '/products/sandal-8.jpg'],
    description: 'Sandale slip-on minimaliste pour un style décontracté mais raffiné. Cuir souple de qualité supérieure. Parfaite pour les journées chaudes.',
    category: 'Mode & Tendance',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Beige Sable', 'Marron', 'Blanc'],
    inStock: true,
    rating: 4.7,
    reviews: 156
  },
  {
    id: '4',
    name: 'Sandale Sahel Artisanale',
    price: 55000,
    image: '/products/sandal-4.jpg',
    images: ['/products/sandal-4.jpg', '/products/sandal-5.jpg', '/products/sandal-6.jpg', '/products/sandal-7.jpg'],
    description: 'Pièce unique entièrement faite à la main par nos artisans. Motifs traditionnels africains. Un véritable bijou pour vos pieds.',
    category: 'Artisanal & Unique',
    sizes: [39, 40, 41, 42, 43],
    colors: ['Marron Tribal', 'Noir & Or'],
    inStock: true,
    badge: 'Édition Limitée',
    rating: 5.0,
    reviews: 42
  },
  {
    id: '5',
    name: 'Sandale Ndar Comfort',
    price: 38000,
    originalPrice: 42000,
    image: '/products/sandal-5.jpg',
    images: ['/products/sandal-5.jpg', '/products/sandal-4.jpg', '/products/sandal-6.jpg', '/products/sandal-8.jpg'],
    description: 'Conçue pour un confort maximal avec semelle anatomique. Cuir respirant idéal pour le climat africain. Style moderne et polyvalent.',
    category: 'Mode & Tendance',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    colors: ['Marron', 'Noir', 'Gris'],
    inStock: true,
    rating: 4.6,
    reviews: 98
  },
  {
    id: '6',
    name: 'Sandale Casamance Elite',
    price: 65000,
    image: '/products/sandal-6.jpg',
    images: ['/products/sandal-6.jpg', '/products/sandal-5.jpg', '/products/sandal-7.jpg', '/products/sandal-4.jpg'],
    description: 'Notre modèle le plus exclusif. Cuir premium de première qualité. Design inspiré des forêts de Casamance. Pour les amateurs de luxe authentique.',
    category: 'Premium',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['Vert Forêt', 'Marron Profond'],
    inStock: true,
    badge: 'Premium',
    rating: 4.9,
    reviews: 35
  },
  {
    id: '7',
    name: 'Sandale Thiès Urban',
    price: 29000,
    image: '/products/sandal-7.jpg',
    images: ['/products/sandal-7.jpg', '/products/sandal-6.jpg', '/products/sandal-8.jpg', '/products/sandal-3.jpg'],
    description: 'Style urbain moderne avec une touche africaine. Légère et durable. Parfaite pour la vie quotidienne en ville.',
    category: 'Mode & Tendance',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Noir', 'Blanc', 'Marron'],
    inStock: true,
    rating: 4.5,
    reviews: 203
  },
  {
    id: '8',
    name: 'Sandale Mbour Beach',
    price: 26000,
    originalPrice: 32000,
    image: '/products/sandal-8.jpg',
    images: ['/products/sandal-8.jpg', '/products/sandal-7.jpg', '/products/sandal-6.jpg', '/products/sandal-3.jpg'],
    description: 'Idéale pour les sorties à la plage ou les vacances. Résistante à l\'eau. Design décontracté et confortable.',
    category: 'Mode & Tendance',
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Beige', 'Bleu Marine', 'Blanc'],
    inStock: true,
    badge: 'Promo',
    rating: 4.4,
    reviews: 178
  }
]

// Categories
export const categories = [
  "Tous",
  "Classique",
  "Mode & Tendance",
  "Premium",
  "Artisanal & Unique",
]

// Reviews data
export const reviews = [
  {
    id: '1',
    name: 'Amadou D.',
    location: 'Dakar',
    rating: 5,
    comment: 'Qualité exceptionnelle ! Les sandales sont magnifiques et très confortables. Je recommande vivement.',
    date: '15 Mars 2026',
    verified: true
  },
  {
    id: '2',
    name: 'Fatou S.',
    location: 'Thiès',
    rating: 5,
    comment: 'J\'ai commandé pour mon mari, il les adore. La livraison était rapide et le service client au top.',
    date: '12 Mars 2026',
    verified: true
  },
  {
    id: '3',
    name: 'Moussa K.',
    location: 'Saint-Louis',
    rating: 4,
    comment: 'Très beau design africain moderne. Le cuir est de qualité. Seul petit bémol : j\'aurais aimé plus de choix de tailles.',
    date: '8 Mars 2026',
    verified: true
  },
  {
    id: '4',
    name: 'Aïssatou B.',
    location: 'Dakar',
    rating: 5,
    comment: 'Made in Senegal et fier de le porter ! Ces sandales représentent parfaitement notre culture avec une touche moderne.',
    date: '5 Mars 2026',
    verified: true
  }
]
