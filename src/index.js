import React from 'react'
import axios from 'axios'
import { DragDropContext } from 'react-beautiful-dnd'
import InvoiceList from './InvoiceList.js'
import CostCenterList from './CostCenterList.js'
import { FaBuilding, FaFileInvoice, FaUsers } from 'react-icons/fa'
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
      invoices: [],
      classifiedInvoices: {},
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = async () => {
    try {
      const payload = { transportadora: "NSLOG" }
      
      console.log('Iniciando requisições...')
      
      // Buscar fornecedores e notas em paralelo
      const [fornecedoresResponse, despesasResponse] = await Promise.all([
        axios.post('http://127.0.0.1:4000/fornecedores', payload),
        axios.post('http://127.0.0.1:4000/despesas', payload)
      ])

      console.log('Resposta fornecedores:', fornecedoresResponse)
      console.log('Resposta despesas:', despesasResponse)

      // Verificar se as respostas contêm a propriedade 'resultado'
      const fornecedores = fornecedoresResponse.data.resultado || []
      const despesas = despesasResponse.data.resultado || []

      // Organizar as notas por fornecedor
      const invoicesBySupplier = fornecedores.map(fornecedor => {
        const fornecedorNotas = despesas.filter(
          nota => nota.CNPJFornecedor === fornecedor.Id
        )

        return {
          id: fornecedor.Id,
          name: fornecedor.Nome_Fantasia || fornecedor.Razao_Social,
          invoices: fornecedorNotas.map(nota => ({
            id: nota.Nota.trim(),
            number: nota.Nota.trim(),
            valor: nota.ValorParcela,
            emissao: nota.Emissao,
            vencimento: nota.Vencimento,
            evento: nota.DescricaoEvento
          }))
        }
      }).filter(fornecedor => fornecedor.invoices.length > 0)

      console.log('Dados processados:', invoicesBySupplier)

      this.setState({
        invoices: invoicesBySupplier,
        loading: false
      })
    } catch (error) {
      console.error('Erro detalhado:', error)
      let mensagemErro = 'Erro ao carregar dados. Por favor, tente novamente.'
      
      if (error.response) {
        console.error('Dados do erro:', error.response.data)
        mensagemErro = `Erro do servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      } else if (error.request) {
        console.error('Erro de conexão:', error.request)
        mensagemErro = 'Erro de conexão com o servidor. Verifique se o servidor está rodando.'
      } else {
        console.error('Erro:', error.message)
        mensagemErro = `Erro: ${error.message}`
      }

      this.setState({
        error: mensagemErro,
        loading: false
      })
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
    if (this.state.loading) {
      return (
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      )
    }

    if (this.state.error) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            {this.state.error}
          </div>
        </div>
      )
    }

    // Cálculos para os cards informativos
    const totalInvoices = this.state.invoices.reduce(
      (total, supplier) => total + supplier.invoices.length,
      0
    )
    
    const totalSuppliers = this.state.invoices.length
    
    const processedInvoices = Object.values(this.state.classifiedInvoices)
      .flat()
      .length

    return (
      <div className="App">
        <header className="bg-primary bg-gradient shadow-sm mb-4">
          <div className="container py-3">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="logo-placeholder bg-light rounded" style={{ width: '150px', height: '50px' }}>
                  {/* Área reservada para logo */}
                </div>
              </div>
              <div className="col">
                <h1 className="text-white mb-0 ms-3">Sistema de Classificação de Notas Fiscais</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Nova seção de cards informativos */}
        <div className="container mb-4">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    <FaFileInvoice className="me-2" />
                    Total de Notas
                  </h5>
                  <p className="card-text display-6">{totalInvoices}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    <FaBuilding className="me-2" />
                    Notas Processadas
                  </h5>
                  <p className="card-text display-6">{processedInvoices}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    <i className="fas fa-users me-2"></i>
                    Total de Fornecedores
                  </h5>
                  <p className="card-text display-6">{totalSuppliers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="container">
            <div className="invoice-list">
              <h2 className="display-6 mb-4 text-primary">
                <FaFileInvoice className="me-2" />
                Notas Fiscais Disponiveis
              </h2>
              <InvoiceList invoices={this.state.invoices} />
            </div>
            <div className="cost-center-list">
              <h2 className="display-6 mb-4 text-primary">
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