#!/bin/bash

npm run build
cp -r build/mac/editor-dev.app/Contents/* ../../dev-package/Contents/
cp -r build/mac/editor-dev.app/Contents/* /Applications/aiknow-dev.app/Contents/
