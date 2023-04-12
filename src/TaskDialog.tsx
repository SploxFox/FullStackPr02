import { muiDialog, useModal, show as showModal, create as createNiceModal } from "@ebay/nice-modal-react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, Stack, TextField } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle"
import EditNoteIcon from "@mui/icons-material/EditNote"
import BlockIcon from '@mui/icons-material/Block';
import { DatePicker } from "@mui/x-date-pickers";
import { Fragment, useState } from "react";
import { Task } from "./task";
import { useAppContext, useAppContextRef } from "./App";
import dayjs, { Dayjs } from "dayjs";

export type TaskActionType = 'add' | 'update';

export interface TaskDialogProps {
    actionType: TaskActionType,
    onClose: (task: Task) => void,
    task: Task
}

export const TaskDialog = createNiceModal<TaskDialogProps>(props => {
    const modal = useModal();
    const actionVerb = props.actionType == 'add' ? 'Add' : 'Edit';
    const icon = props.actionType == 'add' ? <AddCircleIcon /> : <EditNoteIcon />;

    const [title, setTitle] = useState(props.task.title);
    const [titleError, setTitleError] = useState<string | null>(null);
    
    const [description, setDescription] = useState(props.task.description);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);

    const [_date, _setDate] = useState<number | null>(props.task.date);
    const [dateError, setDateError] = useState<string | null>(null);

    const date = dayjs(_date);
    const setDate = (day: Dayjs | null) => day ? _setDate(day.valueOf()) : _setDate(null);

    const [priority, setPriority] = useState(props.task.priority);
    const [priorityError, setPriorityError] = useState<string | null>(null);

    const ctx = useAppContextRef();
    
    const validate = () => {
        let valid = true;

        const { tasks } = ctx.current;

        if (!title) {
            valid = false;
            setTitleError('Title is required');
        } else if (props.actionType == 'add' && tasks[title]) {
            valid = false;
            setTitleError('Title must be unique');
        } else {
            setTitleError(null);
        }

        if (!description) {
            valid = false;
            setDescriptionError('Description is required');
        } else {
            setDescriptionError(null);
        }

        if (!_date) {
            valid = false;
            setDateError('Date is required');
        } else {
            setDateError(null);
        }

        if (!priority) {
            valid = false;
            setPriorityError('Priority is required');
        } else {
            setPriorityError(null);
        }

        return valid;
    }

    const handleSubmit = () => {
        if (validate()) {
            props.onClose({
                ...props.task,
                id: title,
                title,
                description,
                date: _date!,
                priority,
            });
            modal.hide();
        }
    }

    return <Dialog {...muiDialog(modal)} onClose={(e, reason) => {
        if (reason == 'backdropClick') {
            return;
        }

        modal.hide()
    }} TransitionProps={{ onExited: () => {
        modal.resolveHide();
        modal.remove();
    }}}>
        <DialogTitle sx={{
            display: 'flex',
            bgcolor: 'primary.main',
            color: 'white'
        }}>
            <Stack direction="row" alignItems="center" gap={1}>
                { icon }
                { actionVerb } Task
            </Stack>
        </DialogTitle>
        <FormControl component={Fragment}>
            <DialogContent sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                <div />
                { props.actionType == 'add' ? <TextField
                    label="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    helperText={titleError}
                    error={!!titleError}
                /> : ''}
                <TextField
                    label="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    helperText={descriptionError}
                    error={!!descriptionError}
                />
                <Box>
                    <DatePicker
                        label="Deadline"
                        value={date}
                        onChange={setDate}
                    />
                    <FormHelperText error={!!dateError}>{ dateError }</FormHelperText>
                </Box>
                <Box>
                    <FormLabel>Priority</FormLabel>
                    <RadioGroup
                        row
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                    >
                        <FormControlLabel value="low" label="Low" control={<Radio />} />
                        <FormControlLabel value="med" label="Med" control={<Radio />} />
                        <FormControlLabel value="high" label="High" control={<Radio />} />
                    </RadioGroup>
                    <FormHelperText error={!!priorityError}>{priorityError}</FormHelperText>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" startIcon={icon} onClick={handleSubmit}>{ actionVerb }</Button>
                <Button variant="contained" color="error" startIcon={<BlockIcon />} onClick={() => modal.hide()}>Cancel</Button>
            </DialogActions>
        </FormControl>
    </Dialog>
});

export const showTaskDialog = (action: TaskActionType, task?: Task) => {
    return new Promise<Task>((res, rej) => {
        showModal(TaskDialog, {
            onClose: res,
            actionType: action,
            task: task ?? {
                id: 'new',
                title: '',
                description: '',
                date: Date.now(),
                priority: '',
                isCompleted: false
            }
        });
    });
}