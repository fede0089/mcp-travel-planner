import { z } from "zod";
import { amadeus } from "../config/amadeus.js";

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

    // Agregar parámetros opcionales si están presentes
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

    const response = await amadeus.shopping.flightOffersSearch.get(
      searchParams
    );

    const flights = response.data.map((o) => {
      const outbound = o.itineraries[0];
      const inbound = o.itineraries[1];
      const lastSeg = (it) => it.segments[it.segments.length - 1];

      return {
        flightOfferId: o.id,

        price: {
          total: o.price.total,
          currency: o.price.currency,
        },

        airline: {
          code: o.validatingAirlineCodes[0],
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

        bookingUrl: o.links?.flightOffers ?? null,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(flights, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("Error al buscar vuelos:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error al buscar vuelos: ${
            error.message || "Error desconocido"
          }`,
        },
      ],
    };
  }
};
