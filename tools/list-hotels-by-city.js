import { z } from "zod";
import { amadeus } from "../config/amadeus.js";

export const schema = {
  cityCode: z
    .string()
    .length(3)
    .describe("Código IATA de la ciudad o aeropuerto (3 letras)"),
  radius: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .describe("Radio de búsqueda en torno al centro de la ciudad (1-500)"),
  radiusUnit: z
    .enum(["KM", "MI"])
    .optional()
    .describe("Unidad del radio (KM o MI)"),
  chainCodes: z
    .string()
    .optional()
    .describe("Códigos de cadenas hoteleras separados por coma (ej: HY,EM)"),
  amenities: z
    .string()
    .optional()
    .describe(
      "Servicios del hotel separados por coma (ej: SWIMMING_POOL,WIFI)"
    ),
  ratings: z
    .string()
    .regex(/^[1-5](,[1-5]){0,3}$/)
    .optional()
    .describe("Categorías de estrellas separadas por coma (ej: 3,4,5)"),
};

export const handler = async ({
  cityCode,
  radius,
  radiusUnit,
  chainCodes,
  amenities,
  ratings,
}) => {
  try {
    const searchParams = {
      cityCode,
    };

    if (radius) {
      searchParams.radius = radius;
    }
    if (radiusUnit) {
      searchParams.radiusUnit = radiusUnit;
    }
    if (chainCodes) {
      searchParams.chainCodes = chainCodes;
    }
    if (amenities) {
      searchParams.amenities = amenities;
    }
    if (ratings) {
      searchParams.ratings = ratings;
    }

    const response = await amadeus.referenceData.locations.hotels.byCity.get(
      searchParams
    );

    const hotels = response.data.map((hotel) => ({
      hotelId: hotel.hotelId,
      name: hotel.name,
      rating: hotel.rating,
      amenities: hotel.amenities,
      address: hotel.address,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(hotels, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("Error al buscar hoteles:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error al buscar hoteles: ${
            error.message || "Error desconocido"
          }`,
        },
      ],
    };
  }
};
