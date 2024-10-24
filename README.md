Parse a local CSV file and store the records into Localstack DynamoDB.

1. Example CSV file is from https://www.kaggle.com/datasets/prasertk/netflix-daily-top-10-in-us?resource=download for Netflix daily top 10

2. Require `docker`, `nodejs` and `terraform` installed

3. How to run it:

    - go to `devops` folder and run `terraform init` 
    - then under `devops` folder run `make up` to start up docker containers and init localstack DynamoDB
    - finally back to the root folder, and run `npm run start -- -f netflix_daily_top_10.csv`
   
4. After completed the above executions, go to `http://localhost:8001/` and check the stored records.

5. To clean things up, go to `devops` folder and run `make down` to stop the docker containers.
