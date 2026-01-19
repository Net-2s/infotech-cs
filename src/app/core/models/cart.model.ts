/**
 * Options d'assurance disponibles pour les produits
 */
export interface InsuranceOption {
  id: string;
  type: 'monthly' | 'annual';
  name: string;
  price: number;
  pricePerMonth?: number; // Pour l'option mensuelle
  duration: string; // "12 mois", "5 ans", etc.
  description: string;
  benefits: string[];
  recommended?: boolean;
}

/**
 * Assurance sélectionnée pour un article du panier
 */
export interface SelectedInsurance {
  optionId: string;
  type: 'monthly' | 'annual';
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  listingId: number;
  productTitle: string;
  productBrand: string;
  productImage?: string;
  price: number;
  quantity: number;
  sellerShopName: string;
  conditionNote?: string;
  estimatedDeliveryMin?: string; // Date estimée minimum
  estimatedDeliveryMax?: string; // Date estimée maximum
  expressDeliveryAvailable?: boolean;
  expressDeliveryPrice?: number;
  expressDeliveryDate?: string;
  insurance?: SelectedInsurance;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  insuranceTotal: number;
  shippingTotal: number;
  total: number;
  itemCount: number;
}

/**
 * Options d'assurance par défaut (peuvent être personnalisées par le vendeur/admin)
 */
export const DEFAULT_INSURANCE_OPTIONS: InsuranceOption[] = [
  {
    id: 'monthly',
    type: 'monthly',
    name: 'Assurance casse mensuelle',
    price: 71.88,
    pricePerMonth: 5.99,
    duration: '12 mois minimum',
    description: 'Paiement en mensualités. Couverture de votre appareil jusqu\'à 5 ans.',
    benefits: [
      'Casse, chute, fissure et oxydation (excès d\'humidité) accidentelle couvertes.',
      'Votre appareil réparé gratuitement jusqu\'à 2 fois par an.',
      'Réparation facile et rapide. Votre appareil de retour chez vous en 3 jours et en pleine forme.',
      '1€ reversé pour soutenir l\'insertion professionnelle dans les métiers du reconditionnement.'
    ],
    recommended: true
  },
  {
    id: 'annual',
    type: 'annual',
    name: 'Assurance casse de 12 mois',
    price: 59.99,
    duration: '12 mois',
    description: 'Paiement en une seule fois. Couverture de votre appareil pour 1 an.',
    benefits: [
      'Casse, chute, fissure et oxydation (excès d\'humidité) accidentelle couvertes.',
      'Votre appareil réparé gratuitement 1 fois par an.',
      'Réparation facile et rapide. Votre appareil de retour chez vous en 3 jours et en pleine forme.',
      '1€ reversé pour soutenir l\'insertion professionnelle dans les métiers du reconditionnement.'
    ],
    recommended: false
  }
];

