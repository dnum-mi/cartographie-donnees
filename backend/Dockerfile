FROM python:3.8-alpine
ARG http_proxy
ARG https_proxy
ARG no_proxy
ARG npm_registry
ARG PYPI_URL
ARG PYPI_HOST

RUN apk update && \
    apk add --update nodejs npm && \
    apk add --update --no-cache netcat-openbsd && \
    apk add postgresql-dev gcc python3-dev musl-dev curl

RUN adduser -D backend

WORKDIR /home/backend

# Install frontend dependencies
COPY ["frontend/package.json", "frontend/package-lock.json*", "./"]
ENV NODE_ENV production
RUN if [ ! -z "$http_proxy" ] ; then \
    npm config delete proxy; \
    npm config set proxy $http_proxy; \
    npm config set https-proxy $https_proxy ; \
    npm config set no-proxy $no_proxy; \
    fi ; \
    [ -z "$npm_registry" ] || npm config set registry=$npm_registry ; \
    [ -z "$npm_registry" ] || npm config set strict-ssl false

# With internal npm repo (autosigned) NODE_TLS_REJECT_UNAUTHORIZED=0: to disable ssl verify  https.request (ex: cypress)
#   in post-install steps in modules install
RUN ssl="$(npm config get strict-ssl)" ; [ "x$ssl" = "xfalse" ] && export NODE_TLS_REJECT_UNAUTHORIZED=0 || true ; \
    npm ci --only=production --loglevel http

# Build the frontend
COPY frontend/src src
COPY frontend/public public
RUN npm run build --production

# Remove the node modules
RUN rm -rf /home/backend/node_modules

# Install backend dependencies
# Use internal corporate registry if available
COPY backend/requirements.txt requirements.txt
RUN python -m venv venv
RUN set -ex && [ -z "$PYPI_URL" ] || pip_args=" --index-url $PYPI_URL " ; \
    [ -z "$PYPI_HOST" ] || pip_args="$pip_args --trusted-host $PYPI_HOST " ; \
    echo "$no_proxy" |tr ',' '\n' | sort -u |grep "^$PYPI_HOST$" || \
    [ -z "$http_proxy" ] || pip_args="$pip_args --proxy $http_proxy " ; \
    venv/bin/pip install $pip_args --upgrade pip && \
    venv/bin/pip install $pip_args -r requirements.txt && \
    venv/bin/pip install $pip_args gunicorn

# Init db and serve the backend
COPY backend/app app
COPY backend/migrations migrations
COPY backend/backend.py backend/config.py backend/docker_boot.sh ./
RUN chmod +x docker_boot.sh

ENV FLASK_APP backend.py

RUN chown -R --verbose backend:backend ./
USER backend

EXPOSE 5000
ENTRYPOINT ["./docker_boot.sh"]
