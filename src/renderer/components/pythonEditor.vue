<template>
  <div id="content_area">
    <div id="blocklyDiv" style="height: 600px; width: 800px;"></div>
    <div id="toolbox" style="display: none">
      <category :name="logic" colour="210">
        <block type="logic_boolean"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_null"></block>
        <block type="logic_ternary"></block>
        <block type="controls_if"></block>
        <block type="controls_ifelse"></block>
        <block type="controls_if_if"></block>
        <block type="controls_if_elseif"></block>
        <block type="controls_if_else"></block>
      </category>
      <sep gap="32"></sep>
      <category :name="loops" colour="120">
        <!-- <block type="controls_repeat"></block> -->
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_whileUntil"></block>
        <block type="controls_for">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="BY">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="controls_forEach"></block>
        <block type="controls_flow_statements"></block>
      </category>
      <sep gap="32"></sep>
      <category :name="math" colour="230">
        <block type="math_number"></block>
        <block type="math_arithmetic">
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="math_single">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">9</field>
            </shadow>
          </value>
        </block>
        <block type="math_trig">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">45</field>
            </shadow>
          </value>
        </block>
        <block type="math_constant"></block>
        <block type="math_number_property">
          <value name="NUMBER_TO_CHECK">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="math_round">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">3.1</field>
            </shadow>
          </value>
        </block>
        <block type="math_on_list"></block>
        <block type="math_modulo">
          <value name="DIVIDEND">
            <shadow type="math_number">
              <field name="NUM">64</field>
            </shadow>
          </value>
          <value name="DIVISOR">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="math_constrain">
          <value name="VALUE">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="LOW">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="HIGH">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_int">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_float"></block>
        <block type="math_atan2"></block>
      </category>
      <sep gap="32"></sep>
      <category :name="text" colour="160">
        <block type="text"></block>
        <!-- <block type="text_multiline"></block> -->
        <block type="text_join"></block>
        <block type="text_create_join_container"></block>
        <block type="text_create_join_item"></block>
        <block type="text_append">
          <value name="TEXT">
            <shadow type="text"></shadow>
          </value>
        </block>
        <block type="text_length">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_isEmpty">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT"></field>
            </shadow>
          </value>
        </block>
        <block type="text_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{{varText}}</field>
            </block>
          </value>
          <value name="FIND">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_charAt">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{{varText}}</field>
            </block>
          </value>
        </block>
        <block type="text_getSubstring">
          <value name="STRING">
            <block type="variables_get">
              <field name="VAR">{{varText}}</field>
            </block>
          </value>
        </block>
        <block type="text_changeCase">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_trim">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_print">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_prompt_ext">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_prompt"></block>
        <block type="text_count"></block>
        <block type="text_replace"></block>
        <block type="text_reverse"></block>
      </category>
      <sep gap="32"></sep>
      <category :name="list" colour="260">
        <block type="lists_create_empty"></block>
        <block type="lists_repeat">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">5</field>
            </shadow>
          </value>
        </block>
        <block type="lists_reverse"></block>
        <block type="lists_isEmpty"></block>
        <block type="lists_length"></block>
        <block type="lists_create_with"></block>
        <block type="lists_create_with_container"></block>
        <block type="lists_create_with_item"></block>
        <block type="lists_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{{varList}}</field>
            </block>
          </value>
        </block>
        <block type="lists_getIndex">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{{varList}}</field>
            </block>
          </value>
        </block>
        <block type="lists_setIndex">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">{{varList}}</field>
            </block>
          </value>
        </block>
        <block type="lists_getSublist">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">{{varList}}</field>
            </block>
          </value>
        </block>
        <block type="lists_sort"></block>
        <block type="lists_split">
          <value name="DELIM">
            <shadow type="text">
              <field name="TEXT">,</field>
            </shadow>
          </value>
        </block>
      </category>
      <sep gap="32"></sep>
      <category :name="colour" colour="20">
        <block type="colour_picker"></block>
        <block type="colour_random"></block>
        <block type="colour_rgb">
          <value name="RED">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
          <value name="GREEN">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="BLUE">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="colour_blend">
          <value name="COLOUR1">
            <shadow type="colour_picker">
              <field name="COLOUR">#ff0000</field>
            </shadow>
          </value>
          <value name="COLOUR2">
            <shadow type="colour_picker">
              <field name="COLOUR">#3333ff</field>
            </shadow>
          </value>
          <value name="RATIO">
            <shadow type="math_number">
              <field name="NUM">0.5</field>
            </shadow>
          </value>
        </block>
      </category>
      <sep gap="32"></sep>
      <category :name="vars" colour="330" custom="VARIABLE">
        <!-- <block type="variables_get"></block>
        <block type="variables_set"></block>
        <block type="math_change"></block>
        <block type="variables_get_dynamic"></block>
        <block type="variables_set_dynamic"></block>-->
      </category>
      <sep gap="32"></sep>
      <category :name="functions" colour="290" custom="PROCEDURE">
        <!-- <block type="procedures_defnoreturn"></block>
        <block type="procedures_defreturn"></block>
        <block type="procedures_mutatorcontainer"></block>
        <block type="procedures_mutatorarg"></block>
        <block type="procedures_callnoreturn"></block>
        <block type="procedures_callreturn"></block>
        <block type="procedures_ifreturn"></block>-->
      </category>
    </div>
    <el-input id="textarea" type="textarea"></el-input>
    <el-button @click="runCode">执行</el-button>
  </div>
</template>

<script>
import Blockly from "blockly";
import "blockly/blockly";
import "blockly/blocks";
import "blockly/python";
import * as blockly_cn from "blockly/msg/zh-hans";
import * as blockly_en from "blockly/msg/en";
import cn from "./editor/lang/zh-hans";
import en from "./editor/lang/en";

export default {
  data() {
    return {
      workspace: null,
      code: "",
      screenWidth: "",
      screenHeight: "",
      logic: cn.MSG["catLogic"],
      loops: cn.MSG["catLoops"],
      math: cn.MSG["catMath"],
      text: cn.MSG["catText"],
      list: cn.MSG["catLists"],
      vars: cn.MSG["catVariables"],
      functions: cn.MSG["catFunctions"],
      colour: cn.MSG["catColour"],
      varList: cn.MSG["listVariable"],
      varText: cn.MSG["textVariable"]
      // logic: "",
      // loops: "",
      // math: "",
      // text: "",
      // list: "",
      // vars: "",
      // functions: "",
      // colour: "",
      // varList: "",
      // varText: "",
      // lang: ""
    };
  },
  methods: {
    langChangeHandle(lang) {
      console.log(lang + ".MSG");
      let langClass = lang + ".MSG";
      this.logic = langClass["catLogic"];
      this.loops = lang.MSG["catLoops"];
      this.math = lang.MSG["catMath"];
      this.text = lang.MSG["catText"];
      this.list = lang.MSG["catLists"];
      this.vars = lang.MSG["catVariables"];
      this.functions = lang.MSG["catFunctions"];
      this.colour = lang.MSG["catColour"];
      this.varList = lang.MSG["listVariable"];
      this.varText = lang.MSG["textVariable"];

      Blockly.setLocale("blockly_" + lang);
    },
    generateCode(event) {
      // 生成python代码
      this.code = Blockly.Python.workspaceToCode(this.workspace);
      document.getElementById("textarea").value = this.code;
    },
    runCode() {
      window.LoopTrap = 1000;
      Blockly.JavaScript.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
      var code = Blockly.JavaScript.workspaceToCode(this.workspace);
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      try {
        console.log(eval(code));
      } catch (e) {
        console.log(e);
      }
    },
    getBBox_(element) {
      var height = element.offsetHeight;
      var width = element.offsetWidth;
      var x = 0;
      var y = 0;
      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      } while (element);
      return {
        height: height,
        width: width,
        x: x,
        y: y
      };
    },
    onresize() {
      var container = document.getElementById("content_area");
      var bBox = this.getBBox_(container);
      var el = document.getElementById("blocklyDiv");
      el.style.top = bBox.y + "px";
      el.style.left = bBox.x + "px";
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + "px";
      el.style.height = 2 * bBox.height - el.offsetHeight + "px";
      el.style.width = bBox.width + "px";
      el.style.width = 2 * bBox.width - el.offsetWidth + "px";
      console.log(el);
    }
  },
  mounted() {
    this.workspace = Blockly.inject("blocklyDiv", {
      toolbox: document.getElementById("toolbox"),
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      media: "./editor/media/"
    });

    // this.langChangeHandle("cn");
    Blockly.setLocale(blockly_cn);
    this.workspace.addChangeListener(this.generateCode);
    // this.onresize();
    // this.screenWidth = document.body.clientWidth;
    // this.screenHeight = document.body.clientHeight;
    // window.onresize = () => {
    //   return (() => {
    //     this.screenWidth = document.body.clientWidth;
    //     this.screenHeight = document.body.clientHeight;
    //   })();
    // };
  }
};
</script>