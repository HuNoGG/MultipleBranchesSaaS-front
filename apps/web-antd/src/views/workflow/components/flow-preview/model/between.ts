import LogicFlow, { RectNode, RectNodeModel } from '@logicflow/core';

class BetweenModel extends RectNodeModel {
  override getNodeStyle() {
    return super.getNodeStyle();
  }
  override initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data);
    this.width = 100;
    this.height = 80;
    this.radius = 5;
  }
}

class BetweenView extends RectNode {}

export default {
  type: 'between',
  model: BetweenModel,
  view: BetweenView,
};
