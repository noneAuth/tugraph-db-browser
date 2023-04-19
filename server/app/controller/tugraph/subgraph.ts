import { Controller } from 'egg';
import { responseData } from '../../util';

class TuGraphSubGraphController extends Controller {
  async createSubGraph() {
    const { ctx } = this;
    const params = ctx.request.body;
    const { graphName, config } = params;
    const result = await ctx.service.tugraph.subgraph.createSubGraph(
      graphName,
      config
    );
    responseData(ctx, result);
  }

  async updateSubGraph() {
    const { ctx } = this;
    const params = ctx.request.body;
    const { graphName, config } = params;

    const result = await ctx.service.tugraph.subgraph.updateSubGraph(
      graphName,
      config
    );
    responseData(ctx, result);
  }

  async deleteSubGraph() {
    const { ctx } = this;
    const params = ctx.request.query;
    const { graphName } = params;

    const result = await ctx.service.tugraph.subgraph.deleteSubGraph(graphName);
    responseData(ctx, result);
  }

  async subGraphDetailInfo() {
    const { ctx } = this;
    const { graphName } = ctx.params;
    const result = await ctx.service.tugraph.subgraph.getSubGraphInfo(
      graphName
    );
    responseData(ctx, result);
  }

  /**
   * 获取子图列表
   */
  async getSubGraphList() {
    const { ctx } = this;
    const result = await ctx.service.tugraph.subgraph.getSubGraphList();
    responseData(ctx, result);
  }
}

export default TuGraphSubGraphController;
