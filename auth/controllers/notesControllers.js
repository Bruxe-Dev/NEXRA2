export const getNote = (Note) => async (req, res) => {
    try {
        const notes = await Note.findOne({ userId: req.user.userId })
        res.status(200).json(notes)
    } catch (error) {
        console.error("Error in controller", error)
        res.status(500).json({ message: "Internal Server error" })

    }
}
export const createNote = (User) => async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Fill in the required fields please !" })
        }
        const { title, content } = req.body
        if (!title || !content) {
            return res.status(400).json({ error: "Fill in the title and content fields please !" })
        }
        const newNote = new Note({ userId: req.user.userId, title, content })
        const saved_note = await newNote.save()
        res.status(201).json(saved_note)
    }
    catch (error) {
        console.error("Error in loading controller", error);
        return res.status(500).json({ message: "Internal Server error" })
    }

}
export const updateNote = (Note) => async (req, res) => {
    try {
        const { title, content } = req.body
        const updated_note = await Note.findByIdAndUpdate(req.params.id, { title, content }, { new: true })
        if (!updated_note) {
            return res.status(404).json({ message: "Note not found" })
        }
        res.status(200).json(updated_note)
    } catch (error) {
        console.error("Error in controllers", error);
        res.status(500).json({ message: "Internal server error !" })
    }
}
export const deleteNote = (Note) => async (req, res) => {
    try {
        const to_be_deleted = await Note.findByIdAndDelete(req.params.id)
        if (!to_be_deleted) {
            return res.status(404).json({ message: "Note not found !" })
        }
        res.status(200).json({ message: "Note deleted successfully" })
    } catch (error) {
        console.error("Error in controllers", error);
        res.status(500).json({ message: "Internal server error !" })
    }
}
