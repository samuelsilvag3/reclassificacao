import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const InvoiceList = ({ invoices }) => {
  return (
    <div>
      <Droppable droppableId="suppliers-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="suppliers-container"
          >
            {invoices.map((supplier, supplierIndex) => (
              <Draggable
                key={supplier.id}
                draggableId={`supplier-${supplier.id}`}
                index={supplierIndex}
              >
                {(providedSupplier) => (
                  <div
                    ref={providedSupplier.innerRef}
                    {...providedSupplier.draggableProps}
                    className="supplier-container"
                  >
                    <h3 {...providedSupplier.dragHandleProps}>{supplier.name}</h3>
                    <Droppable droppableId={supplier.id}>
                      {(providedInvoices) => (
                        <div
                          {...providedInvoices.droppableProps}
                          ref={providedInvoices.innerRef}
                          className="invoice-container"
                        >
                          {supplier.invoices.map((invoice, index) => (
                            <Draggable
                              key={invoice.id}
                              draggableId={invoice.id}
                              index={index}
                            >
                              {(providedInvoice) => (
                                <div
                                  ref={providedInvoice.innerRef}
                                  {...providedInvoice.draggableProps}
                                  {...providedInvoice.dragHandleProps}
                                  className="invoice-item"
                                >
                                  Nota Fiscal: {invoice.number}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {providedInvoices.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default InvoiceList;
