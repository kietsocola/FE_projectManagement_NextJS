'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from './components/TaskForm';
import AssigneeSelect from '../edit/[id]/components/AssigneeSelect';
import LabelSelect from '../edit/[id]/components/LabelSelect';
import { Button } from '@/components/ui/button';

export default function TaskCreatePage() {
    const [taskId, setTaskId] = useState<string | null>(null);
    const [created, setCreated] = useState(false);
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
                <Button variant="outline" onClick={() => router.push('/tasks')}>
                    Back to List
                </Button>
            </div>
            {!taskId ? (
                <TaskForm
                    onCreated={(id) => {
                        setTaskId(id);
                        setCreated(true);
                    }}
                />
            ) : (
                <>
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <AssigneeSelect taskId={taskId} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <LabelSelect taskId={taskId} />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type='button'
                            className="btn btn-primary"
                            onClick={() => router.push('/tasks')}
                        >
                            Finish
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}