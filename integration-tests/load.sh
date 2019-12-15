#!/bin/bash

max=100

for iter in $(seq 1 $max); do
  echo "Iteration $iter/$max"
  num=$(( ( RANDOM % 10 ) + 1 ))
  ./run_seq.sh $num
done


