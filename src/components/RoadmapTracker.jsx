import React, { useEffect, useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const STORAGE_KEY = 'react-roadmap-progress-v1'

const DEFAULT_DATA = [
  { id: 'stage-1', title: 'React Fundamentals', subtitle: 'Core JSX, components, rendering, events', estWeeks: 2, tasks: [ { id: 's1-1', text: 'What is React & Virtual DOM', done: false }, { id: 's1-2', text: 'Printing messages with JSX', done: false }, { id: 's1-3', text: 'Components & Props', done: false }, { id: 's1-4', text: 'Conditional rendering & lists', done: false }, { id: 's1-5', text: 'Event handling & basic CSS', done: false } ], notes: 'Start small: 3 mini projects: Hello, Profile Card, Todo' },
  { id: 'stage-2', title: 'State Management', subtitle: 'useState, useEffect, forms', estWeeks: 2, tasks: [ { id: 's2-1', text: 'useState basics', done: false }, { id: 's2-2', text: 'useEffect for side effects', done: false }, { id: 's2-3', text: 'Controlled forms & validation', done: false }, { id: 's2-4', text: 'Component lifecycle understanding', done: false } ], notes: 'Make a counter and a weather app' },
  { id: 'stage-3', title: 'Routing & Navigation', subtitle: 'React Router v6 basics', estWeeks: 1, tasks: [ { id: 's3-1', text: 'Install & setup React Router', done: false }, { id: 's3-2', text: 'Routes, Link, NavLink', done: false }, { id: 's3-3', text: 'Dynamic & nested routes', done: false } ], notes: 'Build a simple blog with detail page' },
  { id: 'stage-4', title: 'Data Fetching', subtitle: 'Axios, loading & errors', estWeeks: 2, tasks: [ { id: 's4-1', text: 'Axios GET/POST basics', done: false }, { id: 's4-2', text: 'Loading & error states', done: false }, { id: 's4-3', text: 'useEffect + Axios integration', done: false } ], notes: 'Make a movie search app (OMDb) or GitHub search' },
  { id: 'stage-5', title: 'Global State & Context', subtitle: 'Context API & useContext', estWeeks: 1, tasks: [ { id: 's5-1', text: 'Create a Context provider', done: false }, { id: 's5-2', text: 'Consume with useContext', done: false }, { id: 's5-3', text: 'Replace prop-drilling', done: false } ], notes: 'Implement theme switcher & simple cart' },
  { id: 'stage-6', title: 'Advanced React', subtitle: 'Custom hooks, performance, devtools', estWeeks: 3, tasks: [ { id: 's6-1', text: 'Custom hooks creation', done: false }, { id: 's6-2', text: 'useRef, useMemo, useCallback', done: false }, { id: 's6-3', text: 'Performance optimization', done: false }, { id: 's6-4', text: 'Error boundaries', done: false } ], notes: 'Refactor a notes app with custom hooks' }
]

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export default function RoadmapTracker({ user, onSaveCloud, loadingRemote }) {
  const [stages, setStages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {}
    return DEFAULT_DATA
  })
  const [newTaskText, setNewTaskText] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stages))
  }, [stages])

  useEffect(() => {
    const handler = async () => {
      if (!user || !onSaveCloud) return alert('Sign in first to save to cloud')
      await onSaveCloud(user.uid, stages)
      alert('Saved to cloud')
    }
    window.addEventListener('save-to-cloud', handler)
    return () => window.removeEventListener('save-to-cloud', handler)
  }, [user, onSaveCloud, stages])

  // If user has remoteData (on sign-in), merge it (prefer remote)
  useEffect(() => {
    if (user && user.remoteData) {
      setStages(user.remoteData)
    }
  }, [user && user.remoteData])

  const toggleTask = (stageId, taskId) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : s))
  }

  const addTaskToStage = (stageId, text) => {
    if (!text.trim()) return
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, tasks: [...s.tasks, { id: uid('t'), text: text.trim(), done: false }] } : s))
    setNewTaskText('')
  }

  const stageProgress = (stage) => {
    if (!stage.tasks || stage.tasks.length === 0) return 0
    const done = stage.tasks.filter(t => t.done).length
    return Math.round((done / stage.tasks.length) * 100)
  }

  const overallProgress = () => {
    const allTasks = stages.flatMap(s => s.tasks)
    if (allTasks.length === 0) return 0
    const done = allTasks.filter(t => t.done).length
    return Math.round((done / allTasks.length) * 100)
  }

  const exportPDF = async () => {
    if (!wrapperRef.current) return
    const node = wrapperRef.current
    const canvas = await html2canvas(node, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('react-roadmap-progress.pdf')
  }

  const exportJSON = () => {
    const dataStr = JSON.stringify(stages, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'react-roadmap-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (Array.isArray(json)) setStages(json)
        else alert('Invalid format: JSON should be an array of stages.')
      } catch (err) {
        alert('Error parsing JSON')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div ref={wrapperRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Overall Progress</div>
          <div className="text-2xl font-bold">{overallProgress()}%</div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-3 py-2 bg-indigo-600 text-white rounded">Export PDF</button>
          <button onClick={exportJSON} className="px-3 py-2 bg-green-600 text-white rounded">Export JSON</button>
          <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importJSON(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stages.map(stage => (
          <div key={stage.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{stage.title}</h3>
                <div className="text-xs text-gray-500">{stage.subtitle} • Est {stage.estWeeks} wk</div>
              </div>
              <div className="w-28">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-1">
                  <div style={{ width: `${stageProgress(stage)}%`, backgroundColor: '#10B981', height: '100%' }} />
                </div>
                <div className="text-sm text-right mt-1">{stageProgress(stage)}%</div>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {stage.tasks.map(task => (
                <li key={task.id} className="flex items-center gap-3">
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(stage.id, task.id)} />
                  <div className={task.done ? 'line-through text-gray-400' : ''}>{task.text}</div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-2">
              <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="New task..." className="flex-1 px-3 py-2 border rounded" />
              <button onClick={() => addTaskToStage(stage.id, newTaskText)} className="px-3 py-2 bg-indigo-600 text-white rounded">Add</button>
            </div>

            <div className="mt-3">
              <textarea value={stage.notes} onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, notes: e.target.value } : s))} className="w-full p-2 border rounded" rows={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
