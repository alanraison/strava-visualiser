#!/bin/bash
docker run --rm -ti -v ~/.docker-yarn-cache:/root/.yarn-cache:cached -p 3000:3000 -v $(pwd):/usr/src/app:cached -w /usr/src/app node yarn $@