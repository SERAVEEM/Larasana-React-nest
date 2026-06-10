import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SERVICES, SHIPPING_PATTERNS } from '../../../../libs/shared/src';
import { ShippingMethod } from '../../../../libs/shared/src/entities/shipping-method.entity';

/**
 * API Gateway controller for shipping-related routes.
 *
 * All requests are proxied to the Commerce microservice via TCP using the
 * SHIPPING_SERVICE client proxy.  The gateway itself performs no business logic.
 *
 * Route prefix:  /api/v1/shipping  (set in main.ts global prefix)
 */
@ApiTags('shipping')
@Controller('shipping')
export class ShippingGatewayController {
  constructor(@Inject(SERVICES.SHIPPING) private readonly client: ClientProxy) {}

  /**
   * GET /api/v1/shipping
   *
   * Returns a list of available shipping carriers and their rates.
   *
   * Priority resolution inside the Commerce service:
   *   1. addressId provided  →  load real Address row from DB and query the
   *      correct provider (RajaOngkir for ID, EasyPost for international).
   *   2. destination_country + optional destination_city  →  build a transient
   *      Address for estimation and query the correct provider.
   *   3. No address info  →  return DB-stored ShippingMethod rows or combined
   *      domestic + international fallback rates.
   *
   * The endpoint NEVER returns a 4xx/5xx error; it always falls back to
   * estimated rates so the frontend checkout page always has options.
   *
   * Response:  { success: true, data: ShippingOption[], message?: string }
   */
  @Get()
  @ApiOperation({
    summary: 'Get shipping carriers and rates',
    description:
      'Returns available couriers from origin Lombok Barat. ' +
      'Provide addressId for stored addresses, or destination_country/destination_city for live estimation. ' +
      'Falls back to standard estimated rates on API errors.',
  })
  @ApiQuery({
    name:        'addressId',
    required:    false,
    type:        Number,
    description: 'ID of the stored user address (preferred over destination_* params)',
  })
  @ApiQuery({
    name:        'weight',
    required:    false,
    type:        Number,
    description: 'Package weight in grams. Defaults to 1000 g when omitted.',
  })
  @ApiQuery({
    name:        'destination_country',
    required:    false,
    type:        String,
    description: 'ISO-2 country code (e.g. "ID", "US") or full name (e.g. "United States"). Used when addressId is absent.',
  })
  @ApiQuery({
    name:        'destination_city',
    required:    false,
    type:        String,
    description: 'Destination city name (e.g. "Jakarta", "Bandung"). Used when addressId is absent.',
  })
  @ApiOkResponse({
    type:        [ShippingMethod],
    description: 'List of available shipping carriers with rates',
  })
  getAll(
    @Query('addressId')           addressId?:           string,
    @Query('weight')              weight?:              string,
    @Query('destination_country') destination_country?: string,
    @Query('destination_city')    destination_city?:    string,
  ) {
    return this.client.send(SHIPPING_PATTERNS.GET_ALL, {
      addressId:           addressId ? Number(addressId) : undefined,
      weight:              weight    ? Number(weight)    : undefined,
      destination_country: destination_country ?? undefined,
      destination_city:    destination_city    ?? undefined,
    });
  }

  /**
   * GET /api/v1/shipping/cities
   *
   * Returns the full RajaOngkir city list (cached server-side after first fetch).
   * Used by the frontend address form for city autocomplete.
   */
  @Get('cities')
  @ApiOperation({
    summary:     'Get RajaOngkir city list',
    description: 'Returns the cached list of Indonesian cities from RajaOngkir. Falls back to a built-in list on API failure.',
  })
  getCities() {
    return this.client.send(SHIPPING_PATTERNS.GET_CITIES, {});
  }
}
