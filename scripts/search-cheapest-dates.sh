#!/bin/bash

# Ejecutar el curl y guardar la respuesta
response=$(curl -s -X POST http://localhost:3333/mcp \
 -H "Content-Type: application/json" \
 -H "Accept: application/json, text/event-stream" \
 -d '{
       "jsonrpc":"2.0","id":99,
       "method":"tools/call",
       "params":{
         "name":"search-cheapest-dates",
         "arguments":{
           "origin":"EZE",
           "destination":"BKK",
           "startDate":"2025-07-01",
           "endDate":"2025-12-31",
           "duration":"21,28"
         }
       }
     }')

# Extraer solo el JSON de la respuesta y formatearlo
echo "$response" | grep -o '{"result".*}' | jq '.result.content[1].data' 