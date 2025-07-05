'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Plus } from 'lucide-react';
import apiClient from '@/app/lib/api';
import { useProjectId } from '@/app/context/ProjectContext';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Simple Modal
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded shadow-lg p-6 min-w-[320px] relative">
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}

interface Stage {
    id: string;
    name: string;
    color?: string;
    sortOrder: number;
}

interface StageSelectProps {
    value: string;
    onChange: (stageId: string) => void;
}

const COLOR_PALETTE = [
    '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#4ade80', '#f97316', '#a3e635', '#f43f5e'
];

export default function StageSelect({ value, onChange }: StageSelectProps) {
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // Add form state
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
    const [newHex, setNewHex] = useState('');

    // Edit form state
    const [editId, setEditId] = useState<string>('');
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState(COLOR_PALETTE[0]);
    const [editHex, setEditHex] = useState('');
    // const [editSortOrder, setEditSortOrder] = useState<number>();

    const [selectOpen, setSelectOpen] = useState(false);
    const sortedStages = [...stages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const handleShowAdd = () => {
        setShowAdd(true);
        setShowEdit(false);
        setSelectOpen(false);
    };
    const handleShowEdit = () => {
        setShowEdit(true);
        setShowAdd(false);
        setSelectOpen(false);
    };
    const projectId = useProjectId();

    const fetchStages = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/task-stage/by-project/${projectId}`);
            setStages(res.data);
        } catch {
            setStages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Add stage
    const handleAddStage = async () => {
        if (!newName.trim()) return;
        try {
            const maxSortOrder = stages.length > 0 ? Math.max(...stages.map(s => s.sortOrder ?? 0)) : 0;
            await apiClient.post('/task-stage', {
                name: newName,
                color: newHex.trim() ? newHex : newColor,
                projectId,
                sortOrder: maxSortOrder + 1,
            });
            toast.success("Add stage successfully!")
            setNewName('');
            setNewColor(COLOR_PALETTE[0]);
            setNewHex('');
            setShowAdd(false);
            fetchStages();
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            if (error.response?.status === 403) {
                toast.error("You don't have permission to add this stage.");
            } else {
                toast.error("Fail to delete comment!");
            }
        }
    };

    // Edit stage
    const handleEditStage = async () => {
        if (!editName.trim() || !editId) return;
        try {
            await apiClient.put(`/task-stage/${editId}`, {
                name: editName,
                color: editHex.trim() ? editHex : editColor,
                projectId,
                sortOrder: 1,
            });
            toast.success("Updated stage successfully!")
            setShowEdit(false);
            setEditId('');
            setEditName('');
            setEditColor(COLOR_PALETTE[0]);
            setEditHex('');
            fetchStages();
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            if (error.response?.status === 403) {
                toast.error("You don't have permission to edit this stage.");
            } else {
                toast.error("Fail to delete comment!");
            }
        }
    };

    // Khi mở form edit, tự động fill thông tin stage đang chọn
    useEffect(() => {
        if (showEdit && value) {
            const stage = stages.find(s => s.id === value);
            if (stage) {
                setEditId(stage.id);
                setEditName(stage.name);
                setEditColor(stage.color || COLOR_PALETTE[0]);
                setEditHex('');
            }
        }
    }, [showEdit, value, stages]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <Select
                value={value}
                onValueChange={onChange}
                open={selectOpen}
                onOpenChange={setSelectOpen}
                required
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose stage..." />
                </SelectTrigger>
                <SelectContent>
                    {loading ? (
                        <div className="px-4 py-6 flex justify-center items-center">
                            <span className="text-gray-400 text-sm">Loading...</span>
                            {/* Hoặc dùng spinner/skeleton tuỳ ý */}
                        </div>
                    ) : (
                        <>
                            {sortedStages.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full border"
                                            style={{ background: stage.color || '#e5e7eb' }}
                                        />
                                        {stage.name}
                                    </span>
                                </SelectItem>
                            ))}
                            <div className="px-2 py-2 border-t mt-2 flex flex-col gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleShowEdit}
                                    disabled={!value}
                                >
                                    <Pencil className="w-4 h-4 mr-1" /> Edit stage
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleShowAdd}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add stage
                                </Button>
                            </div>
                        </>
                    )}
                </SelectContent>
            </Select>

            {/* Add stage modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)}>
                <h3 className="font-semibold mb-3">Add Stage</h3>
                <div className="mb-2">
                    <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Stage name"
                        className="h-8"
                    />
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                    {COLOR_PALETTE.map(color => (
                        <button
                            type="button"
                            key={color}
                            className={`w-6 h-6 rounded-full border-2 ${newColor === color && !newHex ? 'border-blue-500' : 'border-gray-300'}`}
                            style={{ background: color }}
                            onClick={() => { setNewColor(color); setNewHex(''); }}
                        />
                    ))}
                    <Input
                        type="text"
                        value={newHex}
                        onChange={e => setNewHex(e.target.value)}
                        placeholder="#hex"
                        className="w-20 h-8 ml-2"
                        maxLength={7}
                        style={{ fontSize: 13 }}
                    />
                </div>
                <Button type="button" size="sm" onClick={handleAddStage} disabled={!newName.trim()}>
                    Add
                </Button>
                <Button type="button" size="sm" variant="ghost" className="ml-2" onClick={() => setShowAdd(false)}>
                    Cancel
                </Button>
            </Modal>

            {/* Edit stage modal */}
            <Modal open={showEdit} onClose={() => setShowEdit(false)}>
                <h3 className="font-semibold mb-3">Edit Stage</h3>
                <div className="mb-2">
                    <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Stage name"
                        className="h-8"
                    />
                    {/* <Input
                        type="number"
                        value={editSortOrder}
                        onChange={e => setEditSortOrder(Number(e.target.value))}
                        placeholder="Sort order"
                        className="h-8 w-24 mb-2"
                    /> */}
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                    {COLOR_PALETTE.map(color => (
                        <button
                            type="button"
                            key={color}
                            className={`w-6 h-6 rounded-full border-2 ${editColor === color && !editHex ? 'border-blue-500' : 'border-gray-300'}`}
                            style={{ background: color }}
                            onClick={() => { setEditColor(color); setEditHex(''); }}
                        />
                    ))}
                    <Input
                        type="text"
                        value={editHex}
                        onChange={e => setEditHex(e.target.value)}
                        placeholder="#hex"
                        className="w-20 h-8 ml-2"
                        maxLength={7}
                        style={{ fontSize: 13 }}
                    />
                </div>
                <Button type="button" size="sm" onClick={handleEditStage} disabled={!editName.trim()}>
                    Save
                </Button>
                <Button type="button" size="sm" variant="ghost" className="ml-2" onClick={() => setShowEdit(false)}>
                    Cancel
                </Button>
            </Modal>
        </div>
    );
}