export class HotelOffer {
  constructor({ name, rating, amenities, price, room, boardType }) {
    this.name = name;
    this.rating = rating;
    this.amenities = amenities;
    this.price = price;
    this.room = room;
    this.boardType = boardType;
  }

  static fromAmadeusResponse(offer, hotelInfo) {
    return new HotelOffer({
      name: offer.hotel.name,
      rating: hotelInfo?.rating,
      amenities: hotelInfo?.amenities,
      price: {
        total: offer.offers[0].price.total,
        currency: offer.offers[0].price.currency,
      },
      room: offer.offers[0].room.description.text,
      boardType: offer.offers[0].boardType,
    });
  }

  toJSON() {
    return {
      name: this.name,
      rating: this.rating,
      amenities: this.amenities,
      price: this.price,
      room: this.room,
      boardType: this.boardType,
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
      "Nombre",
      "Rating",
      "Precio Total",
      "Habitación",
      "Pensión",
      "Servicios",
    ];

    const rows = offers.map((offer) => {
      return [
        offer.name,
        offer.rating ? `${offer.rating}★` : "N/A",
        `${offer.price.total} ${offer.price.currency}`,
        offer.room,
        offer.boardType || "N/A",
        offer.amenities?.slice(0, 3).join(", ") || "N/A",
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
