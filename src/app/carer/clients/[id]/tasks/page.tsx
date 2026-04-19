'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  task_type: string
  priority: string
  due_date?: string
  is_completed: boolean
  completed_at?: string
}

const TASK_TYPE_COLORS: Record<string, string> = {
  medication: 'bg-purple-100 text-purple-800',
  activity: 'bg-blue-100 text-blue-800',
  mobility: 'bg-green-100 text-green-800',
  meal: 'bg-orange-100 text-orange-800',
  hygiene: 'bg-teal-100 text-teal-800',
  general: 'bg-gray-100 text-gray-800',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-600',
  normal: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

export default function ClientTasksPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [params.id])

  async function loadTasks() {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', params.id)
        .order('due_date', { ascending: true })

      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTask(taskId: string, isCompleted: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !isCompleted })
        .eq('id', taskId)

      if (!error) {
        setTasks(prev =>
          prev.map(t =>
            t.id === taskId ? { ...t, is_completed: !isCompleted } : t
          )
        )
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  const incompleteTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600 mt-1">
          {incompleteTasks.length} remaining • {completedTasks.length} completed
        </p>
      </div>

      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">To Do</h2>
          <div className="space-y-3">
            {incompleteTasks.map(task => (
              <Card key={task.id} className="p-4">
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id, task.is_completed)}
                    className="w-5 h-5 rounded border-gray-300 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="default"
                        className={`text-xs capitalize ${TASK_TYPE_COLORS[task.task_type]}`}
                      >
                        {task.task_type}
                      </Badge>
                      {task.priority !== 'normal' && (
                        <span className={`text-xs font-medium uppercase ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs text-gray-500">
                          Due: {format(new Date(task.due_date), 'dd MMM')}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Completed</h2>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <Card key={task.id} className="p-4 bg-gray-50">
                <label className="flex gap-3 items-start cursor-pointer opacity-60">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id, task.is_completed)}
                    className="w-5 h-5 rounded border-gray-300 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-through">
                      {task.title}
                    </h3>
                    {task.completed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed {format(new Date(task.completed_at), 'dd MMM HH:mm')}
                      </p>
                    )}
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No tasks assigned</p>
        </Card>
      )}
    </div>
  )
}
