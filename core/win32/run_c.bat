@echo off

@chcp 65001
set input=%1
set output=%2

::set exec_path=%~dp0
set exe_path=%cd%
set compiler="%exe_path%\resources\MinGW64\bin\gcc.exe"
set console="%exe_path%\resources\ConsolePauser.exe"

%compiler% %input% -o %output%
%console% %output%