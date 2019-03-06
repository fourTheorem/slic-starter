#!/bin/bash

source `dirname $0`/scripts/assume-cross-account-role.env
npm test
