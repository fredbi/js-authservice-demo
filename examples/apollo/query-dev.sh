#! /bin/bash
set -e -o pipefail
echo "Enter service account client secret:"
read secret
token=$(curl  \
  --data-urlencode 'client_id=depmon-account' \
  --data-urlencode "client_secret=${secret}" \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'scope=openid' \
  --url https://auth.dev.onec.co/auth/realms/oneconcern/protocol/openid-connect/token |\
jq ".access_token"|sed 's/"//g')
#echo "Token: ${token}"
curl 'http://demo.localtest.me:6092/graphql' \
    -H 'Accept-Encoding: gzip, deflate, br' \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Connection: keep-alive' \
    -H 'DNT: 1' \
    -H "Authorization: bearer ${token}" \
    -H 'Origin: http://demo.localtest.me:6092' \
    --data-binary '{"query":"query{todos{text,id}}# Write your query or mutation here\n"}' \
    --compressed
