const exp = require('express') , mongoose = require('mongoose'); 
const app = exp() , url = 'mongodb://localhost:27017/mongoose' , port = '3000'; 

app.use(exp.json()); 

const Schema = mongoose.Schema; 

const words = new Schema({
    engWord: {
        type: String, 
        require: true, 
    }, 
    mntWord: {
        type: String, 
        require: true, 
    }, 
}); 

const collections = mongoose.model('dictionaries' , words); 

mongoose.connect(url).then(() => {
    console.log('Connected successfully.'); 

    app.get('/words' , (req  , res) => {
       collections.find({}).exec((err , dbs) => {
            if ( !err ) return res.send(dbs); 
            res.send('Error Occured.'); 
        }); 
    }); 
    
    app.post('/add-word' , (req , res) => {
        if (req.body) {
                collections.insertMany(req.body).then(() => {
                    console.log(req.body); 
                    res.send('Added words!'); 
                }).catch((err) => {
                    console.log(err); 
                });   
            }
        else {
            res.send('Data is empty or err occured.'); 
        }  
    });

    app.put('/edit-word' , (req , res) => {
            collections.find({engWord: req.body.engWord} , ((err , docs) => {
                if (!docs.length) return res.send('Word not found.');  
                collections.find({engWord: req.body.engWord}).then(() => collections.updateOne({mntWord: req.body.mntWord})).then(() => console.log('Word has been updated successfully.') , res.send('Word has been updated.')).catch(err => console.log(err));
            }));   
      }); 

    app.delete('/delete-word', (req , res) => {
        if ( req.body.length == 1 && !Array(req.body)) {
            collections.find({engWord: req.body.engWord} , (err , docs) => {
                if ( !docs.length ) return res.send('Word not found.'); 
                return collections.findOneAndDelete({engWord: req.body.engWord}).then(() => console.log(`Deleted: ${req.body.engWord}.`) , res.send('Word has been deleted.')).catch(err => console.log(err)); 
            }); 
        }
        else {
           collections.find({$or: [...req.body]} , (err , docs) => {
              if (!docs.length) return res.send('Words not found.'); 
              return collections.deleteMany({$or: [...req.body]}, () => console.log('Deleted.') , res.send('Deleted words.')); 
           })
        }
    });

    app.get('/search-word/:word' , (req , res) => {
        let mglTrns = "baihgui" , engWrd = "Not found"; 
            collections.find({engWord: req.params['word']} , (err , docs) => {
                if ( err ) return res.send('Error occured'); 
                docs.map((x) => {
                  mglTrns = x.mntWord;  
                  engWrd = x.engWord; 
                });  
                
            }).clone().then(() => res.send(`English word: ${engWrd} , To mgl: ${mglTrns}`)); 
    }); 
    
    
    app.listen(port , () => {
        console.log(`running on: http://localhost:${port}`); 
    });

}).catch((err) => {
    console.log(err); 
}); 
