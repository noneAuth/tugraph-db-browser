import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/', controller.home.index);

  // TuGraph Auth
  router.get('/api/auth/user', controller.tugraph.auth.getUserList);
  router.post('/api/auth/user', controller.tugraph.auth.createUser);
  router.put('/api/auth/user', controller.tugraph.auth.updateUser);
  router.put('/api/auth/password', controller.tugraph.auth.updatePassword);
  router.delete('/api/auth/user', controller.tugraph.auth.deleteUser);
  router.put(
    '/api/auth/user/disable',
    controller.tugraph.auth.setUserDisabledStatus
  );
  router.get('/api/auth/role', controller.tugraph.auth.getRoleList);
  router.post('/api/auth/role', controller.tugraph.auth.createRole);
  router.put('/api/auth/role', controller.tugraph.auth.updateRole);
  router.delete('/api/auth/role', controller.tugraph.auth.deleteRole);
  router.put(
    '/api/auth/role/disable',
    controller.tugraph.auth.setRoleDisabledStatus
  );

  // TuGraph subGraph
  router.get('/api/subgraph', controller.tugraph.subgraph.getSubGraphList);
  router.post('/api/subgraph', controller.tugraph.subgraph.createSubGraph);
  router.post(
    '/api/subgraph/template',
    controller.tugraph.subgraph.createSubGraphFromTemplate
  );
  router.put('/api/subgraph', controller.tugraph.subgraph.updateSubGraph);
  router.delete('/api/subgraph', controller.tugraph.subgraph.deleteSubGraph);
  router.get(
    '/api/subgraph/:graphName',
    controller.tugraph.subgraph.subGraphDetailInfo
  );
  router.get('/api/subgraph', controller.tugraph.subgraph.getSubGraphList);

  // TuGraph Schema
  // 点边统计，包括点边类型数量及数据库中点边数据数量
  router.get(
    '/api/statistics/:graphName',
    controller.tugraph.schema.vertexEdgeStatistics
  );

  // 点边类型数量
  router.get(
    '/api/statistics/:graphName/labels',
    controller.tugraph.schema.getVertexEdgeSchemaCount
  );

  // 点边数量
  router.get(
    '/api/statistics/:graphName/count',
    controller.tugraph.schema.getVertexEdgeCount
  );

  router.get('/api/schema/:graphName', controller.tugraph.schema.getSchema);
  router.post('/api/schema/:graphName', controller.tugraph.schema.createSchema);
  router.delete(
    '/api/schema/:graphName',
    controller.tugraph.schema.deleteSchema
  );

  // 查询指定点边类型的Schema
  router.get(
    '/api/schema/:graphName/:labelType/:labelName',
    controller.tugraph.schema.getSchemaByType
  );

  // 指定点边的 Schema 修改
  router.post(
    '/api/property/:graphName',
    controller.tugraph.schema.createProperty
  );
  router.put(
    '/api/property/:graphName',
    controller.tugraph.schema.updateProperty
  );
  router.delete(
    '/api/property/:graphName',
    controller.tugraph.schema.deleteProperty
  );

  // schema 导入
  router.post('/api/import/schema', controller.tugraph.schema.importSchema);

  // 索引相关
  router.post('/api/index/:graphName', controller.tugraph.schema.createIndex);
  router.delete('/api/index/:graphName', controller.tugraph.schema.deleteIndex);

  // 系统信息相关
  router.get('/api/info/system', controller.tugraph.info.querySystemInfo);
  router.get('/api/info/database', controller.tugraph.info.queryDatabaseInfo);

  // 图数据查询
  router.post(
    '/api/query/language',
    controller.tugraph.query.queryByGraphLanguage
  );
  router.post('/api/query/path', controller.tugraph.query.queryByPath);
  router.post('/api/query/node', controller.tugraph.query.queryByNode);

  // 数据相关
  router.post('/api/data/node', controller.tugraph.data.createNode);
  router.post('/api/data/edge', controller.tugraph.data.createEdge);
  router.delete('/api/data/node', controller.tugraph.data.deleteNode);
  router.delete('/api/data/edge', controller.tugraph.data.deleteEdge);
  router.put('/api/data/node', controller.tugraph.data.updateNode);
  router.put('/api/data/edge', controller.tugraph.data.updateEdge);
};
