import { z } from "zod";
import { amadeus } from "../config/amadeus.js";

export const schema = {
  origin: z
    .string()
    .length(3)
    .describe("Código IATA del aeropuerto de origen (3 letras)"),
  destination: z
    .string()
    .length(3)
    .describe("Código IATA del aeropuerto de destino (3 letras)"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de inicio del rango en formato YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de fin del rango en formato YYYY-MM-DD"),
  duration: z
    .string()
    .regex(/^\d{1,2},\d{1,2}$/)
    .optional()
    .describe("Rango de noches 'min,max' (solo ida-vuelta)"),
  oneWay: z
    .boolean()
    .optional()
    .default(false)
    .describe("Si es true, solo busca vuelos de ida"),
};

export const handler = async ({
  origin,
  destination,
  startDate,
  endDate,
  duration = "3,10",
  oneWay = false,
}) => {
  try {
    const { data } = await amadeus.shopping.flightDates.get({
      origin,
      destination,
      departureDate: `${startDate},${endDate}`,
      ...(oneWay ? {} : { duration }),
      viewBy: "DATE",
      currency: "USD",
    });
    if (oneWay) params.oneWay = true;
    const cheapest = data
      .sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))
      .slice(0, 10)
      .map((o) => ({
        dep: o.departureDate,
        ret: o.returnDate ?? null,
        price: o.price.total,
        currency: o.price.currency,
        nights: o.nights ?? null,
        offerLink: o.links.flightOffers,
      }));

    return {
      content: [
        {
          type: "text",
          text: `Top ${cheapest.length} fechas más baratas`,
        },
        {
          type: "json",
          data: cheapest,
        },
      ],
    };
  } catch (error) {
    console.error("Error al buscar fechas más baratas:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error al buscar fechas más baratas: ${
            error.message || "Error desconocido"
          }`,
        },
      ],
    };
  }
};
