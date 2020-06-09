on run args
 set lib to (item 1 of args)
 -- set output to ("args: " & lib)
 -- do shell script "echo " & quoted form of output

 tell application "Terminal"
  set currentTab to do script (("pip3 uninstall " & lib))
 end tell
end