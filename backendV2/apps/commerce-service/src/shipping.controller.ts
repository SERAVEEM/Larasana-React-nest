import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShippingService } from './shipping.service';
import { SHIPPING_PATTERNS } from '../../../libs/shared/src';

/**
 * Commerce-service microservice controller for shipping patterns.
 *
 * All payload fields forwarded from the API Gateway are destructured
 * explicitly so the ShippingService can resolve the correct provider
 * (RajaOngkir for domestic, EasyPost for international, or DB fallback).
 */
@Controller()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * GET /api/v1/shipping
   *
   * Accepted query params (forwarded from the Gateway as a typed payload):
   *   - addressId          – ID of a stored Address row
   *   - weight             – package weight in grams (default 1000)
   *   - destination_country – ISO-2 country code or full country name
   *   - destination_city   – city name (used when addressId is absent)
   *
   * Always returns: { success: boolean; data: ShippingOption[]; message?: string }
   */
  @MessagePattern(SHIPPING_PATTERNS.GET_ALL)
  getAll(
    @Payload()
    data?: {
      addressId?:           number;
      weight?:              number;
      destination_country?: string;
      destination_city?:    string;
    },
  ) {
    return this.shippingService.getAll(data);
  }

  /**
   * Find a single shipping method by its ID.
   * Delegates to ShippingService.findById which handles dynamic (RajaOngkir /
   * EasyPost) and static (DB) IDs transparently.
   */
  @MessagePattern(SHIPPING_PATTERNS.FIND_BY_ID)
  findById(
    @Payload()
    data: {
      id:        number;
      addressId?: number;
      weight?:    number;
      usdRate?:   number;
    },
  ) {
    return this.shippingService.findById(
      data.id,
      data.addressId,
      data.weight,
      data.usdRate,
    );
  }

  /**
   * Return the full RajaOngkir city list (cached after first fetch).
   * Used by the frontend address-add form for city autocomplete.
   */
  @MessagePattern(SHIPPING_PATTERNS.GET_CITIES)
  getCities() {
    return this.shippingService.getCities();
  }
}
