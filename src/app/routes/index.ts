import { Router } from 'express'
import apis from './apis'


const app = Router()




app.use('/api', apis)

app.get("/", (req, res) => {
    res.send("Hello World")
})





export default app