import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const CostCenterList = ({ costCenters, classifiedInvoices }) => {
  return (
    <div className="cost-centers">
      {costCenters.map((costCenter) => (
        <div key={costCenter} className="cost-center">
          <h3>{costCenter}</h3>
          <Droppable droppableId={costCenter}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="cost-center-container"
              >
                {classifiedInvoices[costCenter]?.map((invoice, index) => (
                  <Draggable
                    key={invoice.id}
                    draggableId={invoice.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="invoice-item"
                      >
                        Nota Fiscal: {invoice.number}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </div>
  );
};

export default CostCenterList;
