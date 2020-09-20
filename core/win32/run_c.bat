@echo off

@chcp 65001
set input=%1
set output=%2


set exe_path=%cd%
set compiler="%exe_path%\resources\MinGW64\bin\gcc.exe"
set console="%exe_path%\resources\ConsolePauser.exe"

set folder="C:\Users\Administrator\AppData\Local\Programs"
if not exist %folder% (
  @md %folder%
)
set result="%folder%\%output%"

%compiler% %input% -o %result%
%console% %result%