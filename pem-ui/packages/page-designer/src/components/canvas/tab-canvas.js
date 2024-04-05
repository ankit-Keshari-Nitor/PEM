import React from 'react';
import FieldRenderer from './field-renderer/field-renderer';
import { DropZone } from '../../elements';

const TabCanvas = ({ layout, handleDrop, renderRow, componentMapper, selectedField, deleteFormField, path }) => {
  const renderComponent = (component, currentPath, renderRow) => {
    return (
      <div
        onClick={(e) => {
          selectedField(e, component, currentPath);
        }}
      >
        <FieldRenderer
          key={component.id}
          data={component}
          path={currentPath}
          componentMapper={componentMapper}
          renderRow={renderRow}
          handleDrop={handleDrop}
          deleteFormField={deleteFormField}
          selectedField={selectedField}
        />
      </div>
    );
  };

  return (
    <>
      {layout.map((component, index) => {
        const currentPath = `${path}-${index}`;
        return (
          <React.Fragment key={component.id}>
            <DropZone
              data={{
                path: currentPath,
                childrenCount: layout.length
              }}
              onDrop={handleDrop}
              path={currentPath}
            />
            {renderComponent(component, currentPath, renderRow)}
          </React.Fragment>
        );
      })}
      <DropZone
        data={{
          path: `${path}-${layout.length}`,
          childrenCount: layout.length
        }}
        onDrop={handleDrop}
        isLast
      />
    </>
  );
};

export default TabCanvas;