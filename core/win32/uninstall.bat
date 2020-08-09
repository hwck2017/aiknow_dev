@echo off

set input=%1

set exe_path=%cd%
set pipExe="%exe_path%\resources\Python\Scripts\pip3.exe"

@%pipExe% uninstall %input%