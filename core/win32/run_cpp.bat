@echo off
@chcp 65001

set input=%1
set output=%2

::set exec_path=%~dp0
set exe_path=%cd%
set compiler="%exe_path%\resources\MinGW64\bin\g++.exe"
set console="%exe_path%\resources\ConsolePauser.exe"
set result="%exe_path%\%output%"

%compiler% %input% -o %result%
%result%