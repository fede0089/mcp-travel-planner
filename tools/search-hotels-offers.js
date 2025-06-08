import { z } from "zod";
import { amadeus } from "../config/amadeus.js";

export const schema = {
  hotelIds: z
    .string()
    .regex(/^[A-Za-z0-9]{8}(,[A-Za-z0-9]{8}){0,199}$/)
    .describe(
      "IDs de hoteles separados por coma (1-200 IDs, 8 caracteres cada uno)"
    ),
  adults: z
    .number()
    .min(1)
    .max(9)
    .describe("Número de adultos por habitación (1-9)"),
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de entrada en formato YYYY-MM-DD"),
  checkOutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Fecha de salida en formato YYYY-MM-DD"),
  roomQuantity: z
    .number()
    .min(1)
    .max(9)
    .optional()
    .describe("Número de habitaciones a cotizar (1-9)"),
  children: z.number().min(0).max(9).optional().describe("Número de niños"),
  childAges: z
    .array(z.number().min(0).max(17))
    .optional()
    .describe("Edades de los niños (0-17 años)"),
  countryOfResidence: z
    .string()
    .length(2)
    .optional()
    .describe("Código de país ISO 3166-1 alfa-2"),
  boardType: z
    .enum(["ROOM_ONLY", "BREAKFAST", "HALF_BOARD", "FULL_BOARD"])
    .optional()
    .describe("Tipo de pensión"),
  bestRateOnly: z
    .boolean()
    .optional()
    .describe("Si es true, devuelve solo la mejor tarifa por hotel"),
  includeClosed: z
    .boolean()
    .optional()
    .describe("Si es true, incluye ofertas no reservables"),
  priceRange: z
    .string()
    .regex(/^\d+-\d+$/)
    .optional()
    .describe("Rango de precios en formato min-max"),
  sort: z
    .enum(["PRICE", "PRICE_ASC", "PRICE_DESC"])
    .optional()
    .describe("Orden de los resultados"),
  view: z
    .enum(["LIGHT", "FULL", "FULL_ALL_IMAGES"])
    .optional()
    .describe("Cantidad de información en la respuesta"),
};

export const handler = async ({
  hotelIds,
  adults,
  checkInDate,
  checkOutDate,
  roomQuantity,
  children,
  childAges,
  countryOfResidence,
  boardType,
  bestRateOnly,
  includeClosed,
  priceRange,
  sort,
  view,
}) => {
  try {
    const searchParams = {
      hotelIds: hotelIds,
      adults,
      checkInDate,
      currency: "USD",
    };

    if (checkOutDate) {
      searchParams.checkOutDate = checkOutDate;
    }
    if (roomQuantity) {
      searchParams.roomQuantity = roomQuantity;
    }
    if (children) {
      searchParams.children = children;
      if (childAges) {
        searchParams.childAges = childAges;
      }
    }
    if (countryOfResidence) {
      searchParams.countryOfResidence = countryOfResidence;
    }
    if (boardType) {
      searchParams.boardType = boardType;
    }
    if (bestRateOnly) {
      searchParams.bestRateOnly = bestRateOnly;
    }
    if (includeClosed) {
      searchParams.includeClosed = includeClosed;
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      searchParams.priceRange = {
        min: parseInt(min),
        max: parseInt(max),
      };
    }
    if (sort) {
      searchParams.sort = sort;
    }
    if (view) {
      searchParams.view = view;
    }

    const response = await amadeus.shopping.hotelOffersSearch.get(searchParams);

    const offers = response.data.map((offer) => ({
      hotelId: offer.hotel.hotelId,
      name: offer.hotel.name,
      price: {
        total: offer.offers[0].price.total,
      },
      room: {
        type: offer.offers[0].room.type,
        description: offer.offers[0].room.description,
      },
      boardType: offer.offers[0].boardType,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(offers, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("Error al buscar ofertas de hoteles:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error al buscar ofertas de hoteles: ${
            error.message || "Error desconocido"
          }`,
        },
      ],
    };
  }
};
