import { z } from "zod";
import { amadeus } from "../config/amadeus.js";
import { FlightOffer } from "../entities/FlightOffer.js";

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

export const name = "search-flights-offers";

export const description =
  "Busca ofertas de vuelos disponibles entre dos aeropuertos en fechas específicas. Usá esta herramienta cuando el usuario quiera consultar opciones de vuelo para un viaje.";

export const schema = {
  originLocationCode: z
    .string()
    .length(3)
    .describe("Código IATA del aeropuerto de origen (3 letras)"),
  destinationLocationCode: z
    .string()
    .length(3)
    .describe("Código IATA del aeropuerto de destino (3 letras)"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de salida en formato YYYY-MM-DD"),
  adults: z.number().describe("Número de adultos"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Fecha de regreso en formato YYYY-MM-DD (opcional)"),
  nonStop: z
    .boolean()
    .optional()
    .describe("Si es true, solo muestra vuelos sin escalas"),
  includedAirlineCodes: z
    .string()
    .optional()
    .describe("Códigos IATA de aerolíneas separados por coma (ej: G3,TAM)"),
  children: z.number().optional().describe("Número de niños (2-11 años)"),
  infants: z.number().optional().describe("Número de infantes (0-2 años)"),
  travelClass: z
    .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
    .optional()
    .describe("Clase de viaje deseada"),
  maxPrice: z.number().optional().describe("Precio máximo por pasajero"),
  excludedAirlineCodes: z
    .string()
    .optional()
    .describe("Códigos IATA de aerolíneas a excluir separados por coma"),
};

export const handler = async ({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  adults,
  returnDate,
  nonStop,
  includedAirlineCodes,
  children,
  infants,
  travelClass,
  maxPrice,
  excludedAirlineCodes,
}) => {
  try {
    const searchParams = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      returnDate,
      max: 10,
      currencyCode: "USD",
    };

    if (nonStop) {
      searchParams.nonStop = true;
    }
    if (includedAirlineCodes) {
      searchParams.includedAirlineCodes = includedAirlineCodes.split(",");
    }
    if (children) {
      searchParams.children = children;
    }
    if (infants) {
      searchParams.infants = infants;
    }
    if (travelClass) {
      searchParams.travelClass = travelClass;
    }
    if (maxPrice) {
      searchParams.maxPrice = maxPrice;
    }
    if (excludedAirlineCodes) {
      searchParams.excludedAirlineCodes = excludedAirlineCodes.split(",");
    }

    logger.info("Searching flights offers:", searchParams);

    const response = await amadeus.shopping.flightOffersSearch.get(
      searchParams
    );

    logger.info("Flights retrieved:", response.data.length);

    const flights = response.data.map((offer) =>
      FlightOffer.fromAmadeusResponse(offer)
    );

    return {
      content: [
        {
          type: "text",
          text: FlightOffer.toTableString(flights),
        },
      ],
    };
  } catch (error) {
    logger.error("Error al buscar vuelos:", {
      message: error.message,
      code: error.code,
      description: error.description,
      status: error.response?.statusCode,
      response: error.response?.body,
      stack: error.stack,
    });
    const errorResponse = {
      content: [
        {
          type: "text",
          text: `Error al buscar vuelos: ${
            error.message || "Error desconocido"
          }`,
        },
      ],
    };
    logger.error(
      "Respuesta de error de la tool:",
      JSON.stringify(errorResponse, null, 2)
    );
    return errorResponse;
  }
};
