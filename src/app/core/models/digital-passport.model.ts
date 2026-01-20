/**
 * Modèle pour le Passeport Numérique d'un produit
 * Contient toutes les informations environnementales et de traçabilité
 */

export interface DigitalPassport {
  id: number;
  productId: number;
  
  // Impact Environnemental
  carbonFootprint: CarbonFootprint;
  
  // Traçabilité
  traceability: Traceability;
  
  // Composition & Matériaux
  materials: Material[];
  
  // Durabilité & Réparation
  durability: Durability;
  
  // Certifications
  certifications: Certification[];
  
  // Informations de recyclage
  recycling: RecyclingInfo;
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

/**
 * Empreinte carbone du produit
 */
export interface CarbonFootprint {
  // Total en kg CO2
  totalCO2: number;
  
  // Détail par phase
  manufacturing: number;      // Fabrication
  transportation: number;     // Transport
  usage: number;             // Utilisation (estimée sur 3 ans)
  endOfLife: number;         // Fin de vie
  
  // Comparaison
  equivalentKmCar: number;   // Équivalent en km de voiture
  equivalentTreesYear: number; // Arbres nécessaires pour compenser (1 an)
  
  // Score (A-E)
  score: 'A' | 'B' | 'C' | 'D' | 'E';
}

/**
 * Traçabilité du produit
 */
export interface Traceability {
  // Origine
  countryOfOrigin: string;
  manufactureDate: string;
  manufacturer: string;
  factoryLocation: string;
  
  // Parcours
  journey: JourneyStep[];
  
  // Chaîne d'approvisionnement
  supplyChainTransparency: number; // 0-100%
}

export interface JourneyStep {
  location: string;
  date: string;
  type: 'manufacturing' | 'assembly' | 'quality-check' | 'shipping' | 'warehouse' | 'retail';
  description: string;
}

/**
 * Matériaux composant le produit
 */
export interface Material {
  name: string;
  percentage: number;        // % du produit total
  renewable: boolean;        // Renouvelable ou non
  recycled: boolean;         // Contient du recyclé
  recyclable: boolean;       // Recyclable en fin de vie
  origin: string;           // Provenance
}

/**
 * Informations de durabilité
 */
export interface Durability {
  // Durée de vie estimée
  expectedLifespan: number;  // En années
  
  // Réparabilité
  repairabilityScore: number; // 0-10
  repairabilityIndex: 'A' | 'B' | 'C' | 'D' | 'E';
  
  // Pièces détachées
  sparePartsAvailable: boolean;
  sparePartsAvailabilityYears: number;
  
  // Garantie
  warrantyYears: number;
  extendedWarrantyAvailable: boolean;
  
  // Mise à jour
  softwareUpdatesYears: number; // Pour électronique
}

/**
 * Certifications du produit
 */
export interface Certification {
  name: string;
  issuer: string;
  validUntil: string;
  logoUrl: string;
  verificationUrl: string;
  type: 'environmental' | 'social' | 'quality' | 'safety' | 'other';
}

/**
 * Informations de recyclage
 */
export interface RecyclingInfo {
  recyclable: boolean;
  recyclablePercentage: number; // % du produit recyclable
  
  // Instructions
  instructions: string;
  
  // Points de collecte
  collectionPoints: CollectionPoint[];
  
  // Programme de reprise
  takeBackProgram: boolean;
  takeBackProgramDetails: string;
}

export interface CollectionPoint {
  name: string;
  address: string;
  distance: number; // km
  acceptedMaterials: string[];
}

/**
 * DTO pour créer/modifier un passeport numérique
 */
export interface CreateDigitalPassportRequest {
  productId: number;
  
  // Impact carbone
  carbonFootprint: {
    manufacturing: number;
    transportation: number;
    usage: number;
    endOfLife: number;
  };
  
  // Traçabilité
  countryOfOrigin: string;
  manufactureDate: string;
  manufacturer: string;
  factoryLocation: string;
  
  // Matériaux
  materials: {
    name: string;
    percentage: number;
    renewable: boolean;
    recycled: boolean;
    recyclable: boolean;
    origin: string;
  }[];
  
  // Durabilité
  expectedLifespan: number;
  repairabilityScore: number;
  sparePartsAvailabilityYears: number;
  warrantyYears: number;
  softwareUpdatesYears?: number;
  
  // Certifications
  certifications?: {
    name: string;
    issuer: string;
    validUntil: string;
    logoUrl: string;
    verificationUrl: string;
    type: string;
  }[];
  
  // Recyclage
  recyclablePercentage: number;
  recyclingInstructions: string;
  takeBackProgram: boolean;
  takeBackProgramDetails?: string;
}
