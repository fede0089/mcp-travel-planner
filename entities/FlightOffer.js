export class FlightOffer {
  constructor({ flightOfferId, price, airline, outboundFlight, returnFlight }) {
    this.flightOfferId = flightOfferId;
    this.price = price;
    this.airline = airline;
    this.outboundFlight = outboundFlight;
    this.returnFlight = returnFlight;
  }

  static fromAmadeusResponse(offer) {
    const outbound = offer.itineraries[0];
    const inbound = offer.itineraries[1];
    const lastSeg = (it) => it.segments[it.segments.length - 1];

    return new FlightOffer({
      flightOfferId: offer.id,
      price: {
        total: offer.price.total,
        currency: offer.price.currency,
      },
      airline: {
        code: offer.validatingAirlineCodes[0],
      },
      outboundFlight: {
        departureTime: outbound.segments[0].departure.at,
        arrivalTime: lastSeg(outbound).arrival.at,
        duration: outbound.duration,
        numberOfStops: outbound.segments.length - 1,
      },
      returnFlight: inbound
        ? {
            departureTime: inbound.segments[0].departure.at,
            arrivalTime: lastSeg(inbound).arrival.at,
            duration: inbound.duration,
            numberOfStops: inbound.segments.length - 1,
          }
        : null,
    });
  }

  toJSON() {
    return {
      flightOfferId: this.flightOfferId,
      price: this.price,
      airline: this.airline,
      outboundFlight: this.outboundFlight,
      returnFlight: this.returnFlight,
    };
  }
}
