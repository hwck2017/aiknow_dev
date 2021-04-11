@echo off
@chcp 65001

set input=%1
set output=%2


set exe_path=%cd%
set compiler="%exe_path%\resources\MinGW64\bin\gcc.exe"
set console="%exe_path%\resources\ConsolePauser.exe"

@REM set folder="C:\Users\Administrator\AppData\Local\Programs"
@REM if not exist %folder% (
@REM   @md %folder%
@REM )
@REM set result="%folder%\%output%"

set result="%exe_path%\%output%"
%compiler% %input% -o %result%
%result%