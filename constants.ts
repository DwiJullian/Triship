
import { Product, CarouselItem } from './types';

const MOCK_REVIEWS = [
  { id: 'r1', productId: '', userName: 'Sarah J.', rating: 5, comment: 'The fabric feels premium and fits perfectly. Love it!', date: '2024-03-01' },
  { id: 'r2', productId: '', userName: 'Michael R.', rating: 4, comment: 'Stylish and comfortable. Arrived faster than expected.', date: '2024-02-15' },
  { id: 'r3', productId: '', userName: 'Emma W.', rating: 5, comment: 'Looks even better in person. Definitely buying again.', date: '2024-03-10' }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Oversized T-Shirt',
    price: 19.99,
    description: 'Comfortable oversized t-shirt made from premium cotton. Perfect for everyday wear with a relaxed, modern fit.',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&q=80&w=800',
    category: 'T-Shirt',
    salesCount: 320,
    createdAt: '2024-02-01',
    isNew: true,
    reviews: MOCK_REVIEWS
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jacket',
    price: 59.99,
    description: 'Timeless denim jacket with a slim fit design. Easy to style for casual or streetwear looks.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    category: 'Shirt',
    salesCount: 210,
    createdAt: '2024-01-20',
    isNew: true,
    reviews: MOCK_REVIEWS.slice(0, 2)
  },
  {
    id: '3',
    name: 'Leather Crossbody Bag',
    price: 45.00,
    description: 'Minimalist leather crossbody bag designed for daily use. Compact, stylish, and functional.',
    image: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    salesCount: 180,
    createdAt: '2023-12-15',
    isNew: false,
    reviews: MOCK_REVIEWS
  },
  {
    id: '4',
    name: 'Stainless Steel Watch',
    price: 79.99,
    description: 'Elegant stainless steel watch with a minimalist dial. Suitable for both casual and formal outfits.',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    salesCount: 400,
    createdAt: '2024-02-10',
    isNew: true,
    reviews: MOCK_REVIEWS.slice(1, 3)
  },
  {
    id: '5',
    name: 'Casual Sneakers',
    price: 69.00,
    description: 'Lightweight sneakers designed for all-day comfort. A perfect match for streetwear and casual outfits.',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    salesCount: 520,
    createdAt: '2023-11-05',
    isNew: false,
    reviews: MOCK_REVIEWS
  },
  {
    id: '6',
    name: 'Ribbed Knit Sweater',
    price: 39.99,
    description: 'Soft ribbed knit sweater with a modern silhouette. Ideal for layering during cooler days.',
    image: 'https://images.unsplash.com/photo-1618354691321-1f9a5c83c1f6?auto=format&fit=crop&q=80&w=800',
    category: 'Shirt',
    salesCount: 260,
    createdAt: '2024-02-20',
    isNew: true,
    reviews: MOCK_REVIEWS.slice(0, 1)
  },
  {
    id: '7',
    name: 'Canvas Tote Bag',
    price: 22.00,
    description: 'Durable canvas tote bag with a clean, versatile design. Perfect for daily essentials.',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    salesCount: 145,
    createdAt: '2024-02-25',
    isNew: true,
    reviews: MOCK_REVIEWS
  },
  {
    id: '8',
    name: 'Straight Cut Chino Pants',
    price: 49.99,
    description: 'Classic straight cut chino pants offering comfort and a clean silhouette for everyday style.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    category: 'Pants',
    salesCount: 190,
    createdAt: '2023-12-10',
    isNew: false,
    reviews: MOCK_REVIEWS.slice(1, 2)
  }
];


export const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: "Summer Collection 2024",
    subtitle: "Fresh styles, breathable fabrics, and effortless everyday looks.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 2,
    title: "Wear Your Confidence",
    subtitle: "Clothing and accessories designed to match your lifestyle.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 3,
    title: "Everyday Essentials",
    subtitle: "Timeless pieces made to be worn again and again.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200"
  }
];


