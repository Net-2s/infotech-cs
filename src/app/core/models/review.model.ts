export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [key: string]: number }; // Distribution des notes (1-5) - clés en string
}
