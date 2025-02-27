import pg from 'pg'
const {Pool} = pg

async function connect() {
    // if (global.connection){
    //     return global.connection.connect()
    // }
    const pool = new Pool({
        host: '10.0.0.100',
        port: 5432,
        user: 'postgres',
        password: 'rs97150979',
        database: 'SSW2',
        //idleTimeoutMillis: 10000,
        maxUses: 7500
    })
    //retorna pool de conexões
    const client = await pool.connect();
    client.release();
    global.connection = pool;
    return pool.connect();
}

async function InsereDados(Fatura){
    const client = await connect()
    const sql = 'INSERT INTO public."Faturas"("Fatura", "Nota", "Emissao", "Vencimento", "Lancado", "Fornecedor") VALUES ($1,$2,$3,$4,$5,$6);'
    const values = [Fatura.NumFat, Fatura.NumNF, Fatura.Emissao, Fatura.Vcto, false, Fatura.Fornecedor]
    return await client.query(sql, values)
}

async function ConsultaDados(consulta) {
    const client = await connect()
    const res = await client.query(consulta)
    return res.rows
}

async function AtualizaDados(Nota){
    const client = await connect()
    const sql = `
        UPDATE public."Faturas"
        SET "Lancado"=true
        WHERE "Nota"=$1
    `
    const values = [Nota]
    return await client.query(sql, values)
}
 
export default { InsereDados, ConsultaDados, AtualizaDados }