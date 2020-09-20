@echo off

set exe_path=%cd%
set folder="C:\Users\Administrator\AppData\Local\Programs\python"
if exist %folder% (
  @rd /s /q %folder%
)

@md %folder%
@mklink /d /j "%folder%\python37" "%exe_path%\resources\Python"
