![Logo!](https://avatars.githubusercontent.com/u/98192226?s=200&v=4)

# Authsio

## The Repository

Core authsio web application for identity & access management

For more information about this project click here [link](https://www.authsio.com/)

## Backend Details



## iframe Details


## Frontend Details


## Project Plan


## Contributors List


## Companies Using Software List
### Deployment (WIP)

We are using [Turborepo](https://turborepo.org/) to compile and build our application.

### Developer Setup (WIP)

#### Notes:

- As this project is currently not feature stable, no postgres tables are currently made when running the backend application
- Each section of the application has its own `package.json` and `tsconfig.json`

#### Backend

- You must be inside the `backend` folder to work on the backend code from the cli (ie: node & npm commands)
- We recommend using vscode and install the [Remote - Containers Plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Doing this will allow vscode to use the `.devcontainer` setting up your developer workspace
- Port 5432, and 4000 will be exposed to your local machine
- 5432: Has a docker container with Postgres running
- 4000: Will have the node app, after starting it with `npm run start:dev` using default settings

##### New Backend Project

Using the `bootstrap` mutation you can setup a brand new workspace for you and your project's users.

#### IFrame

#### Frontend
