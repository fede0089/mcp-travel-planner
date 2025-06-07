import { z } from "zod";
import Amadeus from "amadeus";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  throw new Error(
    "Las credenciales de Amadeus no están configuradas en el archivo .env"
  );
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

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
  maxPrice: z.number().optional().describe("Precio máximo en USD"),
};

export const handler = async ({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  adults,
  returnDate,
  nonStop,
  includedAirlineCodes,
  maxPrice,
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
    if (maxPrice) {
      searchParams.maxPrice = maxPrice;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(
      searchParams
    );

    const flights = response.data.map((o) => {
      const outbound = o.itineraries[0];
      const inbound = o.itineraries[1];
      const lastSeg = (it) => it.segments[it.segments.length - 1];

      return {
        offerId: o.id,
        price: o.price.total,
        currency: o.price.currency,
        airline: o.validatingAirlineCodes[0],
        dep: outbound.segments[0].departure.at,
        arr: lastSeg(outbound).arrival.at,
        duration: outbound.duration,
        stops: outbound.segments.length - 1,
        depReturn: inbound?.segments[0].departure.at ?? null,
        arrReturn: inbound ? lastSeg(inbound).arrival.at : null,
        durationReturn: inbound?.duration ?? null,
        stopsReturn: inbound ? inbound.segments.length - 1 : null,
        deepLink: o.links?.flightOffers ?? null,
      };
    });

    return {
      content: [
        {
          type: "json",
          data: flights,
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
