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
      room: {
        type: offer.offers[0].room.type,
        description: offer.offers[0].room.description,
      },
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
}
