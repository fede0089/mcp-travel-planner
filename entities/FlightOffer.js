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

  static toJSONString(offers) {
    return JSON.stringify(offers, null, 2);
  }

  static toTableString(offers) {
    if (!offers || offers.length === 0) {
      return "No hay ofertas disponibles";
    }

    const headers = [
      "ID",
      "Aerolínea",
      "Precio Total",
      "IDA - Salida",
      "IDA - Llegada",
      "IDA - Duración",
      "IDA - Escalas",
      "VUELTA - Salida",
      "VUELTA - Llegada",
      "VUELTA - Duración",
      "VUELTA - Escalas",
    ];

    const rows = offers.map((offer) => {
      const outbound = offer.outboundFlight;
      const returnFlight = offer.returnFlight;
      return [
        offer.flightOfferId,
        offer.airline.code,
        `${offer.price.total} ${offer.price.currency}`,
        new Date(outbound.departureTime).toLocaleString(),
        new Date(outbound.arrivalTime).toLocaleString(),
        outbound.duration,
        outbound.numberOfStops,
        returnFlight
          ? new Date(returnFlight.departureTime).toLocaleString()
          : "-",
        returnFlight
          ? new Date(returnFlight.arrivalTime).toLocaleString()
          : "-",
        returnFlight ? returnFlight.duration : "-",
        returnFlight ? returnFlight.numberOfStops : "-",
      ];
    });

    const maxLengths = headers.map((_, i) =>
      Math.max(headers[i].length, ...rows.map((row) => String(row[i]).length))
    );

    const formatRow = (row) =>
      "| " +
      row.map((cell, i) => String(cell).padEnd(maxLengths[i])).join(" | ") +
      " |";

    const separator =
      "+-" + maxLengths.map((l) => "-".repeat(l)).join("-+-") + "-+";

    return [
      separator,
      formatRow(headers),
      separator,
      ...rows.map(formatRow),
      separator,
    ].join("\n");
  }
}
