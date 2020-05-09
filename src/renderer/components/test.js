/*
 * Copyright (c) 2018, OnlineGDB
 * 
 * Distribution and reproduction of this source code/software without written 
 * permission of OnlineGDB is prohibited.
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

var term, protocol, socketURL, socket;
var terminalContainer = document.getElementById('terminal-container');
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var delete_cookie = function (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

var CLIENT_VERSION = "1.1";

function get_socket() {
    //    console.log("get_socket")
    delete_cookie("SERVERID");
    delete_cookie("SPSERVERID");

    var socket = io.connect('//' + document.location.host, { query: "client_version=" + CLIENT_VERSION + "&uni=" + getParameterByName('uni') });
    socket.io.reconnectionAttempts(10);
    return socket;
}

function disconnect_socket() {
    //    console.log("disconnect_socket");
    if (!socket.disconnected)
        socket.disconnect();
}

var connection_callback_waiting = false;
function try_socket_connection(callback, callback_arg) {
    //    console.log("try_socket_connection")
    if (ide.server_connected) return;
    disable_btn('control-btn-', ['run', 'run_x', 'debug']);
    if (callback) {
        connection_callback_waiting = true;
        socket.once('connect', function () {
            //            console.log("on.connect");
            connection_callback_waiting = false;
            callback(callback_arg);
        })
    }
    if (socket.io.reconnecting) return;
    socket.connect();
}

socket = get_socket();

function socket_on_reconnect_failed() {
    //    console.log("ReConnection failed");
    connect_attempt_count = 0;
    $("#connectingMessage").hide();
    enable_btn('control-btn-', ['run', 'run_x', 'debug']);
    if (connection_callback_waiting) {
        $("#serverDisconnectedModal").modal("show");
    }
}

function socket_on_connect_error() {
    //    console.log("connect error")
    connect_attempt_count++;
    if (connect_attempt_count >= 3 && connection_callback_waiting) {
        $("#connectingMessage").show();
    }
}

var connect_attempt_count = 0;
function bind_socket_handlers() {
    //    console.log("bind_socket_handlers")
    socket.on('connect', socket_on_connect);
    /*TODO:WIP
    socket.on('ack_token', function(ts){
        console.log(ts);
        socket.emit('data_ack',ts);
    });
    */
    socket.on('connect_failed', function () { console.log("Connection failed") });
    socket.on('reconnect', function () { console.log("ReConnectioning") });
    socket.on('connect_error', socket_on_connect_error);
    socket.on('connect_timeout', function () { console.log("Connect timeout") });
    socket.on('reconnect_failed', socket_on_reconnect_failed);
    socket.on('compile_error', socket_on_compile_error);
    socket.on('compile_success', socket_on_compile_success);
    socket.on('display_ready', socket_on_display_ready);
    socket.on('update_version', socket_on_update_version);
    socket.on('console_exit', socket_on_console_exit);
    socket.on('gdbexit', socket_on_gdbexit);
    socket.on('output', socket_on_output);
    socket.on('filewatch', socket_on_filewatch)
    socket.on('runoutput', socket_on_runoutput);
    socket.on('debugoutput', socket_on_debugoutput);
    socket.on('gdb_state', socket_on_gdb_state);
    socket.on('gui_info', socket_on_gui_info);
    socket.on('disconnect', socket_on_disconnect);
    socket.on('gdbsessionlimit', socket_on_gdbsessionlimit);
    socket.on('emptysource', socket_on_emptysource);
    socket.on('filelimitexceed', socket_on_filelimitexceed);
    socket.on('maxdebugsession', socket_on_maxdebugsession);
    socket.on('gui_cmd_reply', socket_on_gui_cmd_reply);
    /* WIP 
    socket.on('debug_msg', function(data){
        console.log("DEBUG_MSG", data);
    })
    */
}

var gccterm;
var ide = new Object;

ide.test = new Object;
ide.test.testing = false; // Status whether ide is currently under Testing mode or not
ide.running; // Running/Debugging
ide.debugging; // Running/Debugging

ide.output = new Object; //$("#stdout-container");
ide.initialize = function () {
    this.btnRunObj = $("#control-btn-run");
    this.btnDebugObj = $("#control-btn-debug");
    this.btnStopObj = $("#control-btn-stop");
    enable_btn('control-btn-', ['run', 'run_x', 'debug']);
};

ide.debug = function (cmd) {
    ide.run_gui_cmd({ cmd: cmd }, true);
}
ide.output.hide = function () {
    $("#stdout-container .msg").html("");
    $("#stderr-container .msg").html("");
}
ide.output.show = function (err, focus) {
    $("#stdout-wrapper").show();
    if (err) {
        $("#stderr-wrapper").show();
    }
    $("#tab-stdin").hide();
    if (focus == 'out') {
        $("#console-title-bar .tab-stdout").show();
        $("#console-title-bar .tab-stderr").show();
        $('.nav-tabs a[href="#tab-stdout"]').tab('show');
    }
    else if (focus == 'err') {
        $("#console-title-bar .tab-stderr").show();
        $('.nav-tabs a[href="#tab-stderr"]').tab('show');
    } else if (focus == 'stdin') {
        $("#tab-stdin").show();
        $("#console-title-bar .tab-stdin").show();
        $('.nav-tabs a[href="#tab-stdin"]').tab('show');
    }
}

var compile_error_tags = [];

var uniq_hint_errors = [];
var hint_errors = [];
hint_errors['conio_h'] = "To resolve this error you should comment out include of 'conio.h' and functions used from it (e.g. getch(), clrscr())<br>\
<br>Because 'conio.h' isn't supported by gcc compiler, which is used by OnlineGDB server.";
hint_errors['iostream_h'] = "To resolve this error you should use <b>#include &lt;&zwj;iostream&gt;&zwj;</b> instead of \
<b>#include &lt;&zwj;iostream.h&gt;&zwj;</b><br>\
<br>Because OnlineGDB uses gcc compiler, which doesn't need '.h' extension for C++ header files.";
hint_errors['iostream_in_c'] = "To resolve this error choose C++ in language settings available on top-right corner.<br>\
<br>The reason you are getting this error is you are trying to run C++ program with C compiler.";
hint_errors['multiple_main'] = "To resolve this error you should write your 'main' function only in main.c or main.cpp file.<br>\
<br>The reason you are getting this error is because you have created multiple files which is having main function. \
You shouldn't write main function in more than 1 files.";
hint_errors['stray_342'] = "The reason of this error is because your source code contains non-ascii characters. Perhaps source code is \
copied from somewhere else, where double quotes are written in unicode character format. <br\>\
For example, instead of <b>&quot;Hello&quot;</b>\
 it has <b>“Hello”</b><br\> Note that second hello is written inside double quotes which is in unicode format, which compiler can't understand.<br\>\
 To resolve error, replace unicode quotes with ascii quotes.";

function display_debug_tip() {
    var lang = $("#lang-select").val();
    var default_filename = get_src_filename(lang);

    for (key in compile_error_tags) {
        switch (key) {
            case "conio_h": display_dialog("Hint to resolve compiler error: \"conio.h: No such file or directory\"",
                "<b>Possible Solution</b>: <br\>Don't include 'conio.h' and comment out functions (e.g. clrscr(), getch()) \
            used from 'conio.h' <br><br>\
            <b> Explaination: </b> <br> Seems like your program is written for Turbo C or Borland C compiler \
            which support non-standard header file 'conio.h'<br>\
            OnlineGDB runs C/C++ programs with gcc/g++, which doesn't support conio.h<br>\
            So to resovle error don't use conio.h and functions from 'conio.h' (e.g. clrscr(), getch())");
                break;

            case "iostream_h": display_dialog("Hint to resolve compiler error: \"iostream.h: No such file or directory\"",
                "<b>Possible Solution</b>: <br\>Use <b>#include &#x3C;iostream&#x3E;</b> instead of \
            <b>#include &#x3C;iostream.h&#x3E; </b><br><br>\
            <b> Explaination: </b> <br> Seems like your program is written for Turbo C or Borland C compiler \
            which has '.h' extension for C++ header files. <br>\
            OnlineGDB runs C++ programs with g++, which doesn't need '.h' extension.<br>\
            So instead of &#x3C;iostream&#x3E; , &#x3C;iostream.h&#x3E; should be used to resolve this error. ");
                break;

            case "iostream_in_c": display_dialog("Hint to resolve compiler error: \"iostream: No such file or directory\"",
                "<b>Possible Solution</b>: <br\> Choose 'C++' in Language settings available in top-right corner.<br><br>\
            <b> Explaination: </b> <br> Seems like you are trying to run C++ program, but in Language settings  \
            you have selected 'C'. Since 'C' doesn't have any such header file named 'iostream', \
            compiler throws this error.  <br>\
            So choosing 'C++' in language setting should resolve this error.");
                break;

            case "multiple_main": display_dialog("Hint to resolve error: \"multiple definition of `main' \"",
                "<b>Possible Solution</b>: <br\> Write your 'main' function in " + default_filename + " file.<br><br>\
            <b> Explaination: </b> <br> Seems like you have created multiple files and have written 'main' function \
            in more than 1 files. Compiler would give error if it finds 'main' function in multiple files.<br>\
            To resolve error, write your 'main' function only in "+ default_filename + " file.");
        }
    }
}
var $popover_hint = null;
function close_popover() {
    //close only if its shown, which we verify by aria-describedby attribute
    if ($popover_hint && $popover_hint.attr('aria-describedby'))
        $popover_hint.trigger('click');
}

ide.output.display = function (msg) {
    var err = false;
    this.hide();
    this.setCompile(msg.compile);
    var result = "";
    var result_status = null;
    var run_result = {};
    var focus;
    focus = 'out';
    if (msg.test_result) {
        var content = msg.test_result.status + "<br>";
        content += "" + msg.test_result.test_passed + " test(s) passed out of " + msg.test_result.results.length + " test(s)";
        display_dialog("Test Result", content);
        focus = 'stdin';
    } else if (msg.compile) {
        result += "Compiled Successfully. ";

        if (ide.compile_stderr) {
            msg.stderr = msg.stderr ? msg.stderr : "";
            msg.stderr = ide.compile_stderr + "\n" + msg.stderr;
        }

        if (msg.run_error) {
            result += msg.run_error;
            run_result.status = "RUNTIME ERROR";
            run_result.memory = msg.memory;
            run_result.time = msg.time;
        } else if (msg.runtime_exceed) {
            run_result.status = "RUNTIME EXCEED";
            result += "<b style='color:red'> Runtime Exceed. </b> <a onclick=\"$('#runtimeModal').modal(\'show\');\"  style='color:#1d238a;cursor:pointer'>Click here to know possible reasons for runtime exceed.</a>";
            if (msg.stderr) {
                err = true;
                focus = 'err';
                $("#stderr-container .msg").text($('<div/>').text(msg.stderr).text());
            }
            if (msg.stdout) {
                focus = 'out';
                $("#stdout-container .msg").text($('<div/>').text(msg.stdout).text());
            }
            focus = 'out';
        } else {
            run_result.status = "RAN SUCCESSFULLY";
            run_result.memory = msg.memory;
            run_result.time = msg.time;
            run_result.stderr = msg.stderr;
            run_result.stdout = msg.stdout;
            run_result.exit_status = msg.exit_status.trim();

            result += " memory: " + msg.memory;
            result += " time: " + msg.time;

            if (msg.exit_status.trim() != "0") {
                result += " exit code: " + msg.exit_status.trim();
            } else {
                result += " exit code: " + msg.exit_status.trim();
                $("#ide-output-exit-code-wrapper").addClass('text-success');
                $("#ide-output-exit-code-wrapper").removeClass('text-danger');
            }
            if (msg.stderr) {
                err = true;
                focus = 'err';
                $("#stderr-container .msg").text($('<div/>').text(msg.stderr).text());
            }
            if (msg.stdout) {
                focus = 'out';
                $("#stdout-container .msg").text($('<div/>').text(msg.stdout).text());
            }
            focus = 'out';

        }
    } else {
        compile_error_tags = [];
        uniq_hint_errors = [];

        if (msg.compiletime_exceed) {
            result += "Compile Time Exceed";
            focus = 'out';
            run_result.status = "COMPILE TIME EXCEED";
        } else if (msg.writefile_error) {
            result += "<b style='color:red'>Compilation failed due to internal server error.</b> Please try again or contact us if problem persists.";
            focus = 'out';
            run_result.status = "COMPILE TIME SERVER ERROR";
        } else {
            run_result.status = "COMPILE ERROR";
            run_result.stderr = msg.stderr;
            run_result.stdout = msg.stdout;
            result = "<span style='color:red'>Compilation failed due to following error(s).</span> ";
            $("#ide-compile-result").html(result);
            focus = 'err';
            err = true;
            var text_output = $('<div/>').text(msg.stderr).text();
            var lines = text_output.match(/[^\r\n]+/g);
            var html_output = "";
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var fileline = line.match(/^.*\:[0-9]+/) || null;

                if (line && (line.indexOf(": error:") > - 1 || line.indexOf(": fatal error:") > -1
                    || line.indexOf(": undefined reference to") > -1 || line.indexOf(": multiple definition of") > -1
                    || line.indexOf(": first defined here") > -1)) {
                    socket.emit("compiler_error", line);
                }
                if (fileline) {
                    var lineno = fileline[0].split(":")[1];
                    var filename = fileline[0].split(":")[0];
                    if (ide.editor.if_file_exists(filename)) {
                        line = line.replace(/^.*\:[0-9]+/,
                            "<span class=\"error_line\" onclick=\"ide.gotoLine('" + filename + "'," + lineno + ")\">" + fileline + "</span>");
                    }
                }
                if (line && (line.indexOf(": error:") > - 1 || line.indexOf(": fatal error:") > -1
                    || line.indexOf(": undefined reference to") > -1 || line.indexOf(": multiple definition of") > -1
                    || line.indexOf(": first defined here") > -1)) {
                    var error_tag = null;
                    if (line.indexOf("conio.h: No such") > -1) {
                        error_tag = "conio_h";
                    } else if (line.indexOf("iostream.h: No such") > -1) {
                        error_tag = "iostream_h";
                    } else if (line.indexOf(": iostream: No such") > -1) {
                        error_tag = "iostream_in_c";
                    } else if (line.indexOf("multiple definition of `main'") > -1) {
                        error_tag = "multiple_main";
                    } else if (line.indexOf("stray ‘\\342’") > -1 || line.indexOf("stray '\\342'") > -1) {
                        if (!uniq_hint_errors["stray_342"]) {
                            error_tag = "stray_342";
                            uniq_hint_errors["stray_342"] = true;
                        }
                    }

                    //compiler_error_tags[error_tag] = true;
                    var hint_btn_html = "<a href=\"#\" class=\"hint_btn\"><span class=\"glyphicon glyphicon-question-sign\" aria-hidden=\"true\" title=\"Hint to resolve error\" \
                    data-toggle=\"popover\" data-content=\""+ hint_errors[error_tag] + "\"></span></a>";
                    if (error_tag) {
                        line = line.replace(": fatal error:", ": fatal error: " + hint_btn_html);
                        line = line.replace(": error:", ": fatal error: " + hint_btn_html);
                        line = line.replace(": multiple definition of", " " + hint_btn_html + " : multiple definition of");
                    }
                    html_output += "<span style=\"color:#ff5b4a\">" + line + "</span>\r\n";

                } else if (line.indexOf(": warning:") > -1) {
                    html_output += "<span style=\"color:orange\">" + line + "</span>\r\n";
                } else if (line.indexOf(": note:") > -1) {
                    html_output += "<span style=\"color:#42abff\">" + line + "</span>\r\n";
                } else {
                    html_output += encodeHtmlEntity(line) + "\r\n";
                }
            }
            $("#stderr-container .msg").html(html_output);
            $popover_hint = $('#stderr-container .msg [data-toggle="popover"]');

            //$btn2.webuiPopover({container:'#console-wrapper',type:'html', trigger:'click', placement1:'right', closeable:true});
            $popover_hint.popover({
                placement: "auto",
                trigger: "click",
                container: 'body',
                html: true,
                placement: 'top',
                template: '<div class="popover popover-hint" role="tooltip">\
                <div class="arrow"></div>\
                <button type="button" class="close" style="margin: 1px 4px;" onclick="close_popover();">&times;</button>\
                <h3 class="popover-title" style="text-align:center">\
                </h3>\
                <div class="popover-content"></div>\
                </div>'
            })
            setTimeout(function () {
                $popover_hint.trigger('click');
            }, 500);

            if (ide.on_compiler_error) {
                ide.on_compiler_error();
            }
            //$("#stderr-container .msg").text($('<div/>').text(msg.stderr).text());

            display_debug_tip();
        }
    }
    $("#ide-run-result").html(result);
    this.show(err, focus);
    run_result.files = ide.editor.get_files();
    if (ide.result_callback) {
        //var run_result =  {status: result_status, stdout: msg.stdout, stderr: msg.stderr};
        ide.result_callback(run_result);
    }
};
var editor = null;
ide.gotoLine = function (filename, lineno) {
    //    socket.emit("gui_event", "gotoLine");
    ide.editor.gotoFileLine(new FileLine(filename, lineno));
}

ide.output.setCompile = function (status) {
    if (status) {
        $("#ide-compile-status").html('<span class="text-success">Successfully Compiled.</span>');
    } else {
        $("#ide-compile-status").html('<span class="text-danger">Compilation Error(s).</span>');
    }
};

ide.set_gui_state = function (state) {
    if (state == "PROGRAM_PAUSED") {
        ide.set_active_line();
        term.focus();
    }

    //console.log("set_gui_state:"+state);
    ide.last_gui_state = state;
    //console.log(state);
    if (state == "DEBUG_INIT") {
        //Clear All window
        $("#debug_window_call_stack table tbody").html("");
        $("#debug_window_local_variables table tbody").html("");
        $("#debug_window_breakpoints table tbody").html("");
        delete ide.active_frame;
    } else if (state == "PROGRAM_NOT_EXIST") {
        //set debug control bar
        enable_btn("debug_btn_", ["run"]);
        disable_btn("debug_btn_", ["pause", "cont", "step", "next", "finish"]);
        ide.remove_active_line();
        delete ide.active_frame;
    } else if (state == "PROGRAM_RUNNING") {
        disable_btn("debug_btn_", ["run", "cont", "step", "next", "finish"]);
        enable_btn("debug_btn_", ["pause"]);
        ide.remove_active_frame();
        ide.remove_active_line();
        term.focus();
    } else if (state = "PROGRAM_PAUSED") {
        disable_btn("debug_btn_", ["pause"]);
        enable_btn("debug_btn_", ["cont", "step", "next", "finish"]);
        term.focus();
    }
}

ide.set_active_line = function () {
    var active_line = null;
    //When active line can't override active frame
    if (typeof ide.active_frame !== 'undefined') return;
    $("#debug_window_call_stack tbody tr").each(function () {
        var file = $(this).attr('data-file');
        var line = $(this).attr('data-line');
        if (is_user_src_file(file)) {
            if ((ide.debugger == DEBUGGER_CC || ide.debugger == DEBUGGER_JAVA) && active_line) {
                return;
            }
            active_line = line = new FileLine(file, line);
        }/*else{
            ide.debug('finish');
        }*/
    });
    if (active_line) {
        ide.editor.gotoFileLine(active_line);
        ide.editor.removeMarkerById(ide.editor.last_marker_id);
        ide.editor.last_marker_id = ide.editor.addMarker(active_line, "myMarker", "fullLine");
    }
}

ide.remove_active_frame = function () {
    if (ide.active_frame != undefined) {
        var jquery_selector = "#debug_window_call_stack tbody tr[data-frame-num='" + ide.active_frame + "']";
        $(jquery_selector).removeClass('active');
        ide.active_frame = undefined;
        ide.hightlight_active_frame_line(new FileLine("", -1));
    }
}

ide.remove_active_line = function () {
    ide.editor.removeMarkerById(ide.editor.last_marker_id);
    delete ide.editor.last_marker_id;
}

ide.fadeConsole = function (msg) {
    if (msg) {
        ide.fadeMessage(msg);
    }
    $("#console-fadder").show();
}

ide.unfadeConsole = function () {
    $("#console-fadder").hide();
}

ide.fadeMessage = function (msg) {
    $("#console-fadder .msg").text(msg);
}

ide.showinfo = function () {
    $('#infoModal').modal('show');
}

ide.showsettings = function () {
    $('#popup-settings').show();
}
ide.test.verify = function (data) {
    //console.log("verify()");
    if (this.testing) {
        this.verify_output(data);
    }
}


ide.closegdb = function () {
    if (term) term.detach(socket);
    msg = "\n\033[1;32m...Disconnected from gdb...\033[0m";
    if (term) term.write(msg);
    ide.remove_active_frame();
    ide.remove_active_line();
    if (live_ide) {
        ide.editor.setReadOnly(false);
    }
    //ide.editor.focus();
}

var socket_on_connect = function (data) {
    //    console.log("Socket Connected: "+ socket.io.engine.id);
    ide.server_connected = true;
    ide.initialize();
    connect_attempt_count = 0;
    $("#connectingMessage").hide();
    //ide.dotest();
};

var socket_on_compile_error = function () {
    if (ide.running) {
        if (was_interactive_run) {
            ide.unfadeConsole();
        }
    } else {
        ide.unfadeConsole();
    }
};


var socket_on_compile_success = function (data) {

    if (data) {
        ide.compile_stdout = data.stdout;
        ide.compile_stderr = data.stderr;

        var compile_msg = "";
        if (data.stdout) compile_msg += data.stdout;
        if (data.stderr) {
            var err_msg = "";
            var lines = data.stderr.match(/[^\r\n]+/g);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.indexOf(": warning: ") > -1) {
                    err_msg += "\033[1;33m" + line + "\033[0m\r\n";
                } else if (line.indexOf(": note: ") > -1) {
                    err_msg += "\033[1;34m" + line + "\033[0m\r\n";
                }
            }
            compile_msg += err_msg;
        }

        compile_msg = compile_msg.replace(/\r?\n/g, "\r\n");

        if (term) term.write(compile_msg);
    }

    if (ide.running) {
        if (was_interactive_run) {
            ide.unfadeConsole();
        } else {
            ide.fadeMessage('Compiled sucessfully. Now running Program...');
        }
    } else {
        ide.unfadeConsole();
    }
};


function handle_vnc_window_connect() {
    if (handle_vnc_window_connect._initialized) return;

    handle_vnc_window_connect._initialized = true;

    var eventMethod = window.addEventListener ?
        "addEventListener" :
        "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ?
        "onmessage" :
        "message";
    eventer(messageEvent, function (e) {

        // if (e.origin !== 'http://the-trusted-iframe-origin.com') return;

        if (e.data === "display_connected" || e.message === "display_connected") {
            socket.emit('display_connected');
        }
    });
}

var socket_on_display_ready = function () {
    console.log('display_ready');
    var graphics_window = ide.graphics_window;
    if (!graphics_window) return;

    graphics_window.location.href = '/vnc/vnc_lite.html?scale=true&token=' + get_socket_id();

    handle_vnc_window_connect();
};



function display_compiler_flags_box() {
    $("#compilerFlagsModal").modal('show');
}

function display_update_version_popup() {
    $("#newVersionModal").modal('show');
}

var socket_on_update_version = function () {
    display_update_version_popup();
};



var socket_on_console_exit = function () {
    if (term) {
        ide.running_state = "FINISHED";
        term.detach(socket);
        term.write("\r\n\033[1;32mPress ENTER to exit console.\033[0m");
        if (live_ide) {
            ide.editor.setReadOnly(false);
        }
        disable_btn('control-btn-', ['stop']);
        enable_btn('control-btn-', ['run', 'run_x', 'debug', 'beautify', 'newfile']);
        term.on('data', function (data) {
            if (data.indexOf('\r') > -1 || data.indexOf('\n') > -1) {
                close_run_console();
            }
        });
    }
};



var socket_on_gdbexit = function () {
    //console.log("GDB Exit.");
    ide.closegdb();
    close_debug_console();
};



var socket_on_output = function (data) {
    //console.log("Data receieved: "+ data);
    if (gccterm == undefined) {
        gccterm = new Terminal();
        gccterm.open(terminalContainer);
        gccterm.fit();
    }
    gccterm.write(data);
};



var socket_on_filewatch = function (data) {
    switch (data.event) {
        case 'add':
        case 'change':
            var file = {};
            file.name = data.path;
            file.content = data.content;
            if (!ide.editor.compare_file(file))
                ide.editor.set_files([file]);
            break;
        case 'unlink':
            ide.editor.delete_file(data.path);
    }
};



var socket_on_runoutput = function (data) {
    //console.log("runoutput Data receieved: ");
    //console.log(data);
    if (data.lang && data.lang == 'html') {
        //console.log("html output",data.url);
        ide.unfadeConsole();
        var html = "<iframe src=\"" + data.url + "\" sandbox=\"allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals\" \
        frameborder=\"0\" style=\"height: 100%; width: 100%;\"></iframe>";
        $("#interactive-terminal-container").html(html);
        enable_btn('control-btn-', ['run', 'run_x', 'debug', 'beautify', 'newfile']);
        return;
    }
    ide.running_state = "FINISHED";
    ide.test.verify(data);
    ide.output.display(data);
    ide.unfadeConsole();
    close_run_console();
    enable_btn('control-btn-', ['run', 'run_x', 'debug', 'beautify', 'newfile']);
    /*if (gccterm == undefined) {
        gccterm = new Terminal();
        gccterm.open(terminalContainer);
        gccterm.fit();
    }
gccterm.write(data);*/
};



var socket_on_debugoutput = function (data) {
    //console.log('got debugoutput');

    ide.output.display(data);
    close_debug_console();
};



var socket_on_gdb_state = function (data) {
    $("#ogdb_status").text(data);
};



const DEBUGGER_PYTHON = 'debugger_python';
const DEBUGGER_CC = 'debugger_cc';
const DEBUGGER_JAVA = 'debugger_java';
const DEBUGGER_RUBY = 'debugger_ruby';

function check_server_connection(callback, callback_args) {
    close_popover();
    if (ide.server_connected) return true;
    try_socket_connection(callback, callback_args);
    //$("#serverDisconnectedModal").modal("show")
    return false;
}

ide.hightlight_active_frame_line = function (fileline) {

    if (fileline.line == -1) {
        ide.editor.removeMarkerById(ide.editor.last_frame_marker_id);
        return;
    }

    ide.editor.gotoFileLine(fileline);
    ide.editor.removeMarkerById(ide.editor.last_frame_marker_id);
    ide.editor.last_frame_marker_id = ide.editor.addMarker(fileline, "active_frame_line_marker", "fullLine");
}

function is_user_src_file(file) {
    return ide.editor.if_file_exists(file);
}

function quoteattr(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only 
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
    ;
}

function escape(s) {
    return ('' + s) /* Forces the conversion to string. */
        //        .replace(/\\/g, '\\\\') /* This MUST be the 1st replacement. */
        //       .replace(/\t/g, '\\t') /* These 2 replacements protect whitespaces. */
        //       .replace(/\n/g, '\\n')
        //       .replace(/\u00A0/g, '\\u00A0') /* Useful but not absolutely necessary. */
        //        .replace(/&/g, '\\x26') /* These 5 replacements protect from HTML/XML. */
        //        .replace(/'/g, "\\\"")
        //       .replace(/"/g, "\\\"")
        //       .replace(/</g, '\\x3C')
        //       .replace(/>/g, '\\x3E')
        ;
}

var encodeHtmlEntity = function (str) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
};

function fold_left_bar() {
    $("#btn_close_header").hide();
    $("#left-component").width('50px');
    $("#right-component").css({ left: '50px' });
    if (!ide.debugging) {
        $("#right-left-component").css({ width: '100%' });
        $("#my-divider2").css({ left: '100%' });
        $("#right-right-component").css({ left: '100%' });
    }
    $("#left-component .to_be_hidden").hide();

    $("#header_logo a").attr("href", "javaScript:void(0);");
    $("#header_logo a").click(function (event) {
        $("#btn_close_header").show();
        $("#left-component").width('20%');
        $("#right-component").css({ left: '20%' });
        $("#left-component .to_be_hidden").show();
    });
}

function gui_call_stack_clear() {
    $("#debug_window_call_stack tbody").html("");
}
function gui_call_stack_add_frame(frame) {
    if (!frame) return;

    $("#debug_window_call_stack tbody")
        .append('<tr data-file="' + encodeHtmlEntity(frame.file_name) + '" data-line="' + frame.line +
            '" data-frame-num="' + frame.frame_no + '" onclick="ide.set_frame(' + frame.frame_no + ')"><td>'
            + frame.frame_no + '</td><td>' + encodeHtmlEntity(frame.fun_name) + '</td><td>' + encodeHtmlEntity(frame.file_name) + ':'
            + frame.line + '</td></tr>');
}
function gui_call_stack_post_processing(no_of_frames) {
    if (typeof ide.active_frame != 'undefined') {
        var jquery_selector = "#debug_window_call_stack tbody tr[data-frame-num='" + ide.active_frame + "']";
        $(jquery_selector).addClass('active'); ""
        var file = $(jquery_selector).attr('data-file');
        var line = $(jquery_selector).attr('data-line');
        if (is_user_src_file(file)) {
            var fileline = new FileLine(file, line);
            ide.hightlight_active_frame_line(fileline);
        }
    }
}

function gui_breakpoints_clear() {
    var html = "<div id=\"debug_window_breakpoints\" class=\"collapse in\">\
        <div class=\"table-responsive\"><table class=\"table table-bordered\">\
       <thead>";
    if (ide.debugger != DEBUGGER_JAVA) {
        html += "<tr><th></th><th>#</th><th>Description</th><th></th></tr>";
    } else {
        html += "<tr><th>Description</th><th></th></tr>";
    }
    html += "</thead>\
       <tbody></tbody>\
       </table></div>\
</div>";
    $("#debug_window_breakpoints").html(html);
    $("#debug_window_breakpoints table").colResizable({ liveDrag: true });
    //$("#debug_window_breakpoints tbody").html("");
}

function gui_local_variables_reset() {
    if (ide.debugger != DEBUGGER_PYTHON) {
        $("#debug_window_local_variables").html("\
       <div class=\"table-responsive\"><table class=\"table table-bordered\">\
       <thead> <tr><th>Variable</th><th>Value</th></tr></thead>\
       <tbody></tbody>\
       </table></div>");
        $("#debug_window_local_variables table").colResizable({ liveDrag: true });
    } else {
        $("#debug_window_local_variables").html("")
    }
}

function gui_display_expr_window_reset() {
    if (ide.debugger == DEBUGGER_CC) {
        $("#debug-pan .panel-display-expression").show();
        $("#debug_window_display_expression").show();
    } else {
        $("#debug-pan .panel-display-expression").hide();
        $("#debug_window_display_expression").hide();
    }
}
function gui_registers_window_reset() {
    var lang = $('#lang-select').find(':selected').val();
    if (ide.debugger == DEBUGGER_CC && lang == 'asm_gcc') {
        $("#debug-pan .panel-registers").show();
        $("#debug_window_registers").show();
    } else {
        $("#debug-pan .panel-registers").hide();
        $("#debug_window_registers").hide();
    }
}
var gui_breakpoints_list = [];
function gui_breakpoints_list_clear() {
    gui_breakpoints_list = [];
}
function gui_breakpoints_add(bp) {
    var bp_checked = (bp.enabled == "y") ? 'checked="checked"' : "";
    var bp_desc = "";

    if (bp.bp_desc) {
        bp_desc = bp.bp_desc;
    } else if (bp.type == "breakpoint") {
        if (bp.address == "<PENDING>") {
            bp_desc = "Pending in " + bp.what;
        } else if (bp.file) {
            if (bp.what)
                bp_desc += "in " + bp.what
            bp_desc += " at " + bp.file + ":" + bp.line;
        }
        else if (bp.what)
            bp_desc = bp.what;
        else
            bp_desc = "at " + bp.address;
    } else if (bp.type = "hw watchpoint") {
        bp_desc = "watchpoint on " + bp.what;
    } else {
        throw "unexpected breakpoint type";
    }

    if (ide.editor.if_file_exists(bp.file)) {
        var ebp = new Breakpoint(bp.file, bp.line);
        if (!(ebp.filename in gui_breakpoints_list)) {
            gui_breakpoints_list[ebp.filename] = [];
        }
        ide.editor.setBreakpoint(ebp);
        gui_breakpoints_list[ebp.filename].push(parseInt(ebp.line));
    }

    var html = '<tr data-file="' + bp.file + '" data-line="' + bp.line + '" data-bp-num="' + bp.num + '" class="bp_' + bp.enabled + '">';
    if (ide.debugger != DEBUGGER_JAVA) {
        html += '<td><input onchange="bp_change($(this).is(\':checked\'),' + bp.num + ')" type="checkbox" ' + bp_checked + '/></td>'
            + '<td>' + bp.num + '</td>';
    }

    html += '<td>' + bp_desc + '</td>'
        + '<td><span style="cursor:pointer" onclick="remove_breakpoint(' + bp.num + ')" class=\'glyphicon glyphicon-remove\'></span></td></tr>';


    $("#debug_window_breakpoints tbody").append(html);
}

function gui_breakpoints_post_processing() {
    var editor_bp_list = ide.editor.getBreakpoints();
    for (filename_key in editor_bp_list) {
        for (i in editor_bp_list[filename_key].breakpoints) {
            if (!(filename_key in gui_breakpoints_list) || gui_breakpoints_list[filename_key].indexOf(parseInt(i) + 1) == -1) {
                ide.editor.clearBreakpoint(new Breakpoint(filename_key, parseInt(i) + 1));
            }
        }
    }
}

function handle_gui_frames(frames) {
    gui_call_stack_clear();
    for (var i = 0; i < frames.length; i++) {
        gui_call_stack_add_frame(frames[i]);
    }
    gui_call_stack_post_processing(frames.length);
}
function handle_gui_variables(variables) {
    if (variables.json) {
        $("#debug_window_local_variables").html("<div id='local_info'></div>");
        $("#local_info").jsonView(variables.variables);
    } else {
        $("#debug_window_local_variables tbody").html("");
        for (var i = 0; i < variables.length; i++) {
            var var_info = variables[i];
            $("#debug_window_local_variables tbody").append('<tr><td>' + var_info.name + '</td><td>' + encodeHtmlEntity(var_info.val) + '</td></tr>');
        }
    }
}
function handle_gui_registers(registers) {
    $("#debug_window_registers tbody").html("");
    for (var i = 0; i < registers.length; i++) {
        var reg_info = registers[i];
        $("#debug_window_registers tbody").append('<tr><td>' + reg_info.name + '</td><td>' + encodeHtmlEntity(reg_info.val) + '</td></tr>');
    }
}
function handle_gui_breakpoints(breakpoints) {
    gui_breakpoints_clear();
    gui_breakpoints_list_clear();
    for (var i = 0; i < breakpoints.length; i++) {
        gui_breakpoints_add(breakpoints[i]);
    }
    gui_breakpoints_post_processing();
}
function handle_gui_watch_expr(watch_expr) {
    ide.set_watch_expr(watch_expr.expr, watch_expr.value);
}

function handle_gui_info(data) {
    if (data.frames) {
        handle_gui_frames(data.frames);
    }
    if (data.variables) {
        handle_gui_variables(data.variables);
    }
    if (data.breakpoints) {
        handle_gui_breakpoints(data.breakpoints);
    }
    if (data.watch_expr) {
        handle_gui_watch_expr(data.watch_expr);
    }
    if (data.program_state) {
        ide.set_gui_state(data.program_state);
    }
    if (data.registers) {
        handle_gui_registers(data.registers);
    }
}
var socket_on_gui_info = function (data) {
    handle_gui_info(data);

    $(window).trigger('resize'); // This need to trigger at least once to make colResizable work. dont why actual cause. so added this hack.
    if (term) term.focus();
};



function remove_breakpoint(bp_num) {
    var cmd_args = bp_num;

    if (ide.debugger == DEBUGGER_JAVA) {
        cmd_args = get_java_bp_desc(bp_num);
    }

    if (ide.remove_breakpoint(bp_num)) {
        ide.run_gui_cmd({ cmd: 'remove_bp', args: cmd_args });
    }
}

function get_java_bp_desc(bp_num) {
    var selector_js = bp_num;
    var jquery_selector = "#debug_window_breakpoints tbody tr[data-bp-num='" + selector_js + "']";
    if ($(jquery_selector).length) {
        var bp_desc = $(jquery_selector + " td ").text();
        return bp_desc;
    }
    return null;
}

ide.remove_breakpoint = function (bp_num) {
    var selector_js = bp_num;
    var jquery_selector = "#debug_window_breakpoints tbody tr[data-bp-num='" + selector_js + "']";
    if ($(jquery_selector).length) {
        $(jquery_selector).remove();
        return true;
    }
    return false;
}

ide.set_frame = function (frame_num) {
    ide.run_gui_cmd({ cmd: 'frame ', args: frame_num });
    var jquery_selector = "#debug_window_call_stack tbody tr[data-frame-num='" + frame_num + "']";
    $(jquery_selector).addClass('active');
    ide.active_frame = frame_num;
}

ide.set_watch_expr = function (expr, value) {
    expr = expr.trim();
    if (expr == "") return false;
    //console.log(expr+" "+value);
    var selector_html = quoteattr(expr);
    var selector_js = escape(expr);
    var jquery_selector = "#debug_window_display_expression tr[data-expr='" + selector_js + "']";
    if ($(jquery_selector).length) {
        $(jquery_selector).html("<td>" + selector_html + "</td><td>" + quoteattr(value) +
            "</td><td><span style=\"cursor:pointer\" onclick=\"remove_watch('" + selector_js + "')\" class='glyphicon glyphicon-remove'></span></td>");
        return false;
    } else {
        $("#debug_window_display_expression tbody")
            .append(
                "<tr data-expr=\"" + selector_html + "\"><td>" + expr + "</td><td>" + quoteattr(value) +
                "</td><td><span style=\"cursor:pointer\" onclick=\"remove_watch('" + selector_js + "')\" class='glyphicon glyphicon-remove'></span></td></tr>");
        return true;
    }
}

ide.remove_watch_expr = function (expr) {
    var selector_js = expr;
    var jquery_selector = "#debug_window_display_expression tr[data-expr='" + selector_js + "']";
    if ($(jquery_selector).length) {
        $(jquery_selector).remove();
        return true;
    }
    return false;
}

function bp_change(ed, bp_no) {
    //console.log("bp_change:"+ed+" "+bp_no);
    if (ed) {
        ide.run_gui_cmd({ cmd: 'enable ', args: bp_no });
    } else
        ide.run_gui_cmd({ cmd: 'disable ', args: bp_no });
}

var socket_on_disconnect = function () {
    //console.log("Disconnected server");
    ide.server_connected = false;

    if ((ide.running && ide.running_state != "FINISHED") || ide.debugging) {
        $("#serverDisconnectedModal").modal("show");
    }

    if (ide.running) {
        close_run_console();
    }

    if (ide.debugging) {
        ide.closegdb();
        close_debug_console();
    }
};



var socket_on_gdbsessionlimit = function () {
    //console.log("gdb session limit reached");
    ide.unfadeConsole();
    alert("Maximum session limit reached. Please try after a while.");
};



var socket_on_emptysource = function () {
    ide.unfadeConsole();
    alert("Source code is empty");
};



var socket_on_filelimitexceed = function (data) {
    //console.log(data);
    ide.unfadeConsole();
    if (data.file == 'src') {
        alert("Source file can't be larger than " + data.limit);
    }
    if (data.file == 'stdin') {
        alert("Stdin file can't be larger than " + data.limit);
    }
};



var socket_on_maxdebugsession = function (data) {
    ide.closegdb();
    close_debug_console();
    alert(data);
};



var gui_cmd_id = 0;
ide.run_gui_cmd = function (cmd, echo_on_console, callback) {
    var console_cmd = false;
    if (echo_on_console) console_cmd = true;
    socket.emit("run_gui_cmd", {
        cmd: cmd.cmd,
        args: cmd.args,
        console_cmd: console_cmd,
        id: gui_cmd_id++
    });
    if (term) term.focus();
}

var socket_on_gui_cmd_reply = function (data) {
    //console.log(data);
};



/* Set breakpoint in gdb based on file:line */
ide.setBreakpoint = function (bp, ingdb) {
    if (term) {
        var cmd_args;
        if (ide.debugger == DEBUGGER_JAVA) {
            var classid = bp.filename.substring(0, bp.filename.lastIndexOf('.'));
            cmd_args = classid + ":" + bp.line;
        } else {
            cmd_args = bp.filename + ":" + bp.line;
        }
        ide.run_gui_cmd({ cmd: "set_bp", args: cmd_args });
    }
}

/* Delete breakpoint from gdb based on file:line */
ide.clearBreakpoint = function (bp, ingdb) {
    if (!term) return;
    //map breakpoint number from line number 
    var bp_num_list = [];

    /* Find gdb breakpoint number mapped to given file:line */
    $("#debug_window_breakpoints tbody tr").each(function () {
        var file = $(this).attr('data-file');
        var file_line = $(this).attr('data-line');
        var bp_num = $(this).attr('data-bp-num');

        if (is_user_src_file(file) && "" + file_line == "" + bp.line) {
            bp_num_list.push(bp_num);
        }
    });

    /* Delete breakpoint from gdb */
    if (bp_num_list.length) {
        if (ide.debugger == DEBUGGER_JAVA) {
            for (i in bp_num_list) {
                var bp_num = bp_num_list[i];
                var cmd_args = get_java_bp_desc(bp_num);
                ide.run_gui_cmd({ cmd: 'remove_bp', args: cmd_args });
            }
        }
        else {
            var cmd_args = bp_num_list.join(" ");
            ide.run_gui_cmd({ cmd: 'remove_bp', args: cmd_args });
        }
    }
}

function add_watch_expr(ele) {
    if (event.keyCode == 13) {
        var expr = ele.value.trim();
        //console.log(expr);
        if (ide.set_watch_expr(expr, "")) {
            socket.emit('add_watch_expr', expr);
        }
        $(ele).val("");
    }
}

function remove_watch(expr) {
    //console.log(expr);
    if (ide.remove_watch_expr(expr)) {
        socket.emit('remove_watch_expr', expr);
    }
}

function term_is_enabled(ev) {
    return $("#ogdb_status").text() != "RUNNING_GUI_CMD";
}

function createTerminal(terminalContainer) {
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    term = new Terminal({
        cursorBlink: true //optionElements.cursorBlink.checked
    });

    term.editor = editor;

    // Connect to the socket.io server
    term.attachCustomKeydownHandler(term_is_enabled);
    term.open(terminalContainer);
    term.fit();
    runRealTerminal();
}

function runRealTerminal() {
    //console.log("started real terminal");
    term.attach(socket);
    term._initialized = true;
}

function runFakeTerminal() {
    if (term._initialized) {
        return;
    }
    term._initialized = true;
    var shellprompt = '$ ';
    term.prompt = function () {
        term.write('\r\n' + shellprompt);
    };
    term.writeln('Welcome to xterm.js');
    term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
    term.writeln('Type some keys and commands to play around.');
    term.writeln('');
    term.prompt();
    term.on('key', function (key, ev) {
        var printable = (!ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey);
        if (ev.keyCode == 13) {
            term.prompt();
        }
        else if (ev.keyCode == 8) {
            /*
             * Do not delete the prompt
             */
            if (term.x > 2) {
                term.write('\b \b');
            }
        }
        else if (printable) {
            term.write(key);
        }
    });
    term.on('paste', function (data, ev) {
        term.write(data);
    });
}
//Added for IDE

function savefile(srcdata, stdinput) {
    if (srcdata instanceof Array) {
        for (var i = 0; i < srcdata.length; i++) {
            if (srcdata[i].content.length > 100 * 1024) {
                alert("'" + srcdata[i].name + "' file can't be larger than 100 KB");
                return false;
            }
        }
    } else {
        if (srcdata.trim() == "") {
            //alert("Source code is empty");
            //return false;
        }
        if (srcdata.length > 100 * 1024) {
            alert("Source file can't be larger than 100 KB");
            return false;
        }
    }
    if (stdinput && stdinput.length > 100 * 1024) {
        alert("stdin file can't be larger than 100 KB");
        return false;
    }
    return true;
};

jQuery.download = function (url, params) {
    var form = $('<form></form>').attr('action', url).attr('method', 'post');

    for (var i = 0; i < params.length; i++) {
        var input = $("<input></input>").attr('type', 'hidden').attr('name', params[i].key).attr('value', params[i].data);
        form.append(input);
    }
    form.appendTo('body').submit().remove();
};

function downloadCode() {
    var file = ide.editor.getFile();
    var lang = $('#lang-select').find(':selected').val();
    $.download('/download', [{ key: 'file', data: JSON.stringify(file) }]);
}

function beautifyCode() {
    var src = ide.editor.getValue();
    var params = { src: src };
    var curPos = ide.editor.getCursorPosition();
    disable_btn('control-btn-', ['beautify']);
    ide.editor.setReadOnly(true);
    $.ajax({
        type: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json',
        url: '/beautify',
        success: function (data) {
            //                console.log(data);
            if (data.result == "OK") {
                ide.editor.setValue(data.src);
            } else {
                alert("Opps! Couldn't beautify code. Please try again.")
            }
            ide.editor.gotoLine(curPos.row + 1, curPos.column, false);
            ide.editor.focus();
            ide.editor.setReadOnly(false);
            enable_btn('control-btn-', ['beautify']);
        },
        error: function () {
            ide.editor.setReadOnly(false);
            enable_btn('control-btn-', ['beautify']);
        }
    });
}

function collaborate() {
    socket.emit("gui_event", "collaborate");
}
function testAssignment() {

}
function markDoneAssignment(subid) {
    var ass_id = $("#ass_id").val();
    $.ajax({
        type: 'POST',
        data: JSON.stringify({ status: 'C' }),
        contentType: 'application/json',
        url: '/sub/status/' + subid,
        error: function (data) {
            display_dialog("Error while marking submission. Please try again.");
        },
        success: function (data) {
            console.log(data);
            if (data.result != "OK") {
                display_dialog("Error while submission. Please try again.");
                ide.unfadeConsole();
            } else {
                window.location.href = "/t/as/" + ass_id + "/sub/evaluate";
            }
        }
    });
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function submitAssignment() {
    var snippet = getSnippet();
    snippet.sub_id = null;//getSubId();
    var ass_id = $("#ass_id").val();
    var preview = getUrlVars()["preview"];

    if (preview) {
        display_dialog("Submission is not allowed in preview mode.");
        return;
    }

    ide.fadeConsole("Submitting Assignment...");
    $.ajax({
        type: 'POST',
        data: JSON.stringify(snippet),
        contentType: 'application/json',
        url: '/s/as/submit/' + ass_id,
        error: function (data) {
            ide.unfadeConsole();
            display_dialog("Error while submission. Please try again.");
        },
        success: function (data) {
            console.log(data);
            if (data.result != "OK") {
                display_dialog("Error while submission. Please try again.");
                ide.unfadeConsole();
            } else {
                window.location.href = "/s/as/solve/" + ass_id;
            }
        }
    });
}

function saveCode(opts) {
    var new_folder = opts ? opts.new_folder : false;
    var callback = opts ? opts.callback : null;
    var parent_id = opts ? opts.parent_id : null;
    //console.log("saving code1");
    var login_msg = "Please login to save snippet to your personal account";
    if (new_folder) {
        login_msg = "Seems like you have been logged out. Please login again to create folder.";
    }
    if (popUpLogin(login_msg, saveCode)) return;
    //console.log("saving code2");
    var dialog_title = "Save Project";
    var dialog_name_label = "Name of Project:";
    var save_callback = function () {
        shareCode(true);
    }
    if (new_folder) {
        dialog_title = "New Folder";
        dialog_name_label = "Name of new folder:";
        save_callback = function () {
            shareCode(false, { new_folder: true, parent_id: parent_id, callback: callback });
        }
    }
    if (!project_uid) {
        $("#saveCodeModal").find(".modal-title").text(dialog_title);
        $("#saveCodeModal").find(".name_label").text(dialog_name_label);
        $('#saveCodeModal').find(".btn_save").off('click').on('click', save_callback);
        $("#saveCodeModal").modal("show");
        $('#saveCodeModal').off('shown.bs.modal').on('shown.bs.modal', function () {
            $("#project_name").focus();
        });
    }
    else {
        if (new_folder) shareCode(false, { new_folder: true, parent_id: parent_id, callback: callback });
        else shareCode(true);
    }
}

function update_navbar_with_projet_title(project_title) {
    var html = "<li id=\"navbar_project_title\">" + project_title + "</li>" +
        "<li ><a href=\"/\">Create New Project</a></li>";
    $("#navbar-ide").replaceWith(html);
    if ($("#navbar_project_title").length) {
        $("#navbar_project_title").text(project_title);
    }
}

function getSnippet() {
    var files = ide.editor.get_files();
    var src = "";
    var type = 'S';
    if (files.length == 1) {
        src = files[0].content;
    } else {
        src = JSON.stringify(files);
        type = 'M';
    }
    var stdin = $('#stdinput').val();
    var lang = $('#lang-select').find(':selected').val();
    var cmd_line_args = $('#cmd_line_args').val();
    var input_method = $("input[name='input_method']:checked").val();
    input_method = input_method == "text" ? 'T' : 'I';

    var snippet = {
        src: src, stdin: stdin, lang: lang, cmd_line_args: cmd_line_args,
        input_method: input_method, type: type
    };

    return snippet;
}

function share_code_snippet_modal(uid, snippet_type, msg) {
    var url = 'https://' + location.hostname + (location.port ? ':' + location.port : '');
    var embed_url = '//' + location.hostname + (location.port ? ':' + location.port : '');;
    var theme = $("#settings-editor-theme").val();
    url += '/' + uid; embed_url += '/embed/js/' + uid + '?theme=' + theme;

    url = url.replace('//www.', '//'); embed_url = embed_url.replace('//www.', '//');
    embed_url = '<script src="' + embed_url + '"></script>';
    var html = '<table style="width:100%"><tr><td style="float:right;padding-right:5px">Share Code:</td><td > <input onClick="this.select();" value="' + url + '" style="width:80%;text-align:center;font-family: monospace; padding:0px 10px" readonly></td></tr>';
    if (snippet_type == 'S')
        html += '<tr><td style="float:right;padding-right:5px">Embed Code: </td><td><input onClick="this.select();" value="' + encodeHtmlEntity(embed_url) + '" style="width:80%;text-align:center;font-family: monospace; padding:0px 10px" readonly></td></tr>';
    html += '</table>';

    if (msg) {
        $("#shareCodeModal .msg").html(msg);
    }
    $("#shareCodeModal .modal-body").html(html);
    $("#shareCodeModal").modal("show");
}

function disaplay_upgrade_message(msg) {
    display_dialog(msg, "<a target='_blank' href='/upgrade'>Click here</a> to upgrade your account to OnlineGDB Plus");
}
function shareCode(save, opts) {
    var snippet, src, stdin;
    var new_folder = opts ? opts.new_folder : false;
    var move_snippet = opts ? opts.move_snippet : false;
    var callback = opts ? opts.callback : null;

    if (new_folder) {
        snippet = {};
    } else if (move_snippet) {
        snippet = {
            uid: opts.uid,
            parent: opts.parent_id,
            move_snippet: true
        };

    } else {
        snippet = getSnippet();
        src = snippet.src;
        stdin = snippet.stdin;
        if (!savefile(src, stdin)) return;
    }



    if (save || new_folder) {
        var project_name = $("#project_name").val();
        snippet.name = project_name;
        snippet.save = true;
        snippet.uid = project_uid;
        $("#saveCodeModal").modal("hide");
        $("#project_title").text(project_name);
        $("#control-btn-save .btn_text").text("Saving");
        disable_btn('control-btn-', ['save']);
    }

    if (new_folder) {
        snippet.name = $("#project_name").val();
        snippet.new_folder = true;
        snippet.parent = opts.parent_id;
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(snippet),
        contentType: 'application/json',
        url: '/share',
        error: function (data) {
            if (save) {
                enable_btn('control-btn-', ['save']);
                $("#control-btn-save .btn_text").text("Save");
                alert("Project couldn't be saved. Make sure you are connected to internet and try again.");
            }
        },
        success: function (data) {
            //console.log(data);
            if (save) {
                enable_btn('control-btn-', ['save']);
                $("#control-btn-save .btn_text").text("Save");
            }
            if (data.result != "OK") {

                var msg = data.message ? data.message : "Error creating snippet. Please try again.";
                if (data.result == "LOGIN_ERROR") {
                    resetLogin(); saveCode();
                } else if (data.result == "UPGRADE") {
                    disaplay_upgrade_message(data.message);
                } else
                    alert(data.message);
                return;
            }

            if (callback) callback(data);

            if (data.new_folder || data.move_snippet) {
                return;
            }


            if (data.save) {
                project_uid = data.uid;
                ide.editor.focus();

                update_navbar_with_projet_title($("#project_title").text());
                project_saved = true;
                disable_btn('control-btn-', ['save']);
                $("#control-btn-save .btn_text").text("saved");
                return;
            }
            share_code_snippet_modal(data.uid, snippet.type);

        }
    });
}

var login_callback = null;

function resetLogin() {
    login_callback = null;
    isLoggedIn = false;
}

function popUpLogin(title, callback) {
    if (isLoggedIn) {
        return false;
    }
    if (title)
        $("#loginModal .modal-title").text(title);
    $("#loginModal").modal("show");

    login_callback = callback;
    return true;
}

function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function login(provider, callback) {
    var _url = "/auth/" + provider;
    var REDIRECT = 'callback';
    var LOGINFAIL = 'loginfail';
    var win = window.open(_url, "Social Login", 'width=800, height=600');

    var pollTimer = window.setInterval(function () {
        try {
            if (win.document.URL.indexOf(REDIRECT) != -1) {
                window.clearInterval(pollTimer);
                var url = win.document.URL;
                win.close();
                $("#loginModal").modal("hide");
                isLoggedIn = true;
                var html = "<a href=\"/logout\">Logout</a>";
                $("#login_logout_span").html(html);

                var next_url = getQueryStringValue("next").trim();
                if (next_url != "") {
                    window.location.href = next_url;
                    return;
                }
                if (callback) callback();
                else if (login_callback) login_callback();
            } else if (win.document.URL.indexOf(LOGINFAIL) != -1) {
                window.clearInterval(pollTimer);
                win.close();
            }
        } catch (e) {
            console.log("Error");
            console.log(e);
        }
    }, 100);
}

function enable_btn(control_bar, btnlist) {
    for (var i = 0; i < btnlist.length; i++) {
        $('#' + control_bar + btnlist[i]).removeAttr('disabled');
    }
}

function disable_btn(control_bar, btnlist) {
    //console.log(btnlist);
    for (var i = 0; i < btnlist.length; i++) {
        $('#' + control_bar + btnlist[i]).attr('disabled', true);
    }
}

function focusCommentBox() {
    var preview = getUrlVars()["preview"];

    if (preview) {
        display_dialog("Commenting isn't allowed in preview mode");
        return;
    }
    $(".right-sidebar").toggleClass("right-sidebar-active");
}

function get_src_filename(lang) {
    switch (lang.toLowerCase()) {
        case 'c': case 'c99': return 'main.c';
        case 'c++14': case 'c++11': case 'c++17':
        case 'c++': return 'main.cpp';
        case 'python': return 'main.py';
        case 'java': return 'Main.java';
        case 'c#': return 'main.cs';
        case 'vb': return 'main.vb';
        case 'php': return 'main.php';
        case 'ruby': return 'main.rb';
        case 'perl': return 'main.pl';
        case 'bash': return 'main.bash';
        case 'r': return 'main.r';
        case 'go': return 'main.go';
        case 'rust': return 'main.rs';
        case 'swift': return 'main.swift';
        case 'prolog': return 'main.pl';
        case 'js_rhino': return 'main.js';
        case 'sqlite3': return 'main.sql';
        case 'pascal': return 'main.pas';
        case 'fortran': return 'main.f95';
        case 'haskell': return 'main.hs';
        case 'objc': return 'main.m';
        case 'asm_gcc': return 'main.S';
        case 'html': return 'index.html';
    }
    return 'untitled';
}

function check_files(files, lang) {
    if (files.length == 1 && files[0].name == 'source code') {
        files[0].name = get_src_filename(lang);
    }
    return files;
}

function hide_console_tabs() {
    $("#console-title-bar .tab-stderr").hide();
    $("#console-title-bar .tab-stdout").hide();
    $("#console-title-bar .tab-debug").hide();
}
function is_compiled_language(lang) {
    switch (lang) {
        case 'java':
        case 'c#':
        case 'vb':
        case 'c': case 'c99':
        case 'c++': case 'c++11':
        case 'c++14': case 'c++17':
        case 'pascal':
        case 'fortran':
        case 'haskell':
        case 'objc':
        case 'go':
        case 'rust':
        case 'asm_gcc':
            return true;
    }
    return false;
}

var was_interactive_run = false;
function prun(opt) {//srcdata, stdinput, lang, cmd_line_args, test_ass_id, graphics, compiler_flags) {
    var srcdata = opt.srcdata;
    var stdinput = opt.stdinput;
    var lang = opt.lang;
    var cmd_line_args = opt.cmd_line_args;
    var test_ass_id = opt.test_ass_id;
    var graphics = opt.graphics;
    var compiler_flags = opt.compiler_flags;

    if (!check_server_connection(prun, opt)) return;
    if (!savefile(srcdata, stdinput)) return;
    if (term) {
        close_run_console();
    }

    ide.compile_stdout = "";
    ide.compile_stderr = "";

    hide_console_tabs();
    srcdata = check_files(srcdata, lang);
    disable_btn('control-btn-', ['run', 'run_x', 'debug', 'stop', 'beautify', 'newfile']);
    if (lang == 'html') {
        ide.output.hide();
        $("#stdin-wrapper").hide();
        $('#tab-stdin').show();
        $('.nav-tabs a[href="#tab-stdin"]').tab('show');
        ide.fadeMessage('Loading html project...');
        ide.fadeConsole();
    } else {
        var input_method = $("input[name='input_method']:checked").val();
        if (test_ass_id) input_method = 'text';
        //console.log("lang: "+lang);
        //console.log("Running program");
        //   scrollToAnchor("run-result");
        if (is_compiled_language(lang)) {
            ide.fadeConsole();
        }
        ide.output.hide();
        ide.running = true;
        ide.input_method = input_method;
        ide.running_state = "STARTED";
        ide.graphics = graphics;

        $("#stdin-wrapper").show();
        unhide_bottom_pane_if_hidden();
        was_interactive_run = false;
        ide.fadeMessage('Compiling Program...');
        if (input_method == 'interactive') {
            was_interactive_run = true;
            $("#bottom-component .btn_copy").show();
            enable_btn('control-btn-', ['stop']);
            $('#tab-stdin').show();
            $("#stdin-wrapper").hide();
            ide.editor.setReadOnly(true);
            $('.nav-tabs a[href="#tab-stdin"]').tab('show');
            createTerminal(document.getElementById("interactive-terminal-container"));
        }
    }

    socket.emit("run", {
        src: srcdata,
        stdin: stdinput,
        lang: lang,
        cmd_line_args: cmd_line_args,
        input_method: input_method,
        test_ass_id: test_ass_id,
        test: test_ass_id ? true : false,
        graphics: graphics,
        compiler_flags: compiler_flags
    });
}

function open_run_console() {
    ide.running = true;
    //    ide.set_gui_state("DEBUG_INIT");
    //    $("#debug-bar").show();
    //    $("#right-left-component").width('65%');
    //    $("#right-right-component").css({left:'65%'});
    //    $("#my-divider2").css({left:'65%'});
    //console.log("Line:"+editor.session.getLine(2));
    ide.editor.setReadOnly(true);
    //console.log("Line:"+editor.session.getLine(2));
    //    editor.gotoLine(4,0,true);
    enable_btn('control-btn-', ['stop']);

    $('#debug-console .inactive-content').hide();
    $('#debug-console .active-content').show();
    //console.log("tab-debug:"+ $('.nav-tabs a[href="#tab-debug-console"]').attr('aria-expanded'));
    if ($('.nav-tabs a[href="#tab-debug-console"]').attr('aria-expanded') == 'true') {
        //console.log("open debug console in area exanded");
        ide.checkAndOpenTerminal();
    }
    else
        $('.nav-tabs a[href="#tab-debug-console"]').tab('show');
}

function gui_reset_debug_windows() {
    gui_breakpoints_clear();
    gui_call_stack_clear();
    gui_local_variables_reset();
    gui_display_expr_window_reset();
    gui_registers_window_reset();
}

function setClipboard(value) {
    var tempInput = document.createElement("textarea");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function copy_output() {
    var output_content = term.get_content();
    setClipboard(output_content);
    display_dialog("Output copied to clipboard");
}

var bottom_pane_size = "min";
function toggle_bottom_pane_size() {
    if (bottom_pane_size == "min") {
        //maximize it
        $("#top-component").height('20%');
        $("#bottom-component").css({ top: '20%' });
        $("#my-divider1").css({ top: '20%' });
        $("#bottom-component .btn_minmax").removeClass('glyphicon-resize-full');
        $("#bottom-component .btn_minmax").addClass('glyphicon-resize-small');
        $("#bottom-component .btn_minmax").attr("title", "Minimize");
        bottom_pane_size = "max";
    }
    else {//minimize it
        $("#top-component").height('75%');
        $("#bottom-component").css({ top: '75%' });
        $("#my-divider1").css({ top: '75%' });
        $("#bottom-component .btn_minmax").removeClass('glyphicon-resize-small');
        $("#bottom-component .btn_minmax").addClass('glyphicon-resize-full');
        $("#bottom-component .btn_minmax").attr("title", "Maximize");
        bottom_pane_size = "min";
    }
    $("#bottom-component .btn_hide").removeClass('glyphicon-chevron-up');
    $("#bottom-component .btn_hide").addClass('glyphicon-chevron-down');
    $("#bottom-component .btn_hide").attr("title", "Hide");
    bottom_pan_hide = "unhide";
    $(window).trigger('resize');
}

var bottom_pan_hide = "unhide";
function toggle_bottom_pane_size_hide() {
    if (bottom_pan_hide == "unhide") { // hide pane
        $("#top-component").height('95%');
        $("#bottom-component").css({ top: '95%' });
        $("#my-divider1").css({ top: '95%' });
        $("#bottom-component .btn_hide").removeClass('glyphicon-chevron-down');
        $("#bottom-component .btn_hide").addClass('glyphicon-chevron-up');
        $("#bottom-component .btn_hide").attr("title", "Unhide");
        bottom_pan_hide = "hide";
    } else { // unhide pane
        bottom_pane_size = bottom_pane_size == "min" ? "max" : "min";
        toggle_bottom_pane_size();
        $("#bottom-component .btn_hide").removeClass('glyphicon-chevron-up');
        $("#bottom-component .btn_hide").addClass('glyphicon-chevron-down');
        $("#bottom-component .btn_hide").attr("title", "Hide");
        bottom_pan_hide = "unhide";
    }
    $(window).trigger('resize');
}

function unhide_bottom_pane_if_hidden() {
    if (bottom_pan_hide == "hide") {
        toggle_bottom_pane_size_hide();
    }
}

function is_right_right_component_opened() {
    var left = parseInt($("#right-right-component").css("left"));
    var parent_width = parseFloat($("#right-right-component").parent().css("width"));
    var offset_percent = (left / parent_width) * 100.0;
    return offset_percent < 96;
}

function show_right_right_component() {
    if (!is_right_right_component_opened()) {
        $("#right-left-component").width('65%');
        $("#right-right-component").css({ left: '65%' });
        $("#my-divider2").css({ left: '65%' });
    }
}

function open_debug_console() {
    ide.debugging = true;
    ide.set_gui_state("DEBUG_INIT");
    $("#tab-stdin").hide();
    $("#console-title-bar .tab-debug").show();
    show_right_right_component();
    $("#debug-bar").show();

    //console.log("Line:"+editor.session.getLine(2));
    gui_reset_debug_windows();
    ide.editor.setReadOnly(true);
    //console.log("Line:"+editor.session.getLine(2));
    //editor.gotoLine(4,0,true);
    enable_btn('control-btn-', ['stop']);

    $('#debug-console .inactive-content').hide();
    $('#debug-console .active-content').show();
    //console.log("tab-debug:"+ $('.nav-tabs a[href="#tab-debug-console"]').attr('aria-expanded'));
    if ($('.nav-tabs a[href="#tab-debug-console"]').attr('aria-expanded') == 'true') {
        //console.log("open debug console in area exanded");
        ide.checkAndOpenTerminal();
    }
    else
        $('.nav-tabs a[href="#tab-debug-console"]').tab('show');
}

function close_run_console() {
    if (term) term.destroy();
    term = null;
    if (live_ide) {
        ide.editor.setReadOnly(false);
    }
    disable_btn('control-btn-', ['stop']);
    enable_btn('control-btn-', ['run', 'run_x', 'debug', 'beautify', 'newfile']);
    $("#bottom-component .btn_copy").hide();
    ide.running = false;
    ide.running_state = null;
    if (ide.graphics_window) {
        ide.graphics_window.close();
        ide.graphics_window = null;
        ide.graphics = false;
    }
    $('#interactive-terminal-container').html("");
    $("#stdin-wrapper").show();
}

function close_debug_console() {

    if (ide.debugger != DEBUGGER_JAVA && ide.debugger != DEBUGGER_RUBY) {
        if (term) term.destroy();
        term = null;
    }
    $("#debug-bar").hide();
    $("#right-left-component").width('100%');
    $("#right-right-component").css({ left: '100%' });
    $("#my-divider2").css({ left: '100%' });
    if (live_ide) {
        ide.editor.setReadOnly(false);
    }
    disable_btn('control-btn-', ['stop']);
    enable_btn('control-btn-', ['run', 'run_x', 'debug', 'beautify', 'newfile']);
    ide.debugging = false;
    ide.debugginginitialized = false;
    if (ide.debugger != DEBUGGER_JAVA && ide.debugger != DEBUGGER_RUBY) {
        $('#debug-console .active-content').hide();
        $('#debug-console .inactive-content').show();
    }
}

function get_debugger_of_lang(lang) {
    switch (lang) {
        case 'c': case 'c99':
        case 'c++': case 'c++11':
        case 'asm_gcc':
        case 'c++14': case 'c++17': return DEBUGGER_CC;
        case 'python': return DEBUGGER_PYTHON;
        case 'java': return DEBUGGER_JAVA;
        case 'ruby': return DEBUGGER_RUBY;
    }
}
function pdebug(opt) {//srcdata, stdinput, lang, cmd_line_args, compiler_flags) {
    var srcdata = opt.srcdata;
    var stdinput = opt.stdinput;
    var lang = opt.lang;
    var cmd_line_args = opt.cmd_line_args;
    var compiler_flags = opt.compiler_flags;

    if (lang == 'html') {
        alert("Debug mode isn't supported for HTML,CSS,JS");
        return;
    }
    if (!check_server_connection(pdebug, opt)) return;
    if (!savefile(srcdata, stdinput)) return;

    if (ide.running) {
        close_run_console();
    }
    using_debugger_first_time();
    hide_console_tabs();

    ide.compile_stdout = "";
    ide.compile_stderr = "";

    disable_btn('control-btn-', ['run', 'debug', 'beautify', 'newfile']);

    var breakpoints = ide.editor.getBreakpointsList();
    if (is_compiled_language(lang)) {
        ide.fadeMessage('Compiling Program...');
        ide.fadeConsole();
    }
    unhide_bottom_pane_if_hidden();
    ide.debugger = get_debugger_of_lang(lang);
    socket.emit("debug", {
        src: srcdata, stdin: stdinput, lang: lang, breakpoints: breakpoints, cmd_line_args: cmd_line_args,
        compiler_flags: compiler_flags
    });
    open_debug_console();
}

function pstop() {
    //    console.log("Stopping program");
    if (ide.running) {
        if (ide.running_state != "FINISHED") {
            //            console.log("emmiting stoprun");
            socket.emit("stoprun", "");
        }
        close_run_console();
    } else {
        //        console.log("emmiting stopdebug");
        socket.emit("stopdebug", "");
    }
}

function trace_event(msg) {
    socket.emit("gui_event", msg);
}

$(function () {
    $("#feedback-tab").click(function () {
        $("#feedback-form").toggle("slide");
    });

    $("#feedback-form form").on('submit', function (event) {
        var $form = $(this);
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            success: function () {
                $("#feedback-form").toggle("slide").find("textarea").val('');
            }
        });
        event.preventDefault();
    });
});

ide.save = function (src) {
    if (project_uid) return;//Do not autosave those project saved on server
    try {
        window.sessionStorage.setItem('src_code', src);
    } catch (e) {
        //just ignore failed auto save
        //throw e;
    }
};

ide.saveParam = function (key, val, session_limited) {
    try {
        if (session_limited)
            window.sessionStorage.setItem(key, val);
        else
            window.localStorage.setItem(key, val);
    } catch (e) {
        //just ignore unsaved store
    }
}
ide.getParam = function (key) {
    return window.localStorage.getItem(key);
}
ide.autosave = function () {
    ide.save(JSON.stringify(ide.editor.get_files()));
};

/*
ide.share = function(){
    socket.emit('share', {
        src:editor.getValue(), stdin: $('#stdinput').val(), lang:$('#lang-select').find(':selected').val(),
        cmd_line_args:$('#cmd_line_args').val()
    });
}*/

ide.closesettings = function () {
    $('#popup-settings').hide();
    ide.editor.focus();
};

function get_socket_id() {
    console.log("socket_id:", socket.io.engine.id);
    return socket.io.engine.id;
}

ide.get_compiler_flags = function () {
    return $("#compiler_flags").val();
}

ide.runcode = function (opts) {
    var callback = opts ? opts.callback : null;
    var result_callback = opts ? opts.result_callback : null;
    var test_ass_id = opts ? opts.test_ass_id : null;
    var graphics = opts ? !!opts.graphics : null;
    var graphics_window = opts ? opts.graphics : null;
    ide.graphics_window = graphics_window;

    if ($('#control-btn-run').attr('disabled')) return;
    $('[data-toggle="tooltip"]').tooltip("hide");
    socket.emit("gui_event", "runcode");
    //console.log($("#cmd_line_args").val());
    ide.on_compiler_error = callback;
    ide.result_callback = result_callback;
    if (guide_language_selection(ide.runcode, opts)) {
        var opt = {};
        opt.srcdata = ide.editor.get_files();
        opt.stdinput = $('#stdinput').val();
        opt.lang = $('#lang-select').find(':selected').val();
        opt.cmd_line_args = $("#cmd_line_args").val();
        opt.test_ass_id = test_ass_id;
        opt.graphics = graphics;
        opt.compiler_flags = ide.get_compiler_flags();
        prun(opt);
    }
};

ide.debugcode = function () {
    if ($('#control-btn-debug').attr('disabled')) return;
    $('[data-toggle="tooltip"]').tooltip("hide");
    socket.emit("gui_event", "debugcode");
    if (guide_language_selection(ide.debugcode)) {
        $("#noDebugPythonModal .lang").text($("#lang-select").val());
        if ($("#lang-select").val() == 'php' || $("#lang-select").val() == 'ruby'
            || $("#lang-select").val() == 'perl' || $("#lang-select").val() == 'pascal'
            || $("#lang-select").val() == 'fortran' || $("#lang-select").val() == 'haskell'
            || $("#lang-select").val() == 'objc'
            || $("#lang-select").val() == 'sqlite3' || $("#lang-select").val() == 'js_rhino'
            || $("#lang-select").val() == 'prolog' || $("#lang-select").val() == 'swift'
            || $("#lang-select").val() == 'go' || $("#lang-select").val() == 'rust'
            || $("#lang-select").val() == 'bash' || $("#lang-select").val() == 'r'
            || $("#lang-select").val() == 'c#' || $("#lang-select").val() == 'vb') {
            $("#noDebugPythonModal").modal("show");
            return;
        }
        var opt = {};
        opt.srcdata = ide.editor.get_files();
        opt.stdinput = $('#stdinput').val();
        opt.lang = $('#lang-select').find(':selected').val();
        opt.cmd_line_args = $("#cmd_line_args").val();
        opt.compiler_flags = ide.get_compiler_flags();
        pdebug(opt);
    }
};

ide.setEditorTheme = function (val) {
    if (val == 'dark') {
        ide.editor.setTheme('ace/theme/idle_fingers');
        ide.saveParam('editor-theme', 'dark');
    }
    else if (val == 'light') {
        ide.editor.setTheme('ace/theme/chrome');
        ide.saveParam('editor-theme', 'light');
    }
};

ide.setEditorMode = function (val) {
    ide.editor.setKeyboardHandler('ace/keyboard/' + val);
    ide.saveParam('editor-mode', val);
}

ide.setEditorFontSize = function (val) {
    ide.editor.setFontSize(val);
    ide.saveParam('editor-font-size', val);
}

ide.setEditorTabSpace = function (val) {
    ide.editor.setTabSize(val);
    ide.saveParam('editor-tab-space', val);
}

ide.setLanguage = function (val, save_file) {
    save_file = save_file || true;
    ide.saveParam('code-lang', val, true);
    ide.editor.set_default_editor_filename(get_src_filename(val));
    ide.editor.setModeForLang(val);
    if (!editor_updated && !fork_snippet) {
        ide.editor.set_default_editor_content(get_default_src_content(val));
        editor_updated = false; // to make sure not updated by user
    }
    if (save_file)
        ide.autosave();
}

ide.setInputMethod = function (val) {
    ide.saveParam('input-method', val, true);
}

ide.setCompilerFlags = function (val) {
    ide.saveParam('compiler-flags', val, true);
}
function scrollToAnchor(aid) {
    var aTag = $("a[name='" + aid + "']");
    $('html,body').animate({ scrollTop: aTag.offset().top }, 'slow');
}

ide.checkAndOpenTerminal = function () {
    //console.log("Debug flags:"+ide.debugging+" "+ide.debugginginitialized);
    if (ide.debugging && !ide.debugginginitialized) {
        ide.debugginginitialized = true;
        //console.log("Starting terminal");
        createTerminal(document.getElementById("terminal-container"));
    }
}

var editor_updated = false;
var tour;
var lang_selection_callback = null;
var lang_selection_callback_arg = null;
function guide_language_selection(fun_callback, fun_arg) {
    if ($('#lang-select').find(':selected').val() != "") return true;

    lang_selection_callback = fun_callback;
    lang_selection_callback_arg = fun_arg;

    tour = new Tour({
        steps: [
            {
                element: "#lang-select",
                title: "Choose Language",
                content: ""
            }
        ],
        backdrop: true,
        backdropContainer: "#editor-container",
        template: "<div class='popover tour'>\
        <div class='arrow'></div>\
        <h4 class='popover-title'></h4>\
        <center><button class='btn btn-primary' data-role='end' style=\"padding:1px 6px\">OK</button></center>\
      </div>"
    });

    tour.init();

    tour.start(true);

    return false;
}


function get_rel_url(path) {
    var url = 'https://' + location.hostname + (location.port ? ':' + location.port : '');
    url += path;
    url = url.replace('//www.', '//');
    return url;
}

function createCookie(name, value, days) {
    var expires;

    if (!days)
        days = 100000000;//INF days

    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();

    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function using_debugger_first_time() {
    if (isTinyide) return;
    if (readCookie("c_shown_dbg_msg")) return;

    display_dialog("Using debugger for the first time?",
        "If you are new to debugging a program, then it will be helpful to get to know the usage of debugger. You can \
    go through <a target=\"_blank\" href=\"http://www.onlinegdb.com/blog/brief-guide-on-how-to-use-onlinegdb-debugger/\">\
    this guide</a> on \
    <a target=\"_blank\" href=\"http://www.onlinegdb.com/blog/brief-guide-on-how-to-use-onlinegdb-debugger/\">\
    how to use debugger </a>.");
    createCookie("c_shown_dbg_msg", "true");
    if (isLoggedIn) {
        save_user_data("c_shown_dbg_msg", "true");
    }
}

function save_user_data(key, val) {
    //TODO: save in DB and load when user logged in
}

function display_dialog(title, msg, opts) {
    if (!msg) msg = "";
    $("#genericModal .modal-title").text(title);
    $("#genericModal .modal-body").html(msg);
    var bodyObj = $("#genericModal .modal-body");
    var on_ok = opts ? opts.on_ok : null;
    var on_load = opts ? opts.on_load : null;
    if (on_load) {
        on_load(bodyObj);
    }
    if (on_ok) {
        $("#genericModal .ok-btn").off('click').on('click', function () {
            on_ok(bodyObj);
        });
    }
    $("#genericModal").modal("show");
}
function display_guide_to_stop_program() {
    display_dialog("stop program to edit source code",
        "You can't edit source code when programming is running.<br>\
        You can stop program by pressing 'Stop' button in top bar.");
}

/* WIP: load dynamic snippet 
function load_dynamic_snippet() {
    var code_lang = getParameterByName('lang');

    if(code_lang){
        ide.setLanguage(code_lang,false);
        $("#lang-select").val(code_lang);
    }    
}
*/

function load_editor_settings(fork_snippet) {
    //load editor settings
    var font_size = null;
    var tab_space = null;
    var keyboard_mode = null;
    var editor_theme = null;
    var code_lang = null;
    var input_method = null;
    var compiler_flags = null;

    try {
        font_size = window.localStorage.getItem('editor-font-size');
        tab_space = window.localStorage.getItem('editor-tab-space');
        keyboard_mode = window.localStorage.getItem('editor-mode');
        editor_theme = window.localStorage.getItem('editor-theme');
        code_lang = window.sessionStorage.getItem('code-lang');
        input_method = window.sessionStorage.getItem('input-method');
        compiler_flags = window.sessionStorage.getItem('compiler-flags');
    } catch (e) { /* We may be denied access of localStorage */ }

    if (font_size) {
        ide.setEditorFontSize(font_size);
        $("#settings-editor-font-size").val(font_size);
    }
    if (tab_space) {
        ide.setEditorTabSpace(tab_space);
        $("#settings-editor-tab-space").val(tab_space);
    }
    if (keyboard_mode) {
        ide.setEditorMode(keyboard_mode);
        $("#settings-editor-mode").val(keyboard_mode);
    }
    if (editor_theme) {
        ide.setEditorTheme(editor_theme);
        $("#settings-editor-theme").val(editor_theme);
    }
    if (compiler_flags) {
        $("#compiler_flags").val(compiler_flags);
    }
    if (fork_snippet) {
        $("#lang-select").val($("#fork-snippet").attr("lang"));
    } else {
        if (code_lang) {
            ide.setLanguage(code_lang, false);
            $("#lang-select").val(code_lang);
        }

        if (input_method) {
            input_method_handler(input_method);
            if (input_method == 'interactive') {
                $("#input_method_interactive").prop("checked", true);
                $("#input_method_text").prop("checked", false);
            } else if (input_method == 'text') {
                $("#input_method_interactive").prop("checked", false);
                $("#input_method_text").prop("checked", true);
            }
        }
        var src_code = null;
        try {
            src_code = window.sessionStorage.getItem('src_code');
        } catch (e) { }
        if (src_code) {
            try {
                ide.editor.set_files(JSON.parse(src_code));
            } catch (e) {
                report_error(e);
            }
        }
    }

    $("#project_name").keypress(function (event) {
        var key = event.which;
        if (key == 13) {
            event.preventDefault();
            shareCode(true);
            return false;
        }
    });

    function isEditableKeys(event) {
        var KeyID = event.keyCode;
        switch (KeyID) {
            case 9://tab
            case 8://backspace
            case 46://delete
                return true;
        }
        return false;
    }

    function isCharacterKeyPress(evt) {
        if (typeof evt.which == "undefined") {
            // This is IE, which only fires keypress events for printable keys
            return true;
        } else if (typeof evt.which == "number" && evt.which > 0) {
            // In other browsers except old versions of WebKit, evt.which is
            // only greater than zero if the keypress is a printable key.
            // We need to filter out backspace and ctrl/alt/meta key combinations
            return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
        }
        return false;
    }

    function need_stop_to_edit() {
        return (ide.debugging || (ide.running && ide.input_method != "text"
            && ide.running_state != "FINISHED"));
    }

    ide.editor.forEachEditor(function (editor) {
        editor.on("change", function (e) {
            editor_updated = true;
            project_saved = false;
            enable_btn('control-btn-', ['save']);
            $("#control-btn-save .btn_text").text("Save");
        });

        editor.container.addEventListener("keydown", function (e) {
            if (need_stop_to_edit() && isEditableKeys(e)) {
                display_guide_to_stop_program();
            }
        }, true);
        editor.container.addEventListener("keypress", function (e) {
            if (need_stop_to_edit() && isCharacterKeyPress(e)) {
                display_guide_to_stop_program();
            }
        }, true);
        //Ctrl+N command for editor
        editor.commands.addCommand({
            name: "newfile",
            bindKey: { win: "Ctrl-M", mac: "Command-Option-M" },
            exec: function (editor) {
                trace_event('Key-Ctrl+M');
                $('#control-btn-newfile').click();
            }
        });
        //Ctrl+S command for editor
        editor.commands.addCommand({
            name: "save",
            bindKey: { win: "Ctrl-S", mac: "Command-Option-S" },
            exec: function (editor) {
                trace_event('Key-Ctrl+S');
                $('#control-btn-save').click();
            }
        });
        //Ctrl+B command for editor
        editor.commands.addCommand({
            name: "beautify",
            bindKey: { win: "Ctrl-B", mac: "Command-Option-B" },
            exec: function (editor) {
                trace_event('Key-Ctrl+B');
                $('#control-btn-beautify').click();
            }
        });
        //Ctrl+I command for editor
        editor.commands.addCommand({
            name: "info",
            bindKey: { win: "Ctrl-i", mac: "Command-Option-i" },
            exec: function (editor) {
                ide.showinfo();
            }
        });

        //Ctrl+Shift+S command for editor
        editor.commands.addCommand({
            name: "settings",
            bindKey: { win: "Ctrl-Shift-s", mac: "Command-Option-Shift-S" },
            exec: function (editor) {
                ide.showsettings();
            }
        });

        //F9 for editor
        editor.commands.addCommand({
            name: "runcode",
            bindKey: { win: "f9", mac: "f9" },
            exec: function (editor) {
                trace_event('Key-F9');
                $('#control-btn-run').click();
            }
        });

        //F8 command for editor
        editor.commands.addCommand({
            name: "debugcode",
            bindKey: { win: "f8", mac: "f8" },
            exec: function (editor) {
                trace_event('Key-F8');
                $('#control-btn-debug').click();
            }
        });
    });
    //auto save every 15 seconds
    //if(live_ide && !fork_snippet)
    //    setInterval(ide.autosave, 5000);


    //check for user inactivity
    //Increment the idle time counter every minute.
    var idleTime = 0;
    var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });

    function timerIncrement() {
        idleTime = idleTime + 1;

        if (idleTime > 14) { // 15 minutes
            //console.log('user inactive');
            if (ide.debugging) {
                socket.emit('stopdebug');
                $('#myModal').modal('show');
            }
            if (ide.running && ide.running_state == "STARTED") {
                socket.emit('stoprun');
                $('#myModalRun').modal('show');
            }
            disconnect_socket();
            idleTime = 0;
        }
    }
}

function get_default_src_content(lang) {
    /* WIP: load dynamic snippet 
        var code_in_query = getParameterByName('default_code');
        if(code_in_query) 
            return code_in_query;
    */
    var content = "";
    var comment_content = "\n" +
        "Welcome to GDB Online.\n" +
        "GDB online is an online compiler and debugger tool for C, C++, Python, Java, PHP, Ruby, Perl,\n" +
        "C#, VB, Swift, Pascal, Fortran, Haskell, Objective-C, Assembly, HTML, CSS, JS, SQLite, Prolog.\n" +
        "Code, Compile, Run and Debug online from anywhere in world.\n" +
        "\n";
    var comment = "";
    switch (lang) {
        case 'html': {
            comment = '<!-- \n' + comment_content + '-->\n\n';
            content = '<html>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>';
            break;
        }
        case 'python': {
            content = "print ('Hello World')";
            comment = "'''\n" + comment_content + "'''\n";
            break;
        }
        case 'php': {
            comment = "/******************************************************************************\n" +
                comment_content +
                "*******************************************************************************/\n";
            content = "<?php\n" + comment +

                "\necho \"Hello World\";\n";
            comment = "";
            break;
        }
        case 'ruby': {
            comment = "=begin\n" + comment_content + "=end\n";
            content = "puts \"Hello World\"";
        } break;
        case 'perl': {
            comment = "=begin\n" + comment_content + "=end\n=cut\n";
            content = "print \"Hello World\";";
        } break;
        case 'bash': {
            comment = (comment_content.replace(/^/gm, '# ')) + "\n";
            content = "echo \"Hello World\";";
        } break;
        case 'r': {
            comment = (comment_content.replace(/^/gm, '# ')) + "\n";
            content = "print(\"Hello World\")";
        } break;
        case 'go': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "package main\n" +
                "import \"fmt\"\n\n" +

                "func main() {\n" +
                "    fmt.Println(\"Hello World\")\n" +
                "}";
        } break;
        case 'rust': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "fn main() {\n" +
                "    println!(\"Hello World\");\n" +
                "}";
        } break;
        case 'swift': {
            comment = "/**\n" + comment_content + "*/\n";
            content = "print(\"Hello World\")";
        } break;
        case 'sqlite3': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "/* Enter your sql queries here */";
        } break;
        case 'js_rhino': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "print('Hello World');";
        } break;
        case 'prolog': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "main:-\n" +
                "        process,\n" +
                "        halt.\n" +
                "\n" +
                "process:-\n" +
                "        write('Hello World').\n" +
                ":- main.";
        } break;
        case 'pascal': {
            comment = "{\n" + comment_content + "}\n";
            content = "program Hello;\n" +
                "begin\n" +
                "  writeln ('Hello World')\n" +
                "end.\n";
        } break;
        case 'fortran': {
            comment = (comment_content.replace(/^/gm, '! ')) + "\n";
            content = "Program Hello\n" +
                "Print *, \"Hello World\"\n" +
                "End Program Hello";
        } break;
        case 'haskell': {
            comment = "{-|\n" + comment_content + "-}\n";
            content = "main = putStrLn \"Hello World\"";
        } break;
        case 'objc': {
            comment = "/******************************************************************************" +
                comment_content +
                "*******************************************************************************/\n";
            content = "#import <Foundation/Foundation.h>\n" +
                "\n" +
                "int main (int argc, const char * argv[])\n" +
                "{\n" +
                "        NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];\n" +
                "        NSLog (@\"Hello World\");\n" +
                "        [pool drain];\n" +
                "        return 0;\n" +
                "}";
        } break;
        case 'asm_gcc': {
            comment = (comment_content.replace(/^/gm, '# ')) + "\n";
            content = ".data\n" +
                ".text\n" +
                ".global main\n" +
                "main:\n" +
                "	# your code goes here\n" +
                "	xor	%eax, %eax\n" +
                "	ret";
        } break;
        case 'java': {
            content = "public class Main\n\
{\n\
	public static void main(String[] args) {\n\
		System.out.println(\"Hello World\");\n\
	}\n\
}\n";
            comment = "/******************************************************************************\n" +
                comment_content +
                "*******************************************************************************/\n";
            break;
        }
        case 'c#': {
            content = "using System;\n" +
                "class HelloWorld {\n" +
                "  static void Main() {\n" +
                "    Console.WriteLine(\"Hello World\");\n" +
                "  }\n" +
                "}";
            comment = "/******************************************************************************\n" +
                comment_content +
                "*******************************************************************************/\n";
            break;
        }
        case 'vb': {
            content = "Module VBModule\n" +
                "    Sub Main()\n" +
                "        Console.WriteLine(\"Hello World\")\n" +
                "    End Sub\n" +
                "End Module";
            comment = (comment_content.replace(/^/gm, '\' ')) + "\n";
            break;
        }
        default:
            comment = "/******************************************************************************\n" +
                comment_content +
                "*******************************************************************************/\n";
            content =
                "#include <stdio.h>\n" +
                "\n" +
                "int main()\n" +
                "{\n" +
                "    printf(\"Hello World\");\n" +
                "\n" +
                "    return 0;\n" +
                "}\n";
    }
    return comment + content;
}

function forkCode() {
    location.href = "/fork" + location.pathname;
    /*history.pushState({},"",location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: ''));
    load_editor_settings();
    editor.setReadOnly(false);
    $("#stdinput").prop("readonly",false);*/
}

function input_method_handler(val) {
    ide.setInputMethod(val);
    if (val == 'interactive') {
        $('#stdinput').hide();
        $('#ad_unit_bottom_wrapper').show();
    }
    else if (val == 'text') {
        $('#stdinput').show()
        $('#ad_unit_bottom_wrapper').hide();
    }
}

function tmpeng(tmpt, dt) {
    var ret = tmpt.replace(/\{([\w\.]*)\}/g,
        function (str, k) {
            var ks = k.split(".");
            var v = dt[ks.shift()];
            var i = 0; var l = ks.length;
            for (; i < l; i++)
                v = v[ks[i]];
            if (typeof v !== "undefined" && v !== null)
                return v;
            return "";
        });
    return ret;
}

function comment_error_message(msg) {
    $("#comment_box .input_error_message").text(msg);
}
function append_comment_content(content, user, timestamp) {
    console.log(content);
    var comment_template = $("#comment_message_template").html();
    var html = tmpeng(comment_template, { content: content, user: user, timestamp: timestamp });
    $("#comment_box .media-list").append(html);
}

function update_comments(comments) {
    $("#comment_box .media-list").html("");
    for (i in comments) {
        console.log(comments[i]);
        var cmt = comments[i];
        var timestamp = new Date(cmt.ts_submitted).toLocaleString([], { hour12: true });
        append_comment_content(cmt.content, cmt.user.name, timestamp);
    }
}

function refresh_comments() {
    var snippet_id = $("#snippet_id").val();
    var ass_id = $("#ass_id").val();
    if (snippet_id == "") return;

    var params = { snippet_id: snippet_id, ass_id: ass_id };
    $.ajax({
        type: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json',
        url: '/comment/view',
        success: function (data) {
            console.log(data);
            if (data.result == "OK") {
                update_comments(data.data);
            } else {
                //TODO: what to do ?
            }
        },
        error: function () {
            //TODO: what to do?
        }
    });
}
function on_right_sidebar_close() {
    $(".right-sidebar").toggleClass("right-sidebar-active");
}
function on_add_comment() {
    comment_error_message("");

    var comment_content = $("#comment_box .input_content").val().trim();
    if (comment_content == '') {
        comment_error_message("Please enter message to comment.");
        return;
    }
    var snippet_id = $("#snippet_id").val();
    var ass_id = $("#ass_id").val();
    var params = { content: comment_content, snippet_id: snippet_id, ass_id: ass_id };

    $.ajax({
        type: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json',
        url: '/comment/add',
        success: function (data) {
            if (data.result == "OK") {
                $("#comment_box .input_content").val("");
                refresh_comments();
                //append_comment_content(comment_content);
            } else {
                comment_error_message(data.error_message);
            }
        },
        error: function () {
            comment_error_message("Unable to add comment due to unkown error. Please try again and contact webmaster if problem persists.");
        }
    });
}

bind_socket_handlers();

var live_ide = true;
var fork_snippet = false;
var project_saved = true;

$(document).ready(function () {
    /* TODO: WIP
   //load comments 
   refresh_comments();

   //attach click listners
   $("#btn-add-comment").click(on_add_comment);
   $("#right-sidebar-close").click(on_right_sidebar_close);
   $("#comment_box .input_content").on('keyup', function (e) {

       if (e.keyCode == 13) {
           on_add_comment(e);
       }
   }); 
   */
});
if (typeof main_ide !== 'undefined') {
    //console.log("Initializing main IDE");
    $(document).ready(function () {
        /* TODO: WIP
       //load comments 
       refresh_comments();
   
       //attach click listners
       $("#btn-add-comment").click(on_add_comment);
       $("#comment_box .input_content").on('keyup', function (e) {
   
           if (e.keyCode == 13) {
               on_add_comment(e);
           }
       }); */


        //console.log("Document on ready");
        window.addEventListener("beforeunload", function (e) {
            if ((project_uid && project_saved) || !editor_updated) return;

            var confirmationMessage = "\o/";

            (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
            return confirmationMessage;                                //Webkit, Safari, Chrome etc.
        });

        $('[data-toggle="tooltip"]').tooltip();

        terminalContainer = document.getElementById('terminal-container');

        $("#settings-editor-theme").change(function () {
            ide.setEditorTheme($("#settings-editor-theme").val());
        });

        $("#settings-editor-mode").change(function () {
            ide.setEditorMode($("#settings-editor-mode").val());
        });

        $("#settings-editor-font-size").change(function () {
            ide.setEditorFontSize($("#settings-editor-font-size").val());
        });

        $("#settings-editor-tab-space").change(function () {
            ide.setEditorTabSpace($("#settings-editor-tab-space").val());
        });

        $("#compiler_flags").change(function () {
            ide.setCompilerFlags($("#compiler_flags").val());
        });

        $("#lang-select").change(function () {
            if (tour) tour.end();
            var lang = $("#lang-select").val();

            ide.setLanguage(lang);
            if (lang_selection_callback) {
                lang_selection_callback(lang_selection_callback_arg);
                lang_selection_callback = lang_selection_callback_arg = null;
            }
        });

        $('#input_method_interactive').change(function () {
            input_method_handler(this.value);
        });
        $('#input_method_text').change(function () {
            input_method_handler(this.value);
        });

        $('#console-title-bar a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href");
            ide.checkAndOpenTerminal();
            if (target == "#tab-stdin") {
                $("#tab-stdin").show();
            } else {
                $("#tab-stdin").hide();
            }
        });

        $("#input_watch_expr").on('keydown', function (event) {
            if (event.keyCode == 13) {
                var expr = $("#input_watch_expr").val().trim();
                if (ide.set_watch_expr(expr, "")) {
                    socket.emit('add_watch_expr', expr);
                }
                $("#input_watch_expr").val("");
            }
        });

        live_ide = !($("#code-snippet").length > 0);
        fork_snippet = ($("#fork-snippet").length > 0);
        if (!live_ide) {
            ide.editor.setReadOnly(true);
            ide.editor.hideCursor();
            ide.editor.setOptions({ readOnly: true, highlightActiveLine: false, highlightGutterLine: false });
            $("#lang-select").val($("#code-snippet").attr("lang"));
        }

        if (live_ide) {
            load_editor_settings(fork_snippet);
        }
        /* WIP: load dynamic snippet 
            load_dynamic_snippet();
        */
        //console.log($("#top-component").length);
        $("#debug_window_display_expression table").colResizable({ liveDrag: true });
        $("#debug_window_call_stack table").colResizable({ liveDrag: true });
        $("#debug_window_local_variables table").colResizable({ liveDrag: true });
        $("#debug_window_breakpoints table").colResizable({ liveDrag: true });
        $("#top-component").on('splitpaneresize', function () {
            //console.log("resided");
        });
    });
    $(window).resize(function (event) {
        if (term) term.fit();
        if (ide.editor) ide.editor.resize();
    });

}

var confirm_popup = function (msg, callback) {
    $("#confirmModal .modal-title").text(msg);
    $("#confirmModal .modal-body .btn-ok").off("click").on('click', function (e) {
        callback(e);
        $("#confirmModal").modal("hide");
    });
    $("#confirmModal").modal("show");
}

function g_renamefilemodal_get_edit_filename() {
    //function g_get_edit_filename(){
    return $("#edit_file_name").val();
}
function g_renamefilemodal_error_message(msg) {
    $("#renameFileModal .error_message").text(invalid_filename);
}
function g_renamefilemodal_hide() {
    $("#renameFileModal").modal("hide");
}
//function g_file_rename_popup(default_name, callback, callback_arg){
function g_renamefilemodal_popup(opts, callback, callback_arg) {
    var default_name = opts.default_name;
    var title = opts.title;

    //console.log("file_rename_popup:");
    $("#edit_file_name").val(default_name);
    $("#renameFileModal .modal-title").text(title);

    $("#edit_file_name").off('keypress').keypress(function (event) {
        var key = event.which;
        if (key == 13) {
            event.preventDefault();
            if (callback) {
                callback(event, callback_arg);
            }
            //handle_edit_file_input(event, eid);
            return false;
        }
    });

    $("#renameFileModal .modal-body .btn-ok").off("click").on('click', function (e) {
        if (callback) {
            callback(e, callback_arg);
        }
        //handle_edit_file_input(e, eid);
    });

    $("#renameFileModal .error_message").text("");
    $("#renameFileModal").modal("show");
    $('#renameFileModal').off('shown.bs.modal').on('shown.bs.modal', function () {
        $("#edit_file_name").focus();
    });

}

function report_error(e) {
    Raven.captureException(e);
    return;
    var error = {};
    if (e.error) {
        error.message = e.error.message.toString();
        error.stack = e.error.stack.toString()
        error.stack_console = console.trace();
    } else {
        error.message = e;
        error.stack = console.trace();
    }

    var report_data = {
        error: error,
        source_code: editor.getValue(),
        stdin: $("#stdinput").val(),
        gdb_log: $("#terminal-container").text()
    }
    //console.log(report_data);
    socket.emit("report_error", report_data);
}

/* FOr IE support */
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.lastIndexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

