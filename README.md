# Xero OAuth 2.0 App

## Overview

This was created to facilitate receiving Xero [webhooks](https://developer.xero.com/documentation/guides/webhooks/overview).

## Todo

- [ ] Add environment variable for Flow url
- [ ] Forward data to Flow url

## Thought process

Events from Xero are forwarded into Power Automate to be processed in Flow.

The choice was made to do it this way to ensure that changes could be made using low-code / no-code methods.

## Essential reading

More information about how this works can be found [here](https://developer.xero.com/documentation/guides/webhooks/configuring-your-server); video instructions available [here](https://youtu.be/_YfbOzATY8Q). OAuth2.0 is based on Xero's [example](https://github.com/XeroAPI/xero-node-oauth2-app).

Using bleeding edge [Azure Functions V4 with TypeScript](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-typescript?pivots=nodejs-model-v4). Most of the Microsoft documentation has updated with the V4 changes, but specific methods and changes can be found [here](https://techcommunity.microsoft.com/t5/apps-on-azure-blog/azure-functions-version-4-of-the-node-js-programming-model-is-in/ba-p/3773541).

## Configuration

### Installation

1. Follow instructions to [Configure your local environment](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?tabs=azure-cli%2Cbrowser&pivots=nodejs-model-v4#configure-your-local-environment)
2. `npm install`

### Local environment variables

1. Rename `local.settings.example.json` to `local.settings.json`
2. Add missing `XERO_WEBHOOK_KEY` value (this is provided to us by Xero in the [developer portal](https://developer.xero.com/))

### Running locally

1. `npm start`
2. `ngrok http 7071`

### Deploying

Any changes made to `main` branch will be automatically deployed to Azure Functions...**you have been warned**! If this happens, Flows will break / functionality will not be triggered.
