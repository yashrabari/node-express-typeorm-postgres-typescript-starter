//importing libs
import dotenv from 'dotenv'
import http from 'http'
import "reflect-metadata"

//configuring env
dotenv.config()

//importing modules
import app from './app/app'
import { AppDataSource } from './config'


//declaring variables
const port = process.env.PORT || 5000



//creating http server using http module
try {
    AppDataSource.initialize().then(() => {

        http.createServer({}, app).listen(port, () => {
            console.log("Server is listening on PORT " + port)
        })
    }).catch(err => {
        console.log(err)
    })

} catch (err) {
    console.log(err)
}

