<template>
  <div>
    <div id="blocklyDiv" style="height: 480px; width: 600px;"></div>
    <div id="toolbox" style="display: none">
      <!-- <block type="controls_if"></block>
      <block type="controls_repeat_ext"></block>
      <block type="logic_compare"></block>
      <block type="math_number"></block>
      <block type="math_arithmetic"></block>
      <block type="text"></block>
      <block type="text_print"></block>-->
      <category name="Logic" colour="210">
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
      </category>
      <category name="Loops" colour="120">
          <block type="loops_repeat"></block>
      </category>
      <category name="Math" colour="230">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_asin"></block>
      </category>
      <category name="Text" colour>
        <block type="text"></block>
        <block type="text_print"></block>
      </category>
      <category name="List" colour></category>
      <category name="Colour" colour></category>
      <category name="Variables" colour="330" custom="VARIABLE"></category>
      <category name="Functions" colour="290" custom="PROCEDURE"></category>
      <!-- <category name="事件" colour="210"></category>
      <category name="控制" colour="120" custom="LOOP"></category>
      <category name="运算" colour="230"></category>
      <category name="字符串" colour="330"></category>
      <category name="变量" colour="180" custom="VARIABLE"></category>
      <category name="列表" colour="10"></category>
      <category name="字典" colour="150"></category>
      <category name="函数" colour="290" custom="PROCEDURE"></category>-->
    </div>
  </div>
</template>

<script>
import Blockly from "blockly";
import "blockly/blockly.js";
import "blockly/blocks.js";
import "blockly/msg/zh-hans.js";

export default {
  data() {
    return {
      workspace: null
    };
  },
  mounted() {
    this.workspace = Blockly.inject("blocklyDiv", {
      toolbox: document.getElementById("toolbox")
    });
  }
};
</script>