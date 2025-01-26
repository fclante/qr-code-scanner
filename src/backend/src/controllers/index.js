class CRUDController {
    constructor(model) {
        this.model = model;
    }

    async create(req, res) {
        try {
            const data = req.body;
            const result = await this.model.create(data);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async read(req, res) {
        try {
            const id = req.params.id;
            const result = await this.model.read(id);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await this.model.update(id, data);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            const result = await this.model.delete(id);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default CRUDController;