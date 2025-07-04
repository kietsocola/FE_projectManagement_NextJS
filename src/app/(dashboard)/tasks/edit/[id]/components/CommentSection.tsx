'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Reply, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import apiClient from '@/app/lib/api';
import { toast } from "sonner";
interface TaskCommentResponseDTO {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isPinned: boolean;
  parentTaskCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  properties: Record<string, unknown>;
  childComments: TaskCommentResponseDTO[];
  hasMoreChildren: boolean;
  childCount: number;
}

interface PaginatedComments {
  page: number;
  limit: number;
  totalPages: number;
  totalElements: number;
  sortBy: string | null;
  sortDirection: string | null;
  search: string | null;
  searchFor: string | null;
  data: TaskCommentResponseDTO[];
}

interface CommentSectionProps {
  taskId: string;
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const [comments, setComments] = useState<TaskCommentResponseDTO[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 5,
    totalPages: 1,
    totalElements: 0,
    loading: false,
  });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyPages, setReplyPages] = useState<{ [commentId: string]: number }>({});

  // Fetch initial comments
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async (page: number = 0) => {
    try {
      setPagination(prev => ({ ...prev, loading: true }));
      const response = await apiClient.get<{ success: boolean; data: PaginatedComments }>(
        `/task-comment/by-task/${taskId}?page=${page}&size=${pagination.limit}`
      );

      if (page === 0) {
        setComments(response.data.data.data);
      } else {
        setComments(prev => [...prev, ...response.data.data.data]);
      }

      setPagination({
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
        totalElements: response.data.data.totalElements,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to fetch comments', err);
      setPagination(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchReplies = async (commentId: string, page: number = 0) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: TaskCommentResponseDTO[]; hasMoreChildren: boolean; }>(
        `/task-comment/${commentId}/children?page=${page}&size=2`
      );

      setComments(prev => {
        const updateCommentWithReplies = (comments: TaskCommentResponseDTO[]): TaskCommentResponseDTO[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                childComments: page === 0
                  ? response.data.data
                  : [...comment.childComments, ...response.data.data],
                // hasMoreChildren: response.data.hasMoreChildren,
              };
            }

            if (comment.childComments && comment.childComments.length > 0) {
              return {
                ...comment,
                childComments: updateCommentWithReplies(comment.childComments),
              };
            }

            return comment;
          });
        };

        return updateCommentWithReplies(prev);
      });
    } catch (err) {
      console.error('Failed to fetch replies', err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await apiClient.post<{ success: boolean; data: TaskCommentResponseDTO }>(
        `/task-comment`,
        {
          taskId: taskId,
          content: newComment,
          parentTaskCommentId: replyingTo,
        }
      );

      if (replyingTo) {
        // Add reply to the parent comment
        setComments(prev => {
          const addReplyToComment = (comments: TaskCommentResponseDTO[]): TaskCommentResponseDTO[] => {
            return comments.map(comment => {
              if (comment.id === replyingTo) {
                return {
                  ...comment,
                  childComments: [response.data.data, ...(comment.childComments ?? [])],
                  childCount: comment.childCount + 1,
                };
              }

              if (comment.childComments && comment.childComments.length > 0) {
                return {
                  ...comment,
                  childComments: addReplyToComment(comment.childComments),
                };
              }

              return comment;
            });
          };

          return addReplyToComment(prev);
        });
      } else {
        // Add new top-level comment
        setComments(prev => [response.data.data, ...prev]);
        setPagination(prev => ({
          ...prev,
          totalElements: prev.totalElements + 1,
        }));
      }

      setNewComment('');
      setReplyingTo(null);
      toast.success("Add comment successfully!", {
          // description: "Your changes have been applied.",
        })
    } catch (err) {
      console.error('Failed to add comment', err);
      toast.success("Add comment fail!", {
          // description: "Your changes have been applied.",
        })
    }
  };

  const updateComment = async (commentId: string) => {
    try {
      const response = await apiClient.patch<{ success: boolean; data: TaskCommentResponseDTO }>(
        `/tasks/${taskId}/comments/${commentId}`,
        {
          content: editContent,
        }
      );

      setComments(prev => {
        const updateCommentInTree = (comments: TaskCommentResponseDTO[]): TaskCommentResponseDTO[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return response.data.data;
            }

            if (comment.childComments && comment.childComments.length > 0) {
              return {
                ...comment,
                childComments: updateCommentInTree(comment.childComments),
              };
            }

            return comment;
          });
        };

        return updateCommentInTree(prev);
      });

      setEditingComment(null);
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);

      setComments(prev => {
        const removeCommentFromTree = (comments: TaskCommentResponseDTO[]): TaskCommentResponseDTO[] => {
          return comments.reduce((acc, comment) => {
            if (comment.id === commentId) {
              return acc; // Skip this comment
            }

            if (comment.childComments && comment.childComments.length > 0) {
              return [
                ...acc,
                {
                  ...comment,
                  childComments: removeCommentFromTree(comment.childComments),
                },
              ];
            }

            return [...acc, comment];
          }, [] as TaskCommentResponseDTO[]);
        };

        return removeCommentFromTree(prev);
      });

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - 1,
      }));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const loadMoreComments = () => {
    fetchComments(pagination.page + 1);
  };

  const loadMoreReplies = (commentId: string) => {
    const nextPage = (replyPages[commentId] || 0) + 1;
    fetchReplies(commentId, nextPage);
    setReplyPages(prev => ({ ...prev, [commentId]: nextPage }));
  };

  const renderComment = (comment: TaskCommentResponseDTO, depth = 0) => {
    const canReply = depth < 1; // Limit reply depth to 2 levels (0 and 1)

    return (
      <div key={comment.id} className="space-y-3">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.createdBy)}&background=random`}
              alt={comment.createdBy}
            />
            {/* <AvatarFallback>{comment.createdBy.charAt(0)}</AvatarFallback> */}
            <AvatarFallback>K</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className={`bg-gray-50 p-3 rounded-lg ${comment.isPinned ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{comment.createdBy || 'By undefined'}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    {comment.isPinned && (
                      <span className="ml-2 text-blue-500">Pinned</span>
                    )}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type='button' className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canReply && (
                      <DropdownMenuItem onClick={() => startReply(comment.id)}>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                    )}
                    {/* <DropdownMenuItem onClick={() => startEdit(comment)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {editingComment === comment.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type='button'
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingComment(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='button'
                      size="sm"
                      onClick={() => updateComment(comment.id)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2">{comment.content}</p>
              )}
            </div>

            {canReply && (
              <button
                type='button'
                className="text-xs text-blue-500 mt-1 ml-1 hover:underline"
                onClick={() => startReply(comment.id)}
              >
                Reply
              </button>
            )}

            {replyingTo === comment.id && (
              <div className="mt-3 ml-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Reply to ${comment.createdBy}...`}
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    size="sm"
                    onClick={addComment}
                    disabled={!newComment.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}

            {comment.childComments && comment.childComments.length > 0 && (
              <div className="mt-3 ml-6 space-y-3">
                {comment.childComments.map(child => renderComment(child, depth + 1))}
              </div>
            )}

            {comment.hasMoreChildren && ((comment.childCount - comment.childComments.length)!==0) && (
              <div className="mt-2 ml-6">
                <Button
                  type='button'
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 cursor-pointer"
                  onClick={() => loadMoreReplies(comment.id)}
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View more replies ({comment.childCount - comment.childComments.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  };

  const startEdit = (comment: TaskCommentResponseDTO) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>
      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}

        {pagination.page < pagination.totalPages - 1 && (
          <div className="flex justify-center">
            <Button
              className='cursor-pointer'
              type='button'
              variant="outline"
              onClick={loadMoreComments}
              disabled={pagination.loading}
            >
              {pagination.loading ? 'Loading...' : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Load more comments ({pagination.totalElements - comments.length} remaining)
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
              className='cursor-pointer'
                type="button"
                onClick={addComment}
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}