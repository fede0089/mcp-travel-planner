import Amadeus from "amadeus";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.AMADEUS_ENV || "test";
const clientId =
  env === "prod"
    ? process.env.AMADEUS_PROD_CLIENT_ID
    : process.env.AMADEUS_TEST_CLIENT_ID;
const clientSecret =
  env === "prod"
    ? process.env.AMADEUS_PROD_CLIENT_SECRET
    : process.env.AMADEUS_TEST_CLIENT_SECRET;

// Logs temporales para debug
console.log("Entorno:", env);
console.log("Client ID:", clientId?.substring(0, 4) + "...");
console.log("Client Secret:", clientSecret?.substring(0, 4) + "...");

if (!clientId || !clientSecret) {
  throw new Error(
    `Las credenciales de Amadeus para el entorno ${env} no están configuradas en el archivo .env`
  );
}

export const amadeus = new Amadeus({
  hostname: env === "prod" ? "production" : "test",
  clientId,
  clientSecret,
});
