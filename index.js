const { app,server,io } = require("./src/app");
const { port,colors,nomes,colorsForUser } = require("./config.json");
// Configurando o armazenamento dos arquivos enviados
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'src/public/img/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage });

let infoServer = {
    conected:0,
    peoples:[],
    mensagens:[],
    pickes:[],
    conparation:[],
}

  
app.get("/",(req,res)=>{

    const isMobile = req.headers['user-agent'].includes("Mobile");
    
    let palet = createPaletColor(colors.dark);
  
    res.render("home",
    {
        title:"the best cotton picker",
        isMobile,
        htmlStyles:[
            {css:palet}
        ],
        scripts:[
        ]
    })
})

io.on('connection', socket=>{
    //devinir informação do usuario
    socket.me = {
        id:socket.id,
        nome:nomes[Math.round(Math.random() * 100)%nomes.length]+socket.id.substring(0,4),
        color:colorsForUser[Math.round(Math.random() * 100)%colorsForUser.length],
    }
    
    //nova pessoa conectada
    
    infoServer.peoples.push(socket.me);
    infoServer.conected = infoServer.peoples.length;
    console.log("nova pessoa conectada - "+ infoServer.conected+" pessoa conectadas")
    io.emit('dataServer', {infoServer,me:socket.me});
    console.log(infoServer);
 

    //escrever mensagem
    socket.on('writeMensagem',data =>{
        infoServer.mensagens.push(data);
        console.log("nova mensagem - ",data);
        io.emit('novaMensagem', data);
    });


    //pessoa desconecta 
    socket.on('disconnect', () =>{
        for (let i = 0; i < infoServer.peoples.length; i++) {
            if (infoServer.peoples[i].nome === socket.me.nome) {
                infoServer.peoples.splice(i, 1);
                infoServer.conected = infoServer.peoples.length;
                io.emit('dataServer', {infoServer,me:socket.me});
                console.log("pessoa desconectada - "+ infoServer.conected+" pessoa conectadas")
            }
        }
        // infoServer.peoples.splice(getForId(socket.id,infoServer).index);
    })
})

app.get("/add",(req,res)=>{
    let palet = createPaletColor(colors.dark);

    res.render("addPicker",{
        title:"addpicker",
        htmlStyles:[
            {css:palet}
        ],
    });
})
app.post("/add",upload.single('file'),(req,res)=>{
    const link = req.body.link;
    const file = req.file;
    if(link!='')
    {
        console.log("imagem com o link");
        infoServer.pickes.push({
            src:link
        })
    }else{
        console.log("imagem com o upload");
        const filePath = path.join(__dirname, 'src/public/img/uploads', file.filename);
        infoServer.pickes.push({
            src:"/img/"+file.filename,

        })
    }
    res.status(200).json({ message: 'Arquivo e link recebidos com sucesso!' });
    io.emit("newPicker",infoServer.pickes.length);

})

server.listen(port,console.log("aberto  em https://localhost:"+process.env.PORT));

function createPaletColor(teme){
    let htmlReturn = `*{\n`;
    for(color in teme)
    {
        htmlReturn+=`--${color}:${teme[color]};\n`;
    }
    htmlReturn+=`}`;
    return(htmlReturn);
}
