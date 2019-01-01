set -eu

for i in $(ls -d test-e2e/*); do

    node --require ../index ${i}/test.js > ${i}/snapshot.txt
    LOG_THAT_HTTP_HEADERS=true LOG_THAT_HTTP_BODY=false node --require ../index ${i}/test.js > ${i}/snapshot-headers.txt
    LOG_THAT_HTTP_HEADERS=true LOG_THAT_HTTP_BODY=true node --require ../index ${i}/test.js > ${i}/snapshot-headers-body.txt
    
    echo "Updated snapshots for ${i}"
done
