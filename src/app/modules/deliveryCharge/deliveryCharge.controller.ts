import { DeliveryChargeService } from "./deliveryCharge.service";

// Example usage in ParcelService
const getFeeForParcel = async (
  district: string,
  type: string,
  weight: number
) => {
  return DeliveryChargeService.calculateFee(district, type, weight);
};

export const DeliveryChargeController = {
  getFeeForParcel,
};
