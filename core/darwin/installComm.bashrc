#!/bin/bash

sdl=`brew list | grep sdl | wc -l`
if [ $sdl -eq 0 ]; then
    brew install sdl sdl_image sdl_mixer sdl_ttf portmidi
fi
