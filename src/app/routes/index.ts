import { Router } from 'express'
import apis from './apis'


const app = Router()




app.use("/", (req, res) => {
    res.send("Hello World")
})



app.use('/api', apis)



export default app