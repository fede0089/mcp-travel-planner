import { z } from "zod";

export const schema = {
  name: z.string(),
};

export const handler = async ({ name }) => {
  return {
    content: [{ type: "text", text: `Hola ${name}!` }],
  };
};
