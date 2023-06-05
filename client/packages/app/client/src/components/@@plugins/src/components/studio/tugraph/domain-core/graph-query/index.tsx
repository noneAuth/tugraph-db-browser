import {
  AppstoreAddOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import GremlinEditor from 'ace-gremlin-editor';
import {
  Button,
  Divider,
  Empty,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tooltip,
} from 'antd';
import { filter, find, isEmpty, map, uniqueId } from 'lodash';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'umi';
import { useImmer } from 'use-immer';
import { SplitPane } from '../../components/split-panle';
import { IQUIRE_LIST, PUBLIC_PERFIX_CLASS } from '../../constant';
import { useQuery } from '../../hooks/useQuery';
import { useSchema } from '../../hooks/useSchema';
import { SubGraph } from '../../interface/graph';
import { PluginPorps } from '../../interface/openpiece';
import { ExcecuteResultProp } from '../../interface/query';
import { getLocalData, setLocalData } from '../../utils';
import { downloadFile } from '../../utils/downloadFile';
import { nodesEdgesListTranslator } from '../../utils/nodesEdgesListTranslator';
import ExcecuteResultPanle from './components/excecute-result-panle';
import ModelOverview from './components/model-overview';
import { NodeQuery } from './components/node-query';
import { PathQueryPanel } from './components/path-query';
import { StatementList } from './components/statement-query-list';

import styles from './index.module.less';

const { Option } = Select;

export const GraphQuery = (props: PluginPorps) => {
  const history = useHistory();
  const location = history.location;

  const graphList = getLocalData('TUGRAPH_SUBGRAPH_LIST') as SubGraph[];
  const {
    onStatementQuery,
    StatementQueryLoading,
    onPathQuery,
    PathQueryLoading,
    onNodeQuery,
    NodeQueryLoading,
  } = useQuery();
  const { onGetGraphSchema } = useSchema();
  const [state, updateState] = useImmer<{
    activeTab: string;
    isListShow: boolean;
    currentGraphName: string;
    graphListOptions: { label: string; value: string }[];
    editorWidth: number | string;
    editorHeight: number;
    pathHeight: number;
    script: string;
    resultData: Array<ExcecuteResultProp & { id?: string }>;
    queryList: Array<{
      id: string;
      value: string;
      script: string;
      isEdit?: boolean;
    }>;
    editorKey: string;
    graphData?: {
      nodes: Array<{
        indexs: string;
        labelName: string;
        nodeType: string;
        primary: string;
        properties: Array<{ id: string; name: string }>;
      }>;
      edges: Array<{
        edgeType: string;
        indexs: string;
        labelName: string;
        edgeConstraints: Array<Array<string>>;
      }>;
    };
    editor: any;
  }>({
    graphListOptions: map(graphList, (graph: SubGraph) => {
      return {
        label: graph.graph_name,
        value: graph.graph_name,
      };
    }),
    activeTab: IQUIRE_LIST[0].key,
    isListShow: true,
    currentGraphName: location?.query?.graphName as string,
    editorWidth: 350,
    editorHeight: 372,
    pathHeight: 388,
    script: `MATCH p=()-[]-() RETURN p LIMIT 100`,
    resultData: [],
    queryList: [],
    editorKey: '',
    graphData: { nodes: [], edges: [] },
    editor: {},
  });
  const {
    activeTab,
    isListShow,
    currentGraphName,
    graphListOptions,
    editorWidth,
    editorHeight,
    pathHeight,
    script,
    resultData,
    queryList,
    editorKey,
    graphData,
    editor,
  } = state;
  useEffect(() => {
    updateState((draft) => {
      if (isEmpty(getLocalData('TUGRAPH_STATEMENT_LISTS')[currentGraphName])) {
        draft.queryList = [
          {
            id: `${new Date().getTime()}`,
            value: '语句0',
            script: 'MATCH p=()-[]-() RETURN p LIMIT 100',
          },
        ];
      } else {
        draft.queryList = getLocalData('TUGRAPH_STATEMENT_LISTS')[
          currentGraphName
        ];
      }
    });
    onGetGraphSchema({ graphName: currentGraphName }).then((res) => {
      if (res.success) {
        updateState((draft) => {
          draft.graphData = { ...res.data };
        });
      }
    });
  }, []);
  useEffect(() => {
    updateState((draft) => {
      draft.queryList = getLocalData('TUGRAPH_STATEMENT_LISTS')[
        currentGraphName
      ];
    });
  }, [activeTab]);
  const onSplitPaneWidthChange = useCallback((size: number) => {
    updateState((draft) => {
      draft.editorWidth = size;
    });
  }, []);
  const onSplitPaneHeightChange = useCallback((size: number) => {
    updateState((draft) => {
      draft.editorHeight = size;
    });
  }, []);
  const onSplitPanePathHeightChange = useCallback((size: number) => {
    updateState((draft) => {
      draft.pathHeight = size;
    });
  }, []);
  const redirectUrl = props?.redirectPath;
  const onResultClose = useCallback(
    (id: string) => {
      updateState((draft) => {
        draft.resultData = [...filter(resultData, (item) => item.id !== id)];
      });
    },
    [resultData]
  );
  const handleQuery = (limit, conditions, queryParams) => {
    if (activeTab === IQUIRE_LIST[0].key) {
      onStatementQuery({
        graphName: currentGraphName,
        script,
      }).then((res) => {
        updateState((draft) => {
          draft.resultData = [...resultData, { ...res, id: uniqueId('id_') }];
        });
      });
    }
    if (activeTab === IQUIRE_LIST[1].key) {
      onPathQuery({
        graphName: currentGraphName,
        path: queryParams,
        limit,
        conditions,
      }).then((res) => {
        updateState((draft) => {
          draft.resultData = [...resultData, { ...res, id: uniqueId('id_') }];
          draft.script = res.script;
        });
      });
    }
    if (activeTab === IQUIRE_LIST[2].key) {
      onNodeQuery({
        graphName: currentGraphName,
        limit,
        conditions,
        nodes: queryParams,
      }).then((res) => {
        updateState((draft) => {
          draft.resultData = [...resultData, { ...res, id: uniqueId('id_') }];
          draft.script = res.script;
        });
      });
    }
  };

  const header = (
    <div className={styles[`${PUBLIC_PERFIX_CLASS}-header`]}>
      <div className={styles[`${PUBLIC_PERFIX_CLASS}-headerLeft`]}>
        <ArrowLeftOutlined
          onClick={() => {
            history.push(redirectUrl?.[0]?.path ?? '/');
          }}
        />
        <Select
          onChange={(value) => {
            window.location.href = `${location.pathname}?graphName=${value}`;
          }}
          defaultValue={currentGraphName}
          options={graphListOptions}
        />
      </div>
      <Tabs
        defaultActiveKey="statement"
        centered
        items={IQUIRE_LIST}
        onChange={(val) => {
          updateState((draft) => {
            draft.activeTab = val;
          });
        }}
      >
        {map(IQUIRE_LIST, (item) => (
          <Tabs.TabPane tab={item.label} key={item.key} />
        ))}
      </Tabs>
      <div className={styles[`${PUBLIC_PERFIX_CLASS}-headerRight`]}>
        <Tooltip title="用户帮助">
          <QuestionCircleOutlined
            onClick={() => {
              window.open(
                'https://tugraph.antgroup.com/doc?version=V3.4.0&id=10000000001669468'
              );
            }}
          />
        </Tooltip>
        <div className={styles[`${PUBLIC_PERFIX_CLASS}-headerRight-btn`]}>
          <Button
            style={{ marginRight: '8px' }}
            onClick={() => {
              history.push(
                `${redirectUrl?.[1]?.path}?graphName=${currentGraphName}` ?? '/'
              );
            }}
          >
            返回图构建
          </Button>
          <Button disabled>前往图分析</Button>
        </div>
      </div>
    </div>
  );
  const actionBar = (
    <div className={styles[`${PUBLIC_PERFIX_CLASS}-right-bar`]}>
      <div className={styles[`${PUBLIC_PERFIX_CLASS}-left-btn`]}>
        <Space split={<Divider type="vertical" />}>
          <div style={{ gap: '24px', display: 'flex' }}>
            <Select defaultValue={'Cypher'}>
              <Option value="Cypher">Cypher</Option>
              <Option disabled value="ISOGQL">
                ISOGQL
              </Option>
            </Select>
            <Button
              type="primary"
              onClick={handleQuery}
              loading={StatementQueryLoading}
              icon={<PlayCircleOutlined />}
            >
              执行
            </Button>
          </div>
          <div>
            <Tooltip title="收藏为模版">
              <Button
                type="text"
                icon={<AppstoreAddOutlined />}
                onClick={() => {
                  updateState((draft) => {
                    draft.queryList = [
                      ...(isEmpty(
                        getLocalData('TUGRAPH_STATEMENT_LISTS')[
                          currentGraphName
                        ]
                      )
                        ? []
                        : getLocalData('TUGRAPH_STATEMENT_LISTS')[
                            currentGraphName
                          ]),
                      {
                        id: `${new Date().getTime()}`,
                        value: '收藏语句',
                        script: script,
                      },
                    ];
                  });
                  setLocalData('TUGRAPH_STATEMENT_LISTS', {
                    ...getLocalData('TUGRAPH_STATEMENT_LISTS'),
                    [currentGraphName]: [
                      ...(isEmpty(
                        getLocalData('TUGRAPH_STATEMENT_LISTS')[
                          currentGraphName
                        ]
                      )
                        ? getLocalData('TUGRAPH_STATEMENT_LISTS')[
                            currentGraphName
                          ]
                        : {
                            id: `${new Date().getTime()}`,
                            value: '收藏语句',
                            script: script,
                          }),
                    ],
                  });
                }}
              >
                收藏
              </Button>
            </Tooltip>
            <Tooltip title="下载语句">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => {
                  downloadFile(script, '查询语句.txt');
                }}
              >
                下载
              </Button>
            </Tooltip>
          </div>
        </Space>
      </div>
      <div className={styles[`${PUBLIC_PERFIX_CLASS}-right-btn`]}>
        查看图模型
        <Switch
          defaultChecked
          onChange={(val) => {
            updateState((draft) => {
              draft.isListShow = val;
              if (val) {
                draft.editorWidth = editorWidth;
              }
            });
          }}
        />
      </div>
    </div>
  );
  return (
    <div className={styles[`${PUBLIC_PERFIX_CLASS}-container`]}>
      {header}
      {activeTab === IQUIRE_LIST[0].key && (
        <div className={styles[`${PUBLIC_PERFIX_CLASS}-content`]}>
          <StatementList
            list={queryList}
            garphName={currentGraphName}
            onSelect={(id) => {
              updateState((draft) => {
                const value = find(
                  getLocalData('TUGRAPH_STATEMENT_LISTS')[currentGraphName],
                  (item) => item.id === id
                )?.script;
                if (!isEmpty(editor)) {
                  editor?.editorInstance?.setValue?.(value);
                }
                draft.script = value;
                draft.editorKey = id;
              });
            }}
          />
          <div className={styles[`${PUBLIC_PERFIX_CLASS}-content-right`]}>
            <div className={styles[`${PUBLIC_PERFIX_CLASS}-content-right-top`]}>
              {actionBar}
              <div
                style={{ height: '100%', position: 'relative' }}
                className={styles[`${PUBLIC_PERFIX_CLASS}-split-pane`]}
              >
                <SplitPane
                  split="horizontal"
                  defaultSize={editorHeight}
                  onChange={onSplitPaneHeightChange}
                >
                  <div
                    className={[
                      styles[`${PUBLIC_PERFIX_CLASS}-right-center`],
                      styles[`${PUBLIC_PERFIX_CLASS}-split-pane`],
                    ].join(' ')}
                  >
                    <SplitPane
                      split="vertical"
                      primary="second"
                      defaultSize={editorWidth}
                      onChange={onSplitPaneWidthChange}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: editorHeight,
                          position: 'absolute',
                          width: '100%',
                          marginTop: 20,
                        }}
                      >
                        <GremlinEditor
                          gremlinId="test"
                          initValue={script}
                          onInit={(initEditor) => {
                            updateState((draft) => {
                              draft.editor = initEditor;
                              if (editorKey) {
                                const value = find(
                                  getLocalData('TUGRAPH_STATEMENT_LISTS')[
                                    currentGraphName
                                  ],
                                  (item) => item.id === editorKey
                                )?.script;
                                initEditor?.editorInstance?.setValue?.(value);
                                draft.script = value;
                              }
                            });
                          }}
                          onValueChange={(val) => {
                            updateState((draft) => {
                              draft.script = val;
                            });
                            setLocalData(`TUGRAPH_STATEMENT_LISTS`, {
                              ...getLocalData(`TUGRAPH_STATEMENT_LISTS`),
                              [currentGraphName]: map(
                                getLocalData(`TUGRAPH_STATEMENT_LISTS`)[
                                  currentGraphName
                                ],
                                (item) => {
                                  if (item.id === editorKey) {
                                    return { ...item, script: val };
                                  }
                                  return item;
                                }
                              ),
                            });
                          }}
                        />
                      </div>
                      {isListShow && (
                        <div
                          style={{
                            width: editorWidth,
                            position: 'absolute',
                            right: 0,
                            overflow: 'hidden',
                            height: editorHeight,
                          }}
                        >
                          <ModelOverview graphName={currentGraphName} />
                        </div>
                      )}
                    </SplitPane>
                  </div>
                  <div
                    className={
                      styles[`${PUBLIC_PERFIX_CLASS}-content-right-bottom`]
                    }
                  >
                    {resultData.length ? (
                      <ExcecuteResultPanle
                        queryResultList={resultData}
                        onResultClose={onResultClose}
                        graphData={graphData}
                        graphName={currentGraphName}
                      />
                    ) : (
                      <div
                        className={styles[`${PUBLIC_PERFIX_CLASS}-bottom-spin`]}
                      >
                        <Spin spinning={StatementQueryLoading}>
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </Spin>
                      </div>
                    )}
                  </div>
                </SplitPane>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === IQUIRE_LIST[1].key && (
        <div className={styles[`${PUBLIC_PERFIX_CLASS}-path-container`]}>
          <div
            style={{ height: '100%', position: 'relative' }}
            className={styles[`${PUBLIC_PERFIX_CLASS}-split-pane`]}
          >
            <SplitPane
              split="horizontal"
              defaultSize={pathHeight}
              onChange={onSplitPanePathHeightChange}
            >
              <PathQueryPanel
                edges={nodesEdgesListTranslator('edge', graphData)}
                nodes={graphData.nodes}
                onQueryPath={handleQuery}
              />
              <div className={styles[`${PUBLIC_PERFIX_CLASS}-path-result`]}>
                {resultData.length ? (
                  <ExcecuteResultPanle
                    graphData={graphData}
                    graphName={currentGraphName}
                    queryResultList={resultData}
                    onResultClose={onResultClose}
                  />
                ) : (
                  <div className={styles[`${PUBLIC_PERFIX_CLASS}-path-spin`]}>
                    <Spin spinning={PathQueryLoading}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Spin>
                  </div>
                )}
              </div>
            </SplitPane>
          </div>
        </div>
      )}
      {activeTab === IQUIRE_LIST[2].key && (
        <div className={styles[`${PUBLIC_PERFIX_CLASS}-node-content`]}>
          <NodeQuery nodes={graphData.nodes} nodeQuery={handleQuery} />
          <div className={styles[`${PUBLIC_PERFIX_CLASS}-node-result`]}>
            {resultData.length ? (
              <ExcecuteResultPanle
                graphData={graphData}
                graphName={currentGraphName}
                queryResultList={resultData}
                onResultClose={onResultClose}
              />
            ) : (
              <div className={styles[`${PUBLIC_PERFIX_CLASS}-node-spin`]}>
                <Spin spinning={NodeQueryLoading}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </Spin>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
