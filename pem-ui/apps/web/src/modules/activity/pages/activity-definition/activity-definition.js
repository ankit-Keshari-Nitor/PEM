import React, { useState, useEffect, useRef } from 'react';
import Designer from '@b2bi/flow-designer';
import { Button, Column, Grid } from '@carbon/react';
import './activity-definition.css';
import { CloneIcon, CopyIcon, DeleteIcon, HistoryIcon, PlayIcon } from '../../icons';
import useActivityStore from '../../store';
import { OPERATIONS, ROUTES } from '../../constants';

export default function ActivityDefinition() {
  const activityStore = useActivityStore((state) => state.activities);
  const activityReset = useActivityStore((state) => state.reset);
  const editDefinitionProp = useActivityStore((state) => state.editDefinitionProps);
  const editSchemaProp = useActivityStore((state) => state.editSchemaProps);
  const [showActivityDefineDrawer, setShowActivityDefineDrawer] = useState();
  const [activityDefinitionData, setActivityDefinitionData] = useState();
  const activityOperation = activityStore.operation;
  const readOnly = activityStore.operation === OPERATIONS.VIEW ? true : false;
  const ref = useRef();
  useEffect(() => {
    if (activityDefinitionData?.id !== '' || activityDefinitionData?.name === '' || activityDefinitionData?.name === null || activityDefinitionData?.name === undefined) {
      setShowActivityDefineDrawer(true);
    } else {
      setShowActivityDefineDrawer(false);
    }
  }, [activityDefinitionData]);

  useEffect(() => {
    setActivityDefinitionData(activityStore.definition);
  }, [activityStore]);

  const handleActivityReset = () => {
    ref.current?.handleRest();
    activityReset();
  };

  return (
    <>
      <Grid className="activity-actions">
        <Column>
          <CloneIcon />
        </Column>
        <Column>
          <PlayIcon />
        </Column>
        <Column>
          <DeleteIcon />
        </Column>
        <Column>
          <CopyIcon />
        </Column>
        <Column>
          <HistoryIcon />
        </Column>
        <Column>
          <Button id="saveactivity" href={ROUTES.ACTIVITY_LIST} disabled={readOnly} onClick={() => handleActivityReset()}>
            Save Activity
          </Button>
        </Column>
      </Grid>
      <Designer.WorkFlowDesigner
        ref={ref}
        showActivityDefineDrawer={showActivityDefineDrawer}
        editDefinitionProp={editDefinitionProp}
        editSchemaProp={editSchemaProp}
        activityDefinitionData={activityDefinitionData}
        activityOperation={activityOperation}
        readOnly={readOnly}
        onVersionSelection={(selectedVersion)=> console.log(selectedVersion)}
        versionData={[]}//todo -- this data will be based on version api response 
        selectedVersion={"1"}//todo - pass current version id being loaded
      />
    </>
  );
}
