# Travel Planner Tools for AI Agents

Este MCP server proporciona un conjunto de herramienta para la planificación de viajes.

## Herramientas Disponibles

- **`search_flights_offers`**: Busca ofertas de vuelos disponibles entre dos ciudades en fechas específicas.
- **`search_hotels_offers`**: Busca ofertas de hoteles en una ciudad para un rango de fechas determinado.

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/mcp-travel-planner.git
    ```
2.  **Instala las dependencias:**
    ```bash
    cd mcp-travel-planner
    npm install
    ```

## Integración con Agentes (Ej: Gemini)

Para usar estas herramientas, configura tu agente para que ejecute el script `index-stdio.js` y proporcione las credenciales de Amadeus como variables de entorno.

**Nota para usuarios de Gemini:** Si estás utilizando este proyecto como una herramienta para Gemini, puedes proporcionarle el archivo `GEMINI.md` que se encuentra en la raíz del repositorio. Este archivo contiene instrucciones y una persona sugerida para que el agente pueda estructurar mejor la planificación de viajes y seguir un flujo de trabajo óptimo.

A continuación, se muestra un ejemplo de configuración para un agente compatible con MCP:

```json
{
  "mcpServers": {
    "mcp-travel-planner": {
      "command": "node",
      "args": ["/ruta/absoluta/a/mcp-travel-planner/index-stdio.js"],
      "env": {
        "AMADEUS_TEST_CLIENT_ID": "TU_AMADEUS_TEST_ID",
        "AMADEUS_TEST_CLIENT_SECRET": "TU_AMADEUS_TEST_SECRET",
        "AMADEUS_PROD_CLIENT_ID": "TU_AMADEUS_PROD_ID",
        "AMADEUS_PROD_CLIENT_SECRET": "TU_AMADEUS_PROD_SECRET",
        "AMADEUS_ENV": "prod"
      }
    }
  }
}
```

### Notas de Configuración:

- **`args`**: Asegúrate de que la ruta al archivo `index-stdio.js` sea la ruta absoluta en tu sistema.
- **`env`**:
  - Reemplaza los valores `TU_AMADEUS_*` con tus credenciales reales, que puedes obtener de [Amadeus for Developers](https://developers.amadeus.com/).
  - Usa `AMADEUS_ENV: "prod"` para el entorno de producción o `"test"` para el de prueba.
