#!/bin/bash

set -e

num=$1

echo Starting run of $num
for i in seq 1 $num; do
  npm t 2>&1 >> $i.log &
  pids[${i}]=$!
done

for pid in ${pids[*]}; do
  wait $pid
done
echo Finished run of $num
