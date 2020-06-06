@echo off

set input=%1

set exe_path=%cd%
set compiler="%exe_path%\resources\Python\python.exe"

@%compiler% %input%