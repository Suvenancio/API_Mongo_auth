const express = require('express');
const router = express.Router();
const authMddleware = require('../middlewares/auth');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');

router.use(authMddleware);

router.get('/', async (req,res) => {
    try{
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects })
    }catch(e){
        res.status(400).send({error: 'Error loading projects'})
    }
});

router.get('/:projectId', async (req,res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate('user');

        return res.send({ project })
    }catch(e){
        res.status(400).send({error: 'Error loading project'})
    }
});

router.post('/', async (req,res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.create({title, description, user: req.userId });
        
        await Promise.all( tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id});

            await projectTask.save();
            project.tasks.push(projectTask);
        }));
        await project.save();

        return res.send(project)

    } catch(e){
        res.status(400).send({error: 'Error creating new project'})
    }
});

router.put('/:projectId', async (req,res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate( req.params.projectId, {
            title, 
            description }, 
            { new: true });

        project.tasks = [];
        await Task.remove({ project: project._id}); 
        
        await Promise.all( tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id});

            await projectTask.save();
            project.tasks.push(projectTask);
        }));
        await project.save();

        return res.send(project)

    } catch(e){
        console.log(e)
        res.status(400).send({error: 'Error edit project'})
    }
});

router.delete('/:projectId', async (req,res) => {
    try{
        await Project.findByIdAndDelete(req.params.projectId);

        return res.send()
    }catch(e){
        res.status(400).send({error: 'Error deleting project'})
    }
});
module.exports = app => app.use('/projects', router);