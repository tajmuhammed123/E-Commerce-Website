const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/members");

const path=require('path')
const express=require('express')

const app = express()

const userRouter = require('./routes/userRouter')
app.use('/',userRouter)

const adminRouter=require('./routes/adminRouter')
app.use('/admin',adminRouter)

app.use(express.static(path.join(__dirname,"/public")))

app.listen(3000, ()=>{
    console.log('server running');
})


{/* <div class="image-gallery">
  <% for (let i = 0; i < images.length; i++) { %>
    <img src="<%= images[i] %>" alt="Image <%= i + 1 %>">
  <% } %>
</div> */}