import ace from "ace-builds";
import "ace-builds/src-noconflict/snippets/c_cpp";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/snippets/python";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-c_cpp";

var aceEditor;

//语言模式选项
var modes = new Map([
    ["PYTHON", "ace/mode/python"],
    ["JAVA", "ace/mode/java"],
    ["CPP", "ace/mode/c_cpp"],
    ["C", "ace/mode/c_cpp"]
]);

var fontSizes = new Map([
    ["超大", 30],
    ["大", 24],
    ["中", 18],
    ["小", 14]
]);

function init(ref) {
    aceEditor = ace.edit(ref, {
        maxLines: 100,
        minLines: 33,
        fontSize: 16,
        value: this.value ? this.value : "",
        tabSize: 4,
        theme: "ace/theme/monokai", //clouds
        mode: "ace/mode/c_cpp"
    });
    // 激活自动提示
    aceEditor.setOptions({
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableBasicAutocompletion: true
    });
}

function setTheme(mode) {
    aceEditor.setTheme("ace/theme/" + mode);
}

function setFontSize(sizeOpt) {
    let size = fontSizes.get(sizeOpt);
    aceEditor.setFontSize(size);
}

function setMode(lang) {
    let m = modes.get(lang);
    // 根据编程语言设置编辑器模式
    this.aceEditor.getSession().setMode(m);
}

function getSourceCode() {
    return aceEditor.getSession().getValue();
}

function setSourceCode(code) {
    aceEditor
        .getSession()
        .getDocument()
        .setValue(code);
}

export {
    init,
    setTheme,
    setFontSize,
    setMode,
    getSourceCode,
    setSourceCode
}