import express from 'express'
import db from './DB.js'
import cors from 'cors'
const app = express()

app.use(express.json())
app.use(cors())

app.post('/fornecedores', async (req, res) => {
    const transportadora = req.body
    console.log(transportadora)
    const sqlfornecedores = 'SELECT "Id", "Razao_Social", "Nome_Fantasia", "Municipio", "Especialidade", "Filial", "Evento" FROM public."Fornecedor";'
    const resultado = await db.ConsultaDados(sqlfornecedores)
    res.json({resultado})
})

app.post('/despesas', async (req, res) => {
    const transportadora = req.body
    console.log(transportadora)
    const sqlcentros = 'SELECT "Lancamento", "Nota", "Evento", "DescricaoEvento", "Historico", "Usuario", "Emissao", "Vencimento", "Parcela", "ValorParcela", "Filial", "CNPJFornecedor" FROM public."Despesa" limit 200;'
    const resultado = await db.ConsultaDados(sqlcentros)
    res.json({resultado})
})

app.post('/centros', async (req, res) => {
    const transportadora = req.body
    console.log(transportadora)
    const sqlcentros = 'SELECT "Codigo", "Descricao", "Expedicao", "Recepcao", "Despesas", "Custo" FROM public."Centro";'
    const resultado = await db.ConsultaDados(sqlcentros)
    res.json({resultado})
})

app.listen(4000, () => console.log('Servidor rodando na porta 4000'))