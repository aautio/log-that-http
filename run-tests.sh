set -euo pipefail

mocharunner=$(<launch-mocha.js)

for v in {11..6}; do

    echo "node@${v}: Starting tests"
    npx -q node@${v} -e "$mocharunner"

    for i in $(ls -d test-e2e/*); do

        if diff <(npx -q node@${v} --require ../index ${i}/test.js) ${i}/snapshot.txt ;
        then
            echo "node@${v}: OK ${i}/snapshot.txt"
        else
            echo "node@${v}: ERROR ${i}/snapshot.txt. Check the diff from above."
            exit 1
        fi

        if diff <(LOG_THAT_HTTP_HEADERS=true LOG_THAT_HTTP_BODY=false npx -q node@${v} --require ../index ${i}/test.js) ${i}/snapshot-headers.txt ;
        then
            echo "node@${v}: OK ${i}/snapshot-headers.txt"
        else
            echo "node@${v}: ERROR ${i}/snapshot-headers.txt. Check the diff from above."
            exit 1
        fi

        if diff <(LOG_THAT_HTTP_HEADERS=true LOG_THAT_HTTP_BODY=true npx -q node@${v} --require ../index ${i}/test.js) ${i}/snapshot-headers-body.txt ;
        then
            echo "node@${v}: OK ${i}/snapshot-headers-body.txt"
        else
            echo "node@${v}: ERROR ${i}/snapshot-headers-body.txt. Check the diff from above."
            exit 1
        fi
    done
done