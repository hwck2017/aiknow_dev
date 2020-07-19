on run args
 set source to (item 1 of args)
 set lang to (item 2 of args)
 -- set output to ("args: " & source & " - " & lang)

 tell application "Terminal"
  set currentTab to do script (("/Applications/AiknowEditor.app/Contents/Resources/darwin/run.bashrc " & source & " " & lang))
 end tell
end
