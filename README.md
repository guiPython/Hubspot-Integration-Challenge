# Application Requirements
## Startup
### Must contain the hubspot api key in the __HUBSPOT_API_KEY__ environment variable of the .env file

### Before running the commands below make sure you have yarn installed
```bash
    # If you don't have yarn installed
    npm install --global yarn

    # Check install
    yarn --version
```
### After installing yarn you can run the yarn install command to download the application's dependencies

# Application Commands

```bash
    # Build and start application
    yarn start

    # Run application in dev mode
    yarn dev

    # Up docker container
    # Note: To run this command you must first build with docker-compose build
    yarn up
    "or"
    docker-compose build && yarn up

    # down docker container
    yarn down
```

### Note: use __yarn dev__ only if it was __not__ possible to start the application with __yarn start__ and __yarn up__.

### After executing the initialization commands the application will be available at  __localhost:3333__ if you need to change the default port of execution make sure to change it __.env__ file.
