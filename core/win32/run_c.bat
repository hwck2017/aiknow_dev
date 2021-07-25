@echo off
@chcp 65001

set input=%1
set output=%2

set exe_path=%cd%
set compiler="%exe_path%\resources\MinGW64\bin\gcc.exe"
set result="%exe_path%\%output%"

cls
%compiler% %input% -o %result% && %result%