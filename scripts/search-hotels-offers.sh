#!/bin/bash

# Ejecutar el curl y guardar la respuesta
response=$(curl -s -X POST http://localhost:3333/mcp \
 -H "Content-Type: application/json" \
 -H "Accept: application/json, text/event-stream" \
 -d '{
       "jsonrpc":"2.0","id":99,
       "method":"tools/call",
       "params":{
         "name":"search-hotels-offers",
         "arguments":{
           "hotelIds":"WVBUECBH,LWBUE010",
           "adults": 2,
           "checkInDate": "2025-07-10",
           "checkOutDate": "2025-07-15",
           "boardType": "BREAKFAST",
           "bestRateOnly": true,
           "sort": "PRICE_ASC"
         }
       }
     }')

echo "$response" | grep -A1 'event: message' | grep 'data:' | sed 's/^data: //' | jq '.result.content[0].text' | jq 'fromjson' 