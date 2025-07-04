'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/app/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useProjectId } from '@/app/context/ProjectContext';


export default function TaskForm({ onCreated, setCreating }: { onCreated: (id: string) => void, setCreating: (v: boolean) => void  }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stageId, setStageId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
    const [priorities, setPriorities] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const projectId = useProjectId();

    useEffect(() => {
        apiClient.get('/task-stage/by-project/9cdb426d-4087-4a98-afff-843050855a89').then(res => setStages(res.data));
        apiClient.get('/priority').then(res => setPriorities(res.data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setCreating(true);
        try {
            const res = await apiClient.post('/task', {
                title,
                description,
                taskStageId: stageId,
                taskPriorityId: priorityId,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                isPublic,
                projectId,
            });
            toast.success('Task created!');
            onCreated(res.data.data.id);
        } catch (err) {
            toast.error('Failed to create task: '+ err);
            setCreating(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage<span className="text-red-500">*</span></label>
                    <Select value={stageId} onValueChange={setStageId} required>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose stage..." />
                        </SelectTrigger>
                        <SelectContent>
                            {stages.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <Select value={priorityId} onValueChange={setPriorityId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose priority..." />
                        </SelectTrigger>
                        <SelectContent>
                            {priorities.map(priority => (
                                <SelectItem key={priority.id} value={priority.id}>{priority.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <Input
                        type="datetime-local"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <Switch
                        className='cursor-pointer'
                        id="public-toggle"
                        checked={isPublic}
                        onCheckedChange={(value) => setIsPublic(value)}
                    />
                    <label htmlFor="public-toggle" className="text-sm font-medium text-gray-700">
                        {isPublic ? 'Public' : 'Private'}
                    </label>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end">
                <Button className='cursor-pointer' type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
}