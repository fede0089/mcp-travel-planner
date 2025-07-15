import { z } from "zod";
import { amadeus } from "../config/amadeus.js";
import { HotelOffer } from "../entities/HotelOffer.js";

const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log("[INFO]", ...args);
    }
  },
  error: (...args) => {
    if (isDev) {
      console.error("[ERROR]", ...args);
    }
  },
};

export const name = "search-hotels-offers";

export const description =
  "Busca ofertas de hoteles disponibles en una ciudad en fechas específicas. Usá esta herramienta cuando el usuario quiera consultar opciones de hotel para un viaje.";

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
  amenities: z
    .array(
      z.enum([
        "SWIMMING_POOL",
        "SPA",
        "FITNESS_CENTER",
        "AIR_CONDITIONING",
        "RESTAURANT",
        "PARKING",
        "PETS_ALLOWED",
        "AIRPORT_SHUTTLE",
        "BUSINESS_CENTER",
        "DISABLED_FACILITIES",
        "WIFI",
        "MEETING_ROOMS",
        "NO_KID_ALLOWED",
        "TENNIS",
        "GOLF",
        "KITCHEN",
        "ANIMAL_WATCHING",
        "BABY-SITTING",
        "BEACH",
        "CASINO",
        "JACUZZI",
        "SAUNA",
        "SOLARIUM",
        "MASSAGE",
        "VALET_PARKING",
        "BAR or LOUNGE",
        "KIDS_WELCOME",
        "NO_PORN_FILMS",
        "MINIBAR",
        "TELEVISION",
        "WI-FI_IN_ROOM",
        "ROOM_SERVICE",
        "GUARDED_PARKG",
        "SERV_SPEC_MENU",
      ])
    )
    .optional()
    .describe("Lista de servicios del hotel (ej: ['SWIMMING_POOL', 'WIFI'])"),
  ratings: z
    .string()
    .regex(/^[1-5](,[1-5]){0,3}$/)
    .optional()
    .describe("Categorías de estrellas separadas por coma (ej: 3,4,5)"),
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
  boardType: z
    .enum([
      "ROOM_ONLY",
      "BREAKFAST",
      "HALF_BOARD",
      "FULL_BOARD",
      "ALL_INCLUSIVE",
    ])
    .optional()
    .describe("Tipo de pensión"),
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
  cityCode,
  radius,
  radiusUnit,
  amenities,
  ratings,
  adults,
  checkInDate,
  checkOutDate,
  roomQuantity,
  children,
  childAges,
  boardType,
  priceRange,
  sort,
  view,
}) => {
  try {
    const listParams = {
      cityCode,
    };

    if (radius) {
      listParams.radius = radius;
    }
    if (radiusUnit) {
      listParams.radiusUnit = radiusUnit;
    }
    if (amenities && amenities.length > 0) {
      listParams.amenities = amenities.join(",");
    }
    if (ratings) {
      listParams.ratings = ratings;
    }

    logger.info("Searching hotels in city:", listParams);

    const listResponse =
      await amadeus.referenceData.locations.hotels.byCity.get(listParams);
    logger.info("Hotels found:", listResponse.data.length);

    const allHotels = listResponse.data;
    const offers = [];
    const BATCH_SIZE = 10;
    const MAX_OFFERS = 30;

    for (
      let i = 0;
      i < allHotels.length && offers.length < MAX_OFFERS;
      i += BATCH_SIZE
    ) {
      const hotelBatch = allHotels.slice(i, i + BATCH_SIZE);
      const hotelIds = hotelBatch.map((hotel) => hotel.hotelId).join(",");

      const searchParams = {
        hotelIds: hotelIds,
        adults,
        checkInDate,
        currency: "USD",
        includeClosed: false,
        bestRateOnly: true,
      };

      if (checkOutDate) {
        searchParams.checkOutDate = checkOutDate;
      }
      if (roomQuantity) {
        searchParams.roomQuantity = roomQuantity;
      }
      if (children) {
        searchParams.children = children;
        if (childAges && childAges.length > 0) {
          searchParams.childAges = childAges.join(",");
        }
      }
      if (boardType) {
        searchParams.boardType = boardType;
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

      logger.info("Searching hotel offers:", searchParams);

      try {
        const offersResponse = await amadeus.shopping.hotelOffersSearch.get(
          searchParams
        );
        logger.info("Offers found in batch:", offersResponse.data.length);

        const newOffers = offersResponse.data.map((offer) => {
          const hotelInfo = allHotels.find(
            (h) => h.hotelId === offer.hotel.hotelId
          );
          return HotelOffer.fromAmadeusResponse(offer, hotelInfo);
        });

        offers.push(...newOffers);

        if (offers.length >= MAX_OFFERS) {
          break;
        }
      } catch (error) {
        logger.error("Error searching hotel offers:", {
          message: error.message,
          code: error.code,
          description: error.description,
          status: error.response?.statusCode,
          response: error.response?.body,
        });
        continue;
      }
    }

    const finalOffers = offers.slice(0, MAX_OFFERS);
    logger.info("Total offers found:", finalOffers.length);

    if (finalOffers.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No se encontraron ofertas para los criterios especificados.",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: HotelOffer.toTableString(finalOffers),
        },
      ],
    };
  } catch (error) {
    logger.error("Error searching hotels:", {
      message: error.message,
      code: error.code,
      description: error.description,
      status: error.response?.statusCode,
      response: error.response?.body,
      stack: error.stack,
    });
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
