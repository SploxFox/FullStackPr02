import { createContext, useContext, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppBar, Button, Checkbox, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Toolbar, Typography, stepButtonClasses } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditNoteIcon from "@mui/icons-material/EditNote"
import CancelIcon from '@mui/icons-material/Cancel';
import MenuIcon from '@mui/icons-material/Menu';
import { Provider as NiceModalProvider } from '@ebay/nice-modal-react'
import { TaskActionType, showTaskDialog } from './TaskDialog'
import { Task } from './task'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { useForceUpdate } from './util'
import dayjs from 'dayjs'

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
export const useAppContextRef = () => {
    const ctx = useAppContext();
    const ref = useRef(ctx);
    ref.current = ctx;
    return ref;
}

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

    return <AppContext.Provider value={{ setTask, tasks }}> <NiceModalProvider>
        <AppBar>
            <Toolbar>
                <Stack direction="row" alignItems="center" justifyContent="center" sx={{  flexGrow: 1 }}>
                    <MenuIcon />
                    <Typography sx={{ textTransform: 'uppercase' }}>
                        Fullstack
                    </Typography>
                </Stack>
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
                <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Deadline</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Is Complete</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                { Object.values(tasks).map(task => {
                    return <TableRow key={task.id}>
                        <TableCell>{ task.title }</TableCell>
                        <TableCell>{ task.description }</TableCell>
                        <TableCell>{ dayjs(task.date).format('MM/DD/YY') }</TableCell>
                        <TableCell>{ task.priority }</TableCell>
                        <TableCell>
                            <Checkbox checked={task.isCompleted} onChange={(e, checked) => setTask(task.id, {
                                ...task,
                                isCompleted: checked
                            })}/>
                        </TableCell>
                        <TableCell>
                            <Stack gap={1}>
                                { !task.isCompleted ? <Button startIcon={<EditNoteIcon />} variant="contained" onClick={editTaskFn('update', task)}>Update</Button> : '' }
                                <Button color='error' startIcon={<CancelIcon />} variant="contained" onClick={() => setTask(task.id, null)}>Delete</Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                }) }
            </TableBody>
        </Table>
        <SnackbarProvider style={{ fontFamily: 'sans-serif' }} anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
        }}/>
    </NiceModalProvider></AppContext.Provider>
}

export default App
