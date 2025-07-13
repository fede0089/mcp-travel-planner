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
        "AMADEUS_PROD_CLIENT_ID": "TU_AMADEUS_PROD_ID",
        "AMADEUS_PROD_CLIENT_SECRET": "TU_AMADEUS_PROD_SECRET"
      }
    }
  }
}
```

### Notas de Configuración:

- **`args`**: Asegúrate de que la ruta al archivo `index-stdio.js` sea la ruta absoluta en tu sistema.
- **`env`**: Reemplaza los valores `TU_AMADEUS_*` con tus credenciales de producción reales, que puedes obtener de [Amadeus for Developers](https://developers.amadeus.com/). La plataforma ofrece una cuota de peticiones gratuitas mensuales que son más que suficientes para un uso particular.
