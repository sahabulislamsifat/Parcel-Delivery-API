import { DeliveryCharge } from "./deliveryCharge.model";

// Get single delivery charge by district + type
const getDeliveryCharge = async (district: string, type: string) => {
  return DeliveryCharge.findOne({ district, type });
};

// Calculate fee based on weight, type, district
const calculateFee = async (
  district: string,
  type: string,
  weight: number
): Promise<number> => {
  const charge = await getDeliveryCharge(district, type);
  if (!charge) {
    // default fee if not configured
    return 50 + weight * 10;
  }
  return charge.baseFee + charge.perKgRate * weight;
};

export const DeliveryChargeService = {
  getDeliveryCharge,
  calculateFee,
};
