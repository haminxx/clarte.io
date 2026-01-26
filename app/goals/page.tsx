"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  Download, 
  FileText, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Circle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ConversationMessage } from "@/hooks/use-vapi"

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  status: "pending" | "in-progress" | "completed"
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  completed: boolean
  dueDate: string
}

// Sample goals generated from conversation (would be from AI in production)
const sampleGoals: Goal[] = [
  {
    id: "1",
    title: "Launch Mobile App",
    description: "Design, develop, and launch a mobile application to increase user reach and engagement.",
    deadline: "2026-04-30",
    status: "in-progress",
    milestones: [
      { id: "1a", title: "Complete user research and requirements", completed: true, dueDate: "2026-02-15" },
      { id: "1b", title: "Design UI/UX mockups", completed: true, dueDate: "2026-02-28" },
      { id: "1c", title: "Develop MVP features", completed: false, dueDate: "2026-03-30" },
      { id: "1d", title: "Beta testing and QA", completed: false, dueDate: "2026-04-15" },
      { id: "1e", title: "App store submission", completed: false, dueDate: "2026-04-25" },
    ]
  },
  {
    id: "2",
    title: "Increase User Engagement by 50%",
    description: "Implement engagement features including push notifications, gamification, and social features.",
    deadline: "2026-06-30",
    status: "pending",
    milestones: [
      { id: "2a", title: "Implement push notification system", completed: false, dueDate: "2026-03-15" },
      { id: "2b", title: "Add gamification elements (streaks, rewards)", completed: false, dueDate: "2026-04-30" },
      { id: "2c", title: "Build social sharing features", completed: false, dueDate: "2026-05-30" },
      { id: "2d", title: "Launch in-app messaging", completed: false, dueDate: "2026-06-15" },
    ]
  },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [conversationData, setConversationData] = useState<ConversationMessage[]>([])

  // Load conversation from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("clarte_conversation")
    if (stored) {
      try {
        setConversationData(JSON.parse(stored))
      } catch {
        console.log("[v0] No stored conversation found")
      }
    }
  }, [])

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        )
        const completedCount = updatedMilestones.filter(m => m.completed).length
        const newStatus = completedCount === 0 ? "pending" : 
          completedCount === updatedMilestones.length ? "completed" : "in-progress"
        return { ...goal, milestones: updatedMilestones, status: newStatus }
      }
      return goal
    }))
  }

  const addGoal = () => {
    if (!newGoalTitle.trim()) return
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: "New goal created from conversation insights",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      milestones: []
    }
    setGoals(prev => [...prev, newGoal])
    setNewGoalTitle("")
    setShowAddGoal(false)
  }

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  const downloadAsPDF = async () => {
    // Generate a simple text content for PDF download
    const content = goals.map(goal => 
      `# ${goal.title}\n${goal.description}\nDeadline: ${goal.deadline}\nStatus: ${goal.status}\n\nMilestones:\n${goal.milestones.map(m => `- [${m.completed ? 'x' : ' '}] ${m.title} (Due: ${m.dueDate})`).join('\n')}`
    ).join('\n\n---\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'goals-timeline.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsWord = async () => {
    const content = `GOALS AND TIMELINE\n${"=".repeat(50)}\n\n${goals.map(goal => 
      `${goal.title.toUpperCase()}\n${"-".repeat(30)}\nDescription: ${goal.description}\nDeadline: ${goal.deadline}\nStatus: ${goal.status}\n\nMilestones:\n${goal.milestones.map(m => `  ${m.completed ? '[DONE]' : '[    ]'} ${m.title}\n          Due: ${m.dueDate}`).join('\n')}`
    ).join('\n\n')}`
    
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'goals-timeline.doc'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-400"
      case "in-progress": return "text-amber-400"
      default: return "text-zinc-400"
    }
  }

  const getProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0
    return Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Goals & Timeline</h1>
              <p className="text-sm text-white/60">Visualize your future plans</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={downloadAsPDF}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={downloadAsWord}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Word
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{goals.length}</p>
                <p className="text-sm text-white/60">Total Goals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {goals.filter(g => g.status === "in-progress").length}
                </p>
                <p className="text-sm text-white/60">In Progress</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {goals.filter(g => g.status === "completed").length}
                </p>
                <p className="text-sm text-white/60">Completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {goals.reduce((acc, g) => acc + g.milestones.length, 0)}
                </p>
                <p className="text-sm text-white/60">Milestones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline View */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Goals</h2>
          <Button 
            onClick={() => setShowAddGoal(true)}
            className="bg-white text-blue-900 hover:bg-white/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <Card className="mb-6 border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Enter new goal title..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
                <Button onClick={addGoal} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddGoal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id} className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg text-white">{goal.title}</CardTitle>
                      <span className={`text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status.replace("-", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/60">{goal.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Progress</span>
                    <span>{getProgress(goal)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${getProgress(goal)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {goal.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center gap-3 rounded-lg bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-white/30 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${milestone.completed ? "text-white/50 line-through" : "text-white"}`}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-white/40">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversation Context (if available) */}
        {conversationData.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-white">Conversation Context</h2>
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {conversationData.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white/10 text-white/80"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
