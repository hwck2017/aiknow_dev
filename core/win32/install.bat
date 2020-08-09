@echo off

set input=%1

set exe_path=%cd%
set pipExe="%exe_path%\resources\Python\Scripts\pip3.exe"

set folder="C:\Users\Administrator\AppData\Local\Programs\python\"
if not exist %folder% (
  @md %folder%
  @mklink /d /j "%folder%\python37" "%exe_path%\resources\Python"
)

@%pipExe% install %input%