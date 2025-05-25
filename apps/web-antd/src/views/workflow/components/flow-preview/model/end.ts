import LogicFlow, { CircleNode, CircleNodeModel } from '@logicflow/core';

class endModel extends CircleNodeModel {
  override initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data);
    this.r = 20;
  }
}

class endView extends CircleNode {}

export default {
  type: 'end',
  model: endModel,
  view: endView,
};
