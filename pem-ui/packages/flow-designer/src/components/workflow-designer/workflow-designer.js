import React, { useState, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';

import './workflow-designer.scss';

import Designer from '../../../../page-designer/src';
import componentMapper from '../../../../carbon-mappers/src';

import { DialogFlowDesigner, TaskFlowDesigner } from '../flow-designers';
import {
  connectionLineStyle,
  defaultViewport,
  snapGrid,
  endMarks,
  TASK_NODE_TYPES,
  TASK_EDGE_TYPES,
  DIALOG_INITIAL_NODES,
  DIALOG_NODE_TYPES,
  DIALOG_EDGE_TYPES,
  NODE_TYPE,
  TASK_INITIAL_NODES
} from '../../constants';
import { useEffect } from 'react';
import useTaskStore from '../../store';

let dialogId = 0;
const getNewDialogId = () => `Dialog_Name_${dialogId++}`;

let taskId = 0;
const getNewTaskId = () => `Task_Name_${taskId++}`;

export default function WorkFlowDesigner({ showActivityDefineDrawer, editDefinitionProp, editSchemaProp, activityDefinitionData }) {
  //-------------------------------- State Management -------------------------------------
  const storeData = useTaskStore((state) => state.tasks);
  const addTaskNode = useTaskStore((state) => state.addTaskNodes);
  const addDialogNodes = useTaskStore((state) => state.addDialogNodes);
  const addTaskEdge = useTaskStore((state) => state.addTaskEdges);
  const addDialogEdge = useTaskStore((state) => state.addDialogEdges);
  const restStore = useTaskStore((state) => state.reset);
  const [isDialogFlowActive, setIsDialogFlowActive] = useState(false);
  const [isPageDesignerActive, setIsPageDesignerActive] = useState(false);

  // --------------------------------- Task Flow States -----------------------------------
  const [openTaskPropertiesBlock, setOpenTaskPropertiesBlock] = useState(showActivityDefineDrawer);
  const taskFlowWrapper = useRef(null);
  const [taskNodes, setTaskNodes, onTaskNodesChange] = useNodesState(storeData.taskNodes);
  const [taskEdges, setTaskEdges, onTaskEdgesChange] = useEdgesState([]);
  const [taskFlowInstance, setTaskFlowInstance] = useState(null);
  const [selectedTaskNode, setSelectedTaskNode] = useState(null);

  // --------------------------------- Dialog Flow States -----------------------------------
  const [openDialogPropertiesBlock, setOpenDialogPropertiesBlock] = useState(false);
  const dialogFlowWrapper = useRef(null);
  const [dialogNodes, setDialogNodes, onDialogNodesChange] = useNodesState([]);
  const [dialogEdges, setDialogEdges, onDialogEdgesChange] = useEdgesState([]);
  const [dialogFlowInstance, setDialogFlowInstance] = useState(null);
  const [selectedDialogNode, setSelectedDialogNode] = useState(null);

  // --------------------------------- Dialog Flow Methods -----------------------------------
  const onDialogNodeDoubleClick = (type) => {
    if (type === NODE_TYPE.DIALOG) {
      setIsPageDesignerActive(true);
    }
  };

  const onDialogNodeConnect = useCallback(
    (params) => {
      let newParam = params;
      newParam.type = 'crossEdge';
      newParam.markerEnd = endMarks;
      newParam.data = selectedTaskNode?.id;
      addDialogEdge(selectedTaskNode, addEdge({ ...newParam, style: { stroke: '#000' } }, dialogEdges.slice(0, storeData.taskEdges.length - 1)));
    },
    [addDialogEdge, dialogEdges, selectedTaskNode, storeData.taskEdges.length]
  );

  const onDialogNodeDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    setOpenTaskPropertiesBlock(showActivityDefineDrawer);
  }, [showActivityDefineDrawer]);

  useEffect(() => {
    if (storeData.taskNodes.length === 0) {
      restStore();
    }
  }, [restStore, storeData]);

  useEffect(() => {
    setTaskNodes(storeData.taskNodes);
    setTaskEdges(storeData.taskEdges);
    console.log('store>>>', storeData);
    if (selectedTaskNode) {
      const dialogNodeData = storeData.taskNodes.filter((node) => node.id === selectedTaskNode.id)[0];
      setDialogNodes(dialogNodeData?.data?.dialogNodes);
      setDialogEdges(dialogNodeData?.data?.dialogEdges);
    }
    editSchemaProp(storeData);
  }, [setTaskNodes, setTaskEdges, setDialogEdges, storeData, selectedTaskNode, editSchemaProp, setDialogNodes]);

  const onDialogNodeDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodeData'));

      // check if the dropped element is valid
      if (typeof nodeData === 'undefined' || !nodeData) {
        return;
      }

      // Get the position of the dialog
      const position = dialogFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newDialog = {
        id: getNewDialogId(),
        position,
        type: nodeData.type,
        data: { ...nodeData, onDoubleClick: onDialogNodeDoubleClick }
      };

      addDialogNodes(selectedTaskNode, newDialog);
    },
    [addDialogNodes, dialogFlowInstance, selectedTaskNode]
  );

  const onDialogNodeClick = (event, node) => {
    if (node.type === NODE_TYPE.DIALOG || node.type === NODE_TYPE.XSLT || node.type === NODE_TYPE.API) {
      let copyNodes = dialogNodes;
      copyNodes.map((copyNode) => {
        if (node.id === copyNode.id) {
          copyNode.data.borderColor = '#023FB2';
        } else {
          copyNode.data.borderColor = '#0585FC';
        }
        return copyNode;
      });
      setDialogNodes([...copyNodes]);
      setSelectedDialogNode(node);
      setOpenDialogPropertiesBlock(true);
    }
  };

  // --------------------------------- Task Flow Methods -----------------------------------
  const onTaskNodeDoubleClick = (type) => {
    if (type === NODE_TYPE.PARTNER || type === NODE_TYPE.SPONSOR || type === NODE_TYPE.CUSTOM || type === NODE_TYPE.SYSTEM) {
      setIsDialogFlowActive(true);
    }
  };

  const onTaskNodeConnect = useCallback(
    (params) => {
      let newParam = params;
      newParam.type = 'crossEdge';
      newParam.markerEnd = endMarks;
      addTaskEdge(addEdge({ ...newParam, style: { stroke: '#000' } }, storeData.taskEdges.slice(0, storeData.taskEdges.length - 1)));
    },
    [addTaskEdge, storeData.taskEdges]
  );

  const onTaskNodeDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onTaskNodeDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodeData'));

      // check if the dropped element is valid
      if (typeof nodeData === 'undefined' || !nodeData) {
        return;
      }

      // Get the position of the task
      const position = taskFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newTask = {
        id: getNewTaskId(),
        position,
        type: nodeData.type,
        data: { ...nodeData, onDoubleClick: onTaskNodeDoubleClick, dialogNodes: DIALOG_INITIAL_NODES, dialogEdges: [] }
      };
      addTaskNode(newTask);
    },
    [addTaskNode, taskFlowInstance]
  );

  const onTaskNodeClick = (event, node) => {
    if (
      node.type === NODE_TYPE.PARTNER ||
      node.type === NODE_TYPE.APPROVAL ||
      node.type === NODE_TYPE.ATTRIBUTE ||
      node.type === NODE_TYPE.SPONSOR ||
      node.type === NODE_TYPE.CUSTOM ||
      node.type === NODE_TYPE.SYSTEM
    ) {
      let copyNodes = taskNodes;
      copyNodes.map((copyNode) => {
        if (node.id === copyNode.id) {
          copyNode.data.borderColor = '#023FB2';
        } else {
          copyNode.data.borderColor = '#0585FC';
        }
        return copyNode;
      });
      setTaskNodes([...copyNodes]);
      setSelectedTaskNode(node);
      setDialogNodes(node.data.dialogNodes);
      setOpenTaskPropertiesBlock(true);
    }
  };

  return (
    <>
      {isPageDesignerActive ? (
        <DndProvider debugMode={true} backend={HTML5Backend}>
          <Designer componentMapper={componentMapper} />
        </DndProvider>
      ) : (
        <>
          <div className="work-flow-designer">
            {isDialogFlowActive ? (
              <DialogFlowDesigner
                connectionLineStyle={connectionLineStyle}
                defaultViewport={defaultViewport}
                snapGrid={snapGrid}
                dialogFlowWrapper={dialogFlowWrapper}
                dialogNodes={dialogNodes}
                dialogEdges={dialogEdges}
                onDialogNodesChange={onDialogNodesChange}
                onDialogEdgesChange={onDialogEdgesChange}
                dialogFlowInstance={dialogFlowInstance}
                setDialogFlowInstance={setDialogFlowInstance}
                onDialogNodeConnect={onDialogNodeConnect}
                onDialogNodeDrop={onDialogNodeDrop}
                onDialogNodeDragOver={onDialogNodeDragOver}
                onDialogNodeClick={onDialogNodeClick}
                DIALOG_NODE_TYPES={DIALOG_NODE_TYPES}
                DIALOG_EDGE_TYPES={DIALOG_EDGE_TYPES}
                selectedDialogNode={selectedDialogNode}
                selectedTaskNode={selectedTaskNode}
                openDialogPropertiesBlock={openDialogPropertiesBlock}
                setOpenDialogPropertiesBlock={setOpenDialogPropertiesBlock}
              />
            ) : (
              <TaskFlowDesigner
                connectionLineStyle={connectionLineStyle}
                defaultViewport={defaultViewport}
                snapGrid={snapGrid}
                taskFlowWrapper={taskFlowWrapper}
                taskNodes={taskNodes}
                taskEdges={taskEdges}
                onTaskNodesChange={onTaskNodesChange}
                onTaskEdgesChange={onTaskEdgesChange}
                taskFlowInstance={taskFlowInstance}
                setTaskFlowInstance={setTaskFlowInstance}
                onTaskNodeConnect={onTaskNodeConnect}
                onTaskNodeDrop={onTaskNodeDrop}
                onTaskNodeDragOver={onTaskNodeDragOver}
                onTaskNodeClick={onTaskNodeClick}
                TASK_NODE_TYPES={TASK_NODE_TYPES}
                TASK_EDGE_TYPES={TASK_EDGE_TYPES}
                selectedTaskNode={selectedTaskNode}
                openTaskPropertiesBlock={openTaskPropertiesBlock}
                setOpenTaskPropertiesBlock={setOpenTaskPropertiesBlock}
                showActivityDefineDrawer={showActivityDefineDrawer}
                editDefinitionProp={editDefinitionProp}
                activityDefinitionData={activityDefinitionData}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}