import React from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import InvoiceList from './InvoiceList.js'
import CostCenterList from './CostCenterList.js'
import { FaBuilding, FaFileInvoice } from 'react-icons/fa'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import ReactDOM from 'react-dom'

const initialInvoices = [
  { 
    id: 'fornecedor1', 
    name: 'Fornecedor 1', 
    invoices: [
      { id: 'NF001', number: 'NF001' },
      { id: 'NF002', number: 'NF002' }
    ] 
  },
  { 
    id: 'fornecedor2', 
    name: 'Fornecedor 2', 
    invoices: [
      { id: 'NF003', number: 'NF003' },
      { id: 'NF004', number: 'NF004' }
    ] 
  },
  // Adicione mais fornecedores e notas fiscais conforme necessário
]

const costCenters = ['RPO', 'SPO', 'CPS', 'BRU', 'SJR']

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      invoices: initialInvoices,
      classifiedInvoices: {}
    }
  }

  onDragEnd = (result) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newClassifiedInvoices = { ...this.state.classifiedInvoices }
    const costCenter = destination.droppableId

    // Verifica se é um fornecedor sendo arrastado
    if (draggableId.startsWith('supplier-')) {
      const supplierId = draggableId.replace('supplier-', '')
      const supplier = this.state.invoices.find(s => s.id === supplierId)
      
      if (supplier) {
        // Adiciona todas as notas do fornecedor ao centro de custo
        newClassifiedInvoices[costCenter] = [
          ...(newClassifiedInvoices[costCenter] || []),
          ...supplier.invoices
        ]

        // Remove o fornecedor da lista original
        const newInvoices = this.state.invoices.filter(s => s.id !== supplierId)

        this.setState({
          classifiedInvoices: newClassifiedInvoices,
          invoices: newInvoices
        })
      }
    } else {
      // Lógica existente para notas fiscais individuais
      let foundInvoice = null
      let sourceSupplier = null

      for (const supplier of this.state.invoices) {
        const invoice = supplier.invoices.find(inv => inv.id === draggableId)
        if (invoice) {
          foundInvoice = invoice
          sourceSupplier = supplier
          break
        }
      }

      if (foundInvoice) {
        newClassifiedInvoices[costCenter] = [
          ...(newClassifiedInvoices[costCenter] || []),
          foundInvoice
        ]

        const newInvoices = this.state.invoices.map(supplier => {
          if (supplier.id === sourceSupplier.id) {
            return {
              ...supplier,
              invoices: supplier.invoices.filter(inv => inv.id !== draggableId)
            }
          }
          return supplier
        })

        this.setState({
          classifiedInvoices: newClassifiedInvoices,
          invoices: newInvoices
        })
      }
    }
  }

  render() {
    return (
      <div className="App">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="container">
            <div className="invoice-list">
              <h2 className="display-6 mb-4">
                <FaFileInvoice className="me-2" />
                Notas Fiscais por Fornecedor
              </h2>
              <InvoiceList invoices={this.state.invoices} />
            </div>
            <div className="cost-center-list">
              <h2 className="display-6 mb-4">
                <FaBuilding className="me-2" />
                Centros de Custo
              </h2>
              <CostCenterList 
                costCenters={costCenters} 
                classifiedInvoices={this.state.classifiedInvoices} 
              />
            </div>
          </div>
        </DragDropContext>
      </div>
    )
  }
}

export default App

ReactDOM.render(
    <App/>, document.querySelector('#root')
)