
import mongoose from "mongoose"
export const createNoteModel = (notesDB) => {
    if (notesDB.models.Note) {
        return notesDB.models.Note
    }
    const noteSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }, { timestamps: true })
    return notesDB.model("Note", noteSchema)
}


