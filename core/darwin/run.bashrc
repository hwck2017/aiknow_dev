#!/bin/bash
source_file=$1
compiler=$2

# 文件目录
path=${source_file%/*}
# 文件名
file=${source_file##*/}
#echo $path $file
filename=${file%.*}
# 文件扩展名
extension=${file##*.}
# echo filename: ${filename}
# echo extension: ${file##*.}

pwd="/Applications/AiknowEditor.app/Contents/Resources/darwin"
get_timer=$pwd/time_now_ns
# echo $get_timer
start_time=`$get_timer`
if [[ $compiler = "py" ]]; then
    exec_file=$source_file
    python3 $exec_file
elif [[ $compiler = "cpp" ]]; then
    exec_file=$path/$filename
    g++ $source_file -o $exec_file
    $exec_file
elif [[ $compiler = "c" ]]; then
    exec_file=$path/$filename
    gcc $source_file -o $exec_file
    $exec_file
else
    echo "Please enter the correct programming language!"
fi
status=$?
end_time=`$get_timer`

# echo $start_time $end_time

duration=`expr $end_time - $start_time`
duration=`printf "%013d\n" $duration`
s=${duration:0:4}
s=$(expr $s + 0)
ns=${duration:4}
duration_s="$s.$ns"
#echo $duration $s $ns $duration_s

echo "
----------------------------------------"
echo "Process exited after $duration_s seconds with return value ${status}"
# echo "请按任意键继续. . ."

# while true; do
#     read -rsn1 input
#     osascript $pwd/terminal_exit.scpt & exit 0
# done
