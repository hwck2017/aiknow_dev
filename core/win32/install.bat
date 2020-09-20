@echo off

set input=%1

set exe_path=%cd%
set pipExe="%exe_path%\resources\Python\Scripts\pip3.exe"

REM set folder="C:\Users\Administrator\AppData\Local\Programs\python\"
REM if not exist %folder% (
REM   @md %folder%
REM   @mklink /d /j "%folder%\python37" "%exe_path%\resources\Python"
REM )

@%pipExe% install %input%