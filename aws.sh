if [ $1 == "create" ]
  then
    aws dynamodb create-table \
      --table-name oispa-tweet \
      --attribute-definitions \
        AttributeName=Id,AttributeType=S \
      --key-schema AttributeName=Id,KeyType=HASH \
      --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
      --profile=oispa &> /dev/null
    echo "Database built"
    zip -r function.zip index.js config.js node_modules &> /dev/null
    aws lambda create-function \
      --function-name oispa-bot-twitter \
      --runtime nodejs6.10 \
      --zip-file fileb://function.zip \
      --profile=oispa
    rm function.zip
    echo "Lambda function deployed"
fi

if [ $1 == "deploy" ]
  then
    zip -r function.zip index.js config.js node_modules &> /dev/null
    aws lambda update-function-code \
      --function-name oispa-bot-twitter \
      --zip-file fileb://function.zip \
      --profile=oispa
    rm function.zip
    echo "Deploy successful"
fi
