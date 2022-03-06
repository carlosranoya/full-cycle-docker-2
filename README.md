# full-cycle-docker-2

## Desafio número dois do módulo sobre Docker  
<br/><br/>
Para rodar a aplicaçãp localcmente basta digitar 
<br/><br/>

```sh
docker-compose up
```
<br/>
As seguintes urls devolverão o retorno pedido no desafio:
<br/><br/>

```sh
localhost:8080

localhost:8080/index

localhost:8080/index.js

localhost:8080/people
```
<br/>
Ainda é possível inserir novos nomes na lista:
<br/><br/>

```sh
curl --location --request POST 'http://localhost:8080/person' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Joaquim"
}'
```
<br/>
ou apagar usuários pelo seu id:
<br/><br/>

```sh
curl --location --request DELETE 'http://localhost:8080/person' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id": 53027
}'
```

