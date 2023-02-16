const express = require('express')
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');



//Router 1: get all the notes using: GET "/api/Notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Some error occured!")
    }

})
//Router 2: Add a new note using: POST "/api/Notes/addnote". Login required
router.post('/addnote',fetchUser, [
    body('title', "Enter a valid name").isLength({ min: 3 }),
    body('description', "Description must be at least 5 charecters").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //If there are error, return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const saveNotes = await note.save()
        res.json(saveNotes)


    } catch (error) {
        console.error(error.message);
        res.status(500).json("Some error occured!")
    }
})
//Router 3: Update an existing note using: PUT "/api/Notes/updatenote". Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
 const {title,description,tag} = req.body
 // Create newNote Object
 try{

     const  newNote = {}
     if(title){
         newNote.title = title
     }
     if(description){
         newNote.description = description
     }
     if(tag){
         newNote.tag = tag
     }
     //Find note to be updated and update
     let note  = await Note.findById(req.params.id);
     if(!note) return res.status(404),send("Not found");
    
    //Checks if the entered id is same as what existes 
     if(note.user.toString() !== req.user.id) return res.status(401).send("Not Allowed");
    
     note  = await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new: true})
    
     return res.json({note})
 }
 catch(err){
    console.log(err)
    res.status(500).json({error:"some error occured!"})
 }


})
//Router 4: Delete an existing note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
 
    try{
   
        
        //Find note to be deleted and delete
        let note  = await Note.findById(req.params.id);
        if(!note) return res.status(404),send("Not found");
       
       //Checks if the user owns this id     
        if(note.user.toString() !== req.user.id) return res.status(401).send("Not Allowed");
       
        note  = await Note.findByIdAndDelete(req.params.id)
       
        return res.json({"Success":"The note has been deleted",note: note})
    }
    catch(err){
       console.log(err)
       res.status(500).json({error:"some error occured!"})
    }
   
   
   })


module.exports = router