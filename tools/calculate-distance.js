import { z } from "zod";

export const schema = {
  startLat: z.number(),
  startLng: z.number(),
  endLat: z.number(),
  endLng: z.number(),
};

export const handler = async ({ startLat, startLng, endLat, endLng }) => {
  const distance = Math.sqrt(
    Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)
  );
  return {
    content: [
      {
        type: "text",
        text: `La distancia es aproximadamente ${distance.toFixed(2)} grados`,
      },
    ],
  };
};
