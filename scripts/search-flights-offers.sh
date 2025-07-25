#!/bin/bash

# Ejecutar el curl y guardar la respuesta
response=$(curl -s -X POST http://localhost:3333/mcp \
 -H "Content-Type: application/json" \
 -H "Accept: application/json, text/event-stream" \
 -d '{
       "jsonrpc":"2.0","id":99,
       "method":"tools/call",
       "params":{
         "name":"search-flights-offers",
         "arguments":{
           "originLocationCode":"EZE",
           "destinationLocationCode":"GIG",
           "departureDate":"2025-07-10",
           "returnDate":"2025-07-20",
           "adults": 1
         }
       }
     }')

# Extraer solo el JSON de la respuesta y formatearlo
echo "$response" | grep -A1 'event: message' | grep 'data:' | sed 's/^data: //' | jq '.result.content[0].text' | jq 'fromjson' 