#!/bin/bash

max=1000

for iter in $(seq 1 $max); do
  echo "Iteration $iter/$max"
  num=$(( ( RANDOM % 10 ) + 1 ))
  ./run_seq.sh $num
  sleep 5
done


