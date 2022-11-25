# :speech_balloon: Bate-papo UOL API

# Índice

- [Sobre](#Sobre)
- [Rotas](#Rotas)
    - [Entrar na sala](#Entrar-na-sala)
    - [Listar participantes](#Listar-participantes)
    - [Postar mensagem](#Postar-mensagem)
    - [Listar mensagens](#Listar-mensagens)
    - [Listar mensagens de um usuário](#Listar-mensagens-de-um-usuário)
    - [Editar mensagem](#Editar-mensagem)
    - [Apagar mensagem](#Apagar-mensagem)
    - [Manter conexão](#Manter-conexão)
- [Como rodar em desenvolvimento](#Como-rodar-em-desenvolvimento)

<br/>

# Sobre
Bate-papo UOL é uma api de chat inspirada no [Bate-papo UOL](https://batepapo.uol.com.br/).

<br/>

# Rotas

URL base: `http://localhost:5000`

<br/>

## Entrar na sala
- Rota: `/participants`
- Método: `POST`
- Exemplo de Body:

  ```json
  {
    "name": "João"
  }
  ```

- Possíveis erros:
	- Campo *name* vazio ou com tipo diferente de string
	- Já existe um usuário com o *name* enviado

## Listar participantes
- Rota: `/participants`
- Método: `GET`
- Exemplo de Resposta:

  ```json
  {
    "name": "João",
    "lastStatus": 12313123
  }
  ```

## Postar mensagem
- Rota: `/messages`
- Método: `POST`
- Header User com o nome de usuário do remetente
- Exemplo de Body:

  ```json
  {
    "to": "Maria",
    "text": "oi sumida rs",
    "type": "private_message"
  }
  ```

- Possíveis erros:
	- Header User ausente
	- Campos do body vazios ou com tipo diferente de string
	- Campo *type* diferente de "message" e "private_message"
	- Remetente não existe

## Listar mensagens
- Rota: `/messages`
- Método: `GET`
- Header User com o nome de usuário
- Exemplo de Resposta:

  ```json
  [
    {
      "from": "João",
      "to": "Todos",
      "text": "oi galera",
      "type": "message",
      "time": "20:04:37"
    }
  ]
  ```
- Query string permitida:
	- limit: limita a quantidade de mensagens
		- Exemplo: `/messages/?limit=100`
		- **OBS:** todas as mensagens serão enviadas se a query string *limit* estiver ausente

- Possíveis erros:
	- Header User ausente
	- *limit* menor que 1, se query string *limit* existir
	- Usuário não existe

## Listar mensagens de um usuário
- Rota: `/messages/{username}`
- Método: `GET`
- Header User com o nome de usuário
- Exemplo de Resposta:

  ```json
  [
    {
      "from": "João",
      "to": "Todos",
      "text": "oi galera",
      "type": "message",
      "time": "20:04:37"
    }
  ]
  ```

- Possíveis erros:
	- Header User ausente
	- Usuário solicitante não existe

## Editar mensagem
- Rota: `/messages/{id}`
- Método: `PUT`
- Header User com o nome de usuário do remetente
- Exemplo de Body:

  ```json
  {
    "to": "Maria",
    "text": "oi sumida rs",
    "type": "private_message"
  }
  ```

- Possíveis erros:
	- Header User ausente
	- Campos do body vazios ou com tipo diferente de string
	- Campo *type* diferente de "message" e "private_message"
	- Remetente não existe
	- Mensagem com id enviado não existe
	- Mensagem não pertence ao solicitante da requisição

## Apagar mensagem
- Rota: `/messages/{id}`
- Método: `DELETE`
- Header User com o nome de usuário
- Possíveis erros:
	- Header User ausente
	- Mensagem com id enviado não existe
	- Mensagem não pertence ao solicitante da requisição

## Manter conexão
**Atenção:** essa rota deve ser acessada a cada 15 segundos para manter a conexão do usuário.

- Rota: `/status`
- Método: `POST`
- Header User com o nome de usuário
- Possíveis erros:
	- Header User ausente
	- Usuário não existe

<br/>

# Como rodar em desenvolvimento

**Atenção:** para rodar o projeto é preciso ter o [MongoDB](https://www.mongodb.com/docs/manual/installation/) instalado em sua máquina.

1. Clone esse repositório:
>```ruby
> git clone https://github.com/AnaLTFernandes/batepapo-uol-api.git
>```

2. Instale as dependências:
>```ruby
> npm install
>```

3. Configure o arquivo .env com base no arquivo .env.example

4. Inicie o projeto:
>```ruby
> npm run dev
>```

8. Divirta-se nas rotas :)
