
docker-up:
	@echo "starting up docker..."
	docker compose up -d

docker-down:
	@echo "shutting down docker..."
	docker compose down

terraform:
	@echo "running terraform..."
	terraform apply --auto-approve

clean:
	@echo "tidying up docker volumes"
	docker volume rm $$(docker volume ls -q --filter dangling=true)

up: docker-up terraform

down: docker-down clean