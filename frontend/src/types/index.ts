export interface Experience {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  price: number;
  durationHours: number;
  maxPeople: number;
  category: string;
  rating: number;
  reviewCount: number;
  slots?: Slot[];
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  isActive: boolean;
}

export interface BookingData {
  experienceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  participants: number;
  promoCode?: string;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
  message: string;
}

export interface Booking {
  _id: string;
  experience: {
    _id: string;
    title: string;
    location: string;
    imageUrl: string;
  };
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  participants: number;
  totalPrice: number;
  promoCode?: string;
  discountAmount: number;
  finalPrice: number;
  status: string;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoValidation {
  valid: boolean;
  discount_amount?: number;
  final_amount?: number;
  promo_code?: any;
  message?: string;
}