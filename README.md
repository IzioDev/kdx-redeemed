proposal name by Rilragos: XDK

todo:

- documentation on how to start the apps
- implement rate limit on sensitive endpoints: 'nonce' and 'login' requests for now
- reintroduce nonce on the login step so signed message are only usable once per intiated flow
  - nonce should comes from frontend to avoid an un-necessary handshake prior clicking the connexion button

requirements:

- NodeJs (tested on v20.11.0)
- Docker with Docker Compose
- (optionally) Nx CLI installed globally : `npm i -g nx`

start with the basic environment variables:

- `cp .env.example .env` (`.env` is git ignored by default)

start the applications:

- `npm run start local:db` - start local datasources
- `nx run client:serve` - start client application in watch mode
- `nx run backend:serve` - start main backend in watch mode
- `nx run signature_verifier:run` - run the Rust API (no watch mode)
