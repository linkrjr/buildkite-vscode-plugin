# Buildkite for VS Code

This extension adds a Buildkite view to the Activity Bar. Connect with a Buildkite user token, choose an authorized organization, browse its pipelines, monitor the pipeline matching the selected workspace folder's `origin` remote, and trigger an authorized build.

## Security model

The extension stores the user token exclusively in VS Code `SecretStorage`. Buildkite response data is held only in memory for the current VS Code session. Trigger environment values are masked before confirmation, sent only in the build-creation request, and discarded immediately afterwards. The extension does not create logs, settings, files, terminals, telemetry, or diagnostics containing tokens or trigger environment values.

## Development

```sh
npm install
npm test
```
