# TiltFrenzy

TiltFrenzy is a mobile-first, classroom-friendly review game for browsers. One player holds up
a phone while teammates give clues. The player tilts the phone to mark a card Correct or Pass,
or uses the always-available touch controls.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For checks and a production build:

```bash
npm run typecheck
npm test
npm run build
```

## Motion controls

TiltFrenzy uses browser `DeviceOrientationEvent` data when available. Motion controls are
optional: the large Correct and Pass buttons and keyboard shortcuts work without sensor data.

Motion access normally requires HTTPS outside of local development. iOS Safari also requires
the permission request to happen directly after a user taps a button. That is why TiltFrenzy
requests access from **Enable Motion & Calibrate** instead of asking on page load.

During calibration, hold the phone in a comfortable starting position for three seconds.
Afterward, tilt backward/up for Correct and forward/down for Pass. The directions can be
reversed in round setup. Tilt back to the neutral position between cards so one movement does
not score multiple cards.

### Troubleshooting tilt

- Use the Correct and Pass buttons if a browser reports that motion is unavailable.
- Serve the production build over HTTPS when testing on a phone.
- On iOS Safari, reload the page and tap **Enable Motion & Calibrate** again if no prompt appears.
- Check browser or device privacy settings if permission was denied.
- Try reversing the tilt directions if the device orientation feels opposite to expectations.
- Hold the phone steady during the three-second calibration countdown.

## Keyboard controls

- `Right Arrow`: Correct
- `Left Arrow`: Pass
- `Space`: Pause or resume

## Custom decks

Use **Create/Edit Decks** to make decks stored in browser LocalStorage. Built-in decks are
read-only, but each can be copied into an editable custom deck. Prompts can be pasted one per
line. Full decks can also be exported and imported as JSON.

## Deploy

Run `npm run build` and publish the generated `dist/` directory. Vite uses relative asset URLs,
so the build can be hosted on GitHub Pages, Netlify, Vercel, or another static host. Use an
HTTPS URL if you want motion controls on mobile devices.

## Docker

TiltFrenzy also ships as a multi-stage Docker image. The final container serves the static
bundle from an unprivileged Nginx process on port `8080`.

Build and run it locally:

```bash
docker compose up --build -d
curl http://127.0.0.1:8080/healthz
```

Open `http://127.0.0.1:8080`. Stop the local container with:

```bash
docker compose down
```

The container is stateless. Custom decks stay in the browser's LocalStorage, so rebuilding or
updating the image does not remove a user's decks on that same browser and site URL.

## Publish to GHCR

The GitHub Actions workflow in `.github/workflows/publish-container.yml` publishes multi-platform
images to GitHub Container Registry after a push to `main`, a `v*` tag, or a manual workflow run.
For this repository, the expected image is:

```text
ghcr.io/hallveticapro/tiltfrenzy:latest
```

The workflow also publishes the branch name, Git tag, and commit SHA as image tags. If the
repository is pushed under another GitHub account or organization, update the image path in
`docker-compose.yml`; the workflow image path follows the GitHub repository automatically.

## Run on Unraid

Create a new Docker container in Unraid with these values:

| Setting | Value |
| --- | --- |
| Repository | `ghcr.io/hallveticapro/tiltfrenzy:latest` |
| Container port | `8080` |
| Host port | Any available port, such as `8080` |
| Network type | Your usual reverse-proxy-compatible network |
| Restart policy | `unless-stopped` |

Point the reverse proxy upstream to `http://<unraid-ip>:8080` or the container name and port if
the proxy shares its Docker network. Terminate TLS at the reverse proxy and use an HTTPS public
URL. HTTPS is required for mobile motion permissions outside local development.

If the GHCR package is private, configure Unraid with a GitHub username and a personal access
token that can read packages before pulling the image. Publishing the package publicly avoids
that extra registry-login step.
