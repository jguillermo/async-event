.DEFAULT_GOAL := help

## GENERAL ##
OWNER 			= getmin
SERVICE_NAME 	= api-async-service

## DEPLOY ##
export ENV 		   ?= dev
export SLS_KEY     ?= YOUR_SLS_KEY
export SLS_SECRET  ?= YOUR_SLS_SECRET


## RESULT_VARS ##
export PROJECT_NAME	     = $(OWNER)-$(ENV)-$(SERVICE_NAME)
export CONTAINER_NAME 	 = $(PROJECT_NAME)_backend
export IMAGE_DEV		 = $(PROJECT_NAME):dev
export IMAGE_DIST		 = $(PROJECT_NAME):dist
export IMAGE_RAML        = $(PROJECT_NAME):raml

## Init container Commons ##
build: ## build image to dev: make build
	docker build -f container/dev/Dockerfile -t $(IMAGE_DEV) \
		--build-arg SLS_KEY=$(SLS_KEY) \
		--build-arg SLS_SECRET=$(SLS_SECRET) \
		application

install: ## build image to dev: make install
	make build
	make console a="npm install"
	docker build -f container/raml/Dockerfile -t $(IMAGE_RAML) container/raml/

console: ## ejecuta la consola de la imagen node: make a="param"
	@docker run --rm -t -v ${PWD}/application:/application -e "PROJECT_NAME=${PROJECT_NAME}" $(IMAGE_DEV) ${a}

start: ## up docker containers: make up
	docker-compose -f container/docker-compose.yml up -d

## SERVERLESS ##
sls-deploy: ## build image to dev: make build
	docker build -f container/dist/Dockerfile -t $(IMAGE_DIST) \
		--build-arg IMAGE=$(IMAGE_DEV) \
		--build-arg STAGE=${ENV} \
		--build-arg PROJECT_NAME=${PROJECT_NAME} \
		application

sls-remove: ## stop docker containers: make stop
	make console a="serverless remove --stage ${ENV}"

sls-log: ## stop docker containers: make stop
	make console a="serverless logs -f ResizeImage"

## Documentation RAML##
raml-generate: ## build image to raml: make build-raml
	docker run --rm -v $(PWD):/application $(IMAGE_RAML) -i /application/doc/api.raml -o /application/doc/api.html
	#docker run --rm -v $(PWD):/application $(IMAGE_RAML) --theme raml2html-markdown-theme -i /application/doc/api.raml -o /application/doc/dist/DOC.md
	mv doc/api.html application/doc/api.html
raml-live: ## build image to raml: make raml-live
	docker run -d --name api-designer -v $(PWD)/doc:/raml -p 3000:3000 loostro/api-designer:0.3.2
	open http://localhost:3000/

## Tools docker##
docker-kill: ## Execute migrate : make migrate
	docker rm -f $$(docker ps -aq)

docker-rmi-dangling: ## Execute migrate : make migrate
	docker rmi $$(docker images -qf "dangling=true")

## Target Help ##
help:
	@printf "\033[31m%-16s %-59s %s\033[0m\n" "Target" "Help" "Usage"; \
	printf "\033[31m%-16s %-59s %s\033[0m\n" "------" "----" "-----"; \
	grep -hE '^\S+:.*## .*$$' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' | sort | awk 'BEGIN {FS = ":"}; {printf "\033[32m%-16s\033[0m %-58s \033[34m%s\033[0m\n", $$1, $$2, $$3}'
