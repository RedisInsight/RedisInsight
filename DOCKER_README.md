# Docker

Included in this repository is a Dockerfile that can be used to deploy a hosted instance of Redis Insight.

# Usage

To build and run the image locally with Docker buildx, simply

```
$ docker buildx build -t redis-insight:latest
$ docker run -d -p5000:5000 redis-insight:latest
```

These commands will build the image and then start the container. Redis Insight can then be accessed on localhost port 5000, `http://localhost:5000`.

# Configuration

Redis Insight supports several configuration values that can be supplied via container environment variables. The following may be provided:

| Variable | Purpose | Default | Additional Info |
| ---------|---------|-----------------|---------|
| RI_APP_PORT | The port the app listens on | 5000 | See [Express Documentation](https://expressjs.com/en/api.html#app.listen) |
| RI_APP_HOST | The host the app listens on | 0.0.0.0 | See [Express Documentation](https://expressjs.com/en/api.html#app.listen) |
| RI_SERVER_TLS_KEY | Private key for HTTPS | | Private key in [PEM format](https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/#ftoc-heading-3). May be a path to a file or a string in PEM format. |
| RI_SERVER_TLS_CERT | Certificate for supplied private key | | Public certificate in [PEM format](https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/#ftoc-heading-3) |
