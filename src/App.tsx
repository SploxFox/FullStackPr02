import { createContext, useContext, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppBar, Button, Checkbox, Tab, Table, TableCell, TableHead, TableRow, Toolbar, Typography, stepButtonClasses } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { TaskActionType, showTaskDialog } from './TaskDialog'
import { Task } from './task'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { useForceUpdate } from './util'

type Tasks = { [index: string]: Task };

export interface AppContext {
    setTask: (key: string, task: Task) => void,
    tasks: Tasks
}

const AppContext = createContext<AppContext>({
    setTask: () => {},
    tasks: {}
});

export const useAppContext = () => useContext(AppContext);

function App() {
    const forceUpdate = useForceUpdate();
    const tasksRef = useRef<Tasks>({});
    const tasks = tasksRef.current;
    const setTask = (key: string, task: Task | null) => {
        const isNew = !tasksRef.current[key];
        if (task) {
            tasksRef.current[key] = task;
        } else {
            delete tasksRef.current[key];
        }

        enqueueSnackbar({
            message: `Task ${!!task ? (isNew ? 'created' : 'updated') : 'deleted'}`,
            variant: 'success'
        });

        forceUpdate();
    }

    const editTaskFn = (action: TaskActionType, task?: Task) =>
            () => showTaskDialog(action, task).then(task => setTask(task.id, task))

    return <AppContext.Provider value={{ setTask, tasks }}>
        <AppBar>
            <Toolbar>
                <Typography sx={{ flexGrow: 1 }}>
                    Fullstack
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={editTaskFn('add')}
                >
                    Add
                </Button>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Table>
            <TableHead>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Is Complete</TableCell>
                <TableCell>Action</TableCell>
            </TableHead>
            { Object.values(tasks).map(task => {
                return <TableRow key={task.id}>
                    <TableCell>{ task.title }</TableCell>
                    <TableCell>{ task.description }</TableCell>
                    <TableCell>{ new Date(task.date).toLocaleDateString() }</TableCell>
                    <TableCell>{ task.priority }</TableCell>
                    <TableCell>
                        <Checkbox checked={task.isCompleted} onChange={(e, checked) => setTask(task.id, {
                            ...task,
                            isCompleted: checked
                        })}/>
                    </TableCell>
                    <TableCell>
                        { !task.isCompleted ? <Button onClick={editTaskFn('update', task)}>Update</Button> : '' }
                        <Button onClick={() => setTask(task.id, null)}>Delete</Button>
                    </TableCell>
                </TableRow>
            }) }
        </Table>
        <SnackbarProvider style={{ fontFamily: 'sans-serif' }} anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
        }}/>
    </AppContext.Provider>
}

export default App
