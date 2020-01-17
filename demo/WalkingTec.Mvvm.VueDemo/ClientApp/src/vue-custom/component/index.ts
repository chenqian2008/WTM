// 内容布局
import Card from "@/components/layout/components/card.vue";
// 弹出框
import DialogBox from "@/components/page/dialog/dialog-box.vue";
// 查询
import FuzzySearch from "@/components/page/fuzzy-search.vue";
// 列表
import TableBox from "@/components/page/table-box.vue";
// 操作按钮
import ButBox from "@/components/page/but-box.vue";

export default [
  { key: "Card", value: Card },
  { key: "DialogBox", value: DialogBox },
  { key: "FuzzySearch", value: FuzzySearch },
  { key: "TableBox", value: TableBox },
  { key: "ButBox", value: ButBox }
];
