/** Reviews / Ratings feature */
export interface Review {
  id: string;
  targetId: string;
  targetType: 'company' | 'product' | 'service';
  rating: number;
  comment: string;
  authorId: string;
  createdAt: string;
}

export const mockReviews: Review[] = [];
