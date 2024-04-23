import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { TrashCan } from '@carbon/icons-react';

import './field-renderer.scss';
import { COMPONENT } from '../../../constants/constants';
import { Column, Grid } from '@carbon/react';

const FieldRenderer = ({ data, path, componentMapper, renderRow, handleDrop, onFieldDelete, onFieldSelect, previewMode, onChangeHandle }) => {
  let compent_type;
  let dragItem;
  var isNestedBlock = false;
  if (data.maintype) {
    compent_type = data.maintype;
    isNestedBlock = true;
    dragItem = { path, ...data };
  } else {
    compent_type = data.component.type;
    dragItem = { type: COMPONENT, id: data.id, path, component: data.component };
  }
  const FormFieldComponent = componentMapper[compent_type];

  if (!FormFieldComponent) {
    throw new Error(`cannot render field <${compent_type}>`);
  }

  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    item: dragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0 : 1;
  const formFieldData = isNestedBlock ? (
    <FormFieldComponent
      renderRow={renderRow}
      row={data}
      currentPath={path}
      handleDrop={handleDrop}
      componentMapper={componentMapper}
      onFieldSelect={onFieldSelect}
      onFieldDelete={onFieldDelete}
      previewMode={previewMode}
      onChangeHandle={onChangeHandle}
    />
  ) : (
    <FormFieldComponent field={data.component} id={data.id} currentPath={path} onChangeHandle={onChangeHandle} previewMode={previewMode} />
  );
  drag(ref);
  return !previewMode ? (
    <div ref={ref} style={{ opacity }}>
      <div className="element">
        <Grid className="custom-field-grid">
          <Column lg={14}> {formFieldData}</Column>
          <Column lg={2}>
            <Grid>
              <Column lg={1}>
                <span className="delete-icon">
                  <TrashCan onClick={(e) => onFieldDelete(e, path)} />
                </span>
              </Column>
              <Column lg={1}>
                <span className="drag-icon">
                  <TrashCan onClick={(e) => onFieldDelete(e, path)} />
                </span>
              </Column>
            </Grid>
          </Column>
        </Grid>
      </div>
    </div>
  ) : (
    // <div ref={ref} style={{ opacity }}>
    //   <div className="element">
    //     <span className="delete-icon">
    //       <TrashCan onClick={(e) => onFieldDelete(e, path)} />
    //     </span>
    //     {formFieldData}
    //   </div>
    // </div>
    formFieldData
  );
};

export default FieldRenderer;
