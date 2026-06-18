

export function initModels(sequelize: Sequelize) {
  const Edge = _Edge.initModel(sequelize);
  const Graph = _Graph.initModel(sequelize);
  const UpdateLog = _UpdateLog.initModel(sequelize);
  const User = _User.initModel(sequelize);