#!/bin/sh

[[ -n $RESET_DB ]] && flask cli reset-db

flask db upgrade

pip install gunicorn

gunicorn backend:app
  -w 1 -b 0.0.0.0:$PORT \
  --timeout 90 \
  --worker-class gevent
