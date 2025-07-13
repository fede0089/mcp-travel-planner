import Amadeus from "amadeus";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.AMADEUS_PROD_CLIENT_ID;
const clientSecret = process.env.AMADEUS_PROD_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    `Las credenciales de producción de Amadeus (AMADEUS_PROD_CLIENT_ID y AMADEUS_PROD_CLIENT_SECRET) no están configuradas.`
  );
}

export const amadeus = new Amadeus({
  hostname: "production",
  clientId,
  clientSecret,
});
