on run args
 set source to (item 1 of args)
 set lang to (item 2 of args)
 -- set output to ("args: " & source & " - " & lang)
 -- do shell script "echo " & quoted form of output

 tell application "Terminal"
  set currentTab to do script (("/Users/chenkai/code/aiknow-dev/run.bashrc " & source & " " & lang))
 end tell
end