#!/bin/bash

# Ejecutar el curl y guardar la respuesta
response=$(curl -s -X POST http://localhost:3333/mcp \
 -H "Content-Type: application/json" \
 -H "Accept: application/json, text/event-stream" \
 -d '{
       "jsonrpc":"2.0","id":99,
       "method":"tools/call",
       "params":{
         "name":"search-flights",
         "arguments":{
           "originLocationCode":"EZE",
           "destinationLocationCode":"GIG",
           "departureDate":"2025-07-10",
           "returnDate":"2025-07-15",
           "adults": 1,
           "nonStop": true
         }
       }
     }')

# Extraer solo el JSON de la respuesta y formatearlo
echo "$response" | grep -o '{"result".*}' | jq '.result.content[0].data' 