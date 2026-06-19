import { useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import {
  Check,
  Moon,
  Pause,
  Play,
  RefreshCcw,
  SkipForward,
  Sun,
  Target,
  Timer,
} from 'lucide-react'
import TaskManagement from './components/TaskManagement'
import { Task } from './types'

const FOCUS_SECONDS = 25 * 60
const SHORT_BREAK_SECONDS = 5 * 60
const LONG_BREAK_SECONDS = 20 * 60

type PomodoroMode = 'focus' | 'short-break' | 'long-break'

interface TimeDisplayProps {
  totalMs: number
  isPomodoro?: boolean
}

function TimeDisplay({ totalMs, isPomodoro }: TimeDisplayProps) {
  const totalSeconds = Math.floor(totalMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const ms = Math.floor((totalMs % 1000) / 10)

  const hStr = String(hours).padStart(2, '0')
  const mStr = String(minutes).padStart(2, '0')
  const sStr = String(seconds).padStart(2, '0')
  const msStr = String(ms).padStart(2, '0')

  return (
    <div className="time-display">
      {!isPomodoro && (
        <>
          <div className="time-part">
            <span className="val">{hStr}</span>
          </div>
          <span className="sep">:</span>
        </>
      )}
      <div className="time-part">
        <span className="val">{isPomodoro && hours > 0 ? hStr : mStr}</span>
      </div>
      <span className="sep">:</span>
      <div className="time-part">
        <span className="val">{isPomodoro && hours > 0 ? mStr : sStr}</span>
      </div>
      {!isPomodoro && (
        <>
          <span className="sep">.</span>
          <div className="time-part">
            <span className="val">{msStr}</span>
          </div>
        </>
      )}
    </div>
  )
}

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

function NavButton({ active, children, ...props }: NavButtonProps) {
  return (
    <button className={active ? 'nav-button active' : 'nav-button'} type="button" {...props}>
      {children}
    </button>
  )
}

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  label: string
  icon: ReactNode
}

function ControlButton({ children, label, icon, ...props }: ControlButtonProps) {
  return (
    <button
      className="control-button"
      aria-label={label}
      title={label}
      type="button"
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

function App() {
  const [view, setView] = useState<'pomodoro' | 'stopwatch'>('pomodoro')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus')
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0)
  const sessionsRef = useRef(focusSessionsCompleted)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(FOCUS_SECONDS)
  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const modeRef = useRef<PomodoroMode>(pomodoroMode)
  const audioContextRef = useRef<AudioContext | null>(null)

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('kanth_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load tasks from local storage');
      }
    }
    return [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTaskIdRef = useRef(activeTaskId);
  const [completionPromptTask, setCompletionPromptTask] = useState<Task | null>(null);

  const getNextTask = (currentTasks: Task[]) => {
    return currentTasks.filter(t => !t.completed).sort((a, b) => {
      const pMap: Record<Priority, number> = { high: 1, medium: 2, low: 3 };
      return pMap[a.priority] - pMap[b.priority];
    })[0];
  };

  useEffect(() => {
    localStorage.setItem('kanth_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId]);

  const pomodoroLabel = pomodoroMode === 'focus' ? 'Focus' : pomodoroMode === 'short-break' ? 'Short Break' : 'Long Break'
  const pomodoroTotal = pomodoroMode === 'focus' ? FOCUS_SECONDS : pomodoroMode === 'short-break' ? SHORT_BREAK_SECONDS : LONG_BREAK_SECONDS
  const stopwatchProgress = ((stopwatchMs / 1000) % 60) / 60
  const pomodoroProgress = 1 - pomodoroSeconds / pomodoroTotal
  const ringRadius = 150
  const ringCenter = 170
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - stopwatchProgress)
  const markerAngle = stopwatchProgress * 2 * Math.PI - Math.PI / 2
  const markerX = ringCenter + ringRadius * Math.cos(markerAngle)
  const markerY = ringCenter + ringRadius * Math.sin(markerAngle)

  const stopwatchSeconds = Math.floor(stopwatchMs / 1000)

  const title = useMemo(() => {
    const formatPomo = (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    
    const formatStop = (secs: number) => {
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = secs % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    if (pomodoroRunning) {
      return `${formatPomo(pomodoroSeconds)} | ${pomodoroLabel}`
    }
    
    if (stopwatchRunning) {
      return `${formatStop(stopwatchSeconds)} | Stopwatch`
    }

    if (view === 'stopwatch') {
      return `${formatStop(stopwatchSeconds)} | Stopwatch`
    }

    return `${formatPomo(pomodoroSeconds)} | ${pomodoroLabel}`
  }, [pomodoroRunning, pomodoroSeconds, pomodoroLabel, stopwatchRunning, stopwatchSeconds, view])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    let intervalId: number | undefined
    let lastTime = Date.now()

    if (stopwatchRunning) {
      intervalId = window.setInterval(() => {
        const now = Date.now()
        setStopwatchMs((ms) => ms + (now - lastTime))
        lastTime = now
      }, 10)
    }

    return () => window.clearInterval(intervalId)
  }, [stopwatchRunning])

  useEffect(() => {
    modeRef.current = pomodoroMode
  }, [pomodoroMode])

  const unlockAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext

    if (!AudioContext) {
      return null
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    return audioContextRef.current
  }

  const playBell = () => {
    const context = unlockAudio()

    if (!context) {
      return
    }

    const now = context.currentTime
    ;[0, 0.28, 0.56].forEach((delay) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now + delay)
      oscillator.frequency.exponentialRampToValueAtTime(660, now + delay + 0.22)
      gain.gain.setValueAtTime(0.001, now + delay)
      gain.gain.exponentialRampToValueAtTime(0.28, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.42)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now + delay)
      oscillator.stop(now + delay + 0.45)
    })
  }

  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudio()
    }

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  useEffect(() => {
    let intervalId: number | undefined

    if (pomodoroRunning) {
      intervalId = window.setInterval(() => {
        setPomodoroSeconds((seconds) => {
          if (seconds > 1) {
            return seconds - 1
          }

          playBell()
          setTimeout(() => setPomodoroRunning(false), 0)

          const nextMode = (() => {
            if (modeRef.current === 'focus') {
              if (activeTaskIdRef.current) {
                setTasks(prev => prev.map(t => 
                  t.id === activeTaskIdRef.current 
                    ? { ...t, completedPomodoros: t.completedPomodoros + 1, remainingSeconds: undefined } 
                    : t
                ));
              }

              const completed = sessionsRef.current + 1
              setFocusSessionsCompleted(completed)
              sessionsRef.current = completed
              if (completed > 0 && completed % 4 === 0) {
                return 'long-break'
              }
              return 'short-break'
            } else {
              return 'focus'
            }
          })()

          modeRef.current = nextMode
          setPomodoroMode(nextMode)
          return nextMode === 'focus' ? FOCUS_SECONDS : nextMode === 'short-break' ? SHORT_BREAK_SECONDS : LONG_BREAK_SECONDS
        })
      }, 1000)
    }

    return () => window.clearInterval(intervalId)
  }, [pomodoroRunning])

  const switchPomodoroMode = (nextMode: PomodoroMode) => {
    unlockAudio()
    setPomodoroMode(nextMode)
    modeRef.current = nextMode
    setPomodoroSeconds(nextMode === 'focus' ? FOCUS_SECONDS : nextMode === 'short-break' ? SHORT_BREAK_SECONDS : LONG_BREAK_SECONDS)
    setPomodoroRunning(false)
  }

  const restartPomodoro = () => {
    unlockAudio()
    setPomodoroSeconds(pomodoroMode === 'focus' ? FOCUS_SECONDS : pomodoroMode === 'short-break' ? SHORT_BREAK_SECONDS : LONG_BREAK_SECONDS)
    setPomodoroRunning(false)
  }

  const skipPomodoro = () => {
    if (pomodoroMode === 'focus') {
      if (activeTaskIdRef.current) {
        setTasks(prev => prev.map(t => 
          t.id === activeTaskIdRef.current 
            ? { ...t, completedPomodoros: t.completedPomodoros + 1, remainingSeconds: undefined } 
            : t
        ));
      }

      const completed = focusSessionsCompleted + 1
      setFocusSessionsCompleted(completed)
      sessionsRef.current = completed
      if (completed % 4 === 0) {
        switchPomodoroMode('long-break')
      } else {
        switchPomodoroMode('short-break')
      }
    } else {
      let targetTaskId = activeTaskIdRef.current;
      const currentTask = tasks.find(t => t.id === targetTaskId);
      if (!targetTaskId || currentTask?.completed) {
        const nextTask = getNextTask(tasks);
        if (nextTask) {
           targetTaskId = nextTask.id;
        } else {
           targetTaskId = null;
        }
      }

      if (targetTaskId) {
        handleTaskSelect(targetTaskId);
      } else {
        switchPomodoroMode('focus');
        setPomodoroRunning(true);
      }
    }
  }

  const handleTaskSelect = (id: string | null) => {
    unlockAudio();
    if (pomodoroMode === 'focus' && activeTaskIdRef.current && activeTaskIdRef.current !== id) {
      setTasks(prev => prev.map(t => 
        t.id === activeTaskIdRef.current 
          ? { ...t, remainingSeconds: pomodoroSeconds } 
          : t
      ));
    }

    if (!id) {
      setActiveTaskId(null);
      setPomodoroRunning(false);
      return;
    }

    const newTask = tasks.find(t => t.id === id);
    if (!newTask) return;

    setActiveTaskId(id);
    setPomodoroMode('focus');
    modeRef.current = 'focus';
    setPomodoroSeconds(newTask.remainingSeconds !== undefined ? newTask.remainingSeconds : FOCUS_SECONDS);
    setPomodoroRunning(true);
  };

  const togglePomodoro = () => {
    unlockAudio()
    if (!pomodoroRunning && pomodoroMode === 'focus' && !activeTaskId) {
      const nextTask = getNextTask(tasks);
      if (nextTask) {
        handleTaskSelect(nextTask.id);
        return;
      }
    }
    setPomodoroRunning((running) => !running)
  }

  return (
    <main className="app">
      <header className="app-bar">
        <button className="brand" type="button" onClick={() => setView('pomodoro')}>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16" style={{ fill: "color-mix(in srgb, var(--muted) 55%, transparent)" }}>
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
</svg>

          </span>
        </button>

        <div className="navbar-controls">
          <NavButton
            active={view === 'pomodoro'}
            onClick={() => {
              unlockAudio()
              setView('pomodoro')
            }}
          >
            Pomodoro
          </NavButton>
          <NavButton
            active={view === 'stopwatch'}
            onClick={() => setView('stopwatch')}
          >
            Stopwatch
          </NavButton>
          <button
            className="theme-button"
            type="button"
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <section className="timer-shell" aria-live="polite">
        {view === 'pomodoro' ? (
          <div className="pomodoro-card">
            {completionPromptTask && (
              <div className="completion-prompt-overlay">
                <div className="completion-prompt">
                  <h3>Task Completed!</h3>
                  <p>You finished <strong>{completionPromptTask.title}</strong> before the timer ended.</p>
                  <div className="completion-prompt-actions">
                    <button className="primary" onClick={() => {
                      setCompletionPromptTask(null);
                      const nextTask = getNextTask(tasks);
                      if (nextTask) {
                        handleTaskSelect(nextTask.id);
                      } else {
                        setPomodoroRunning(false);
                      }
                    }}>Continue with next task</button>
                    <button className="secondary" onClick={() => {
                      setCompletionPromptTask(null);
                      switchPomodoroMode('short-break');
                      setPomodoroRunning(true);
                    }}>Take a short break</button>
                  </div>
                </div>
              </div>
            )}
            <div className="phase-tabs" aria-label="Pomodoro phase">
              <button
                className={pomodoroMode === 'focus' ? 'active' : ''}
                type="button"
                onClick={() => switchPomodoroMode('focus')}
              >
                Focus
              </button>
              <button
                className={pomodoroMode === 'short-break' ? 'active' : ''}
                type="button"
                onClick={() => switchPomodoroMode('short-break')}
              >
                Short Break
              </button>
              <button
                className={pomodoroMode === 'long-break' ? 'active' : ''}
                type="button"
                onClick={() => switchPomodoroMode('long-break')}
              >
                Long Break
              </button>
            </div>

            {activeTask && (
              <div className="active-task-display">
                <div className="active-task-title">Currently focusing on: <span>{activeTask.title}</span></div>
                <div className="active-task-progress">
                  🍅 {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
                  {activeTask.completedPomodoros >= activeTask.estimatedPomodoros && (
                    <span className="suggested-completion"> ✓ Suggested completion</span>
                  )}
                </div>
              </div>
            )}

            <div className="pomodoro-time">
              <TimeDisplay totalMs={pomodoroSeconds * 1000} isPomodoro />
            </div>

            <div
              className="progress-line"
              aria-hidden="true"
              style={{ '--progress': `${pomodoroProgress * 100}%` }}
            />

            <div className="cycle-indicator" aria-label={`Cycle progress: ${pomodoroMode === 'long-break' ? 4 : (focusSessionsCompleted % 4)} of 4`}>
              {[1, 2, 3, 4].map((step) => {
                const cyclePos = focusSessionsCompleted % 4;
                const isCompleted = pomodoroMode === 'long-break' || cyclePos >= step;
                const isActive = pomodoroMode === 'focus' && cyclePos + 1 === step;
                return (
                  <div
                    key={step}
                    className={`cycle-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                  />
                );
              })}
            </div>

            <div className="pomodoro-controls">
              <ControlButton label={pomodoroRunning ? 'Pause' : 'Start'} icon={pomodoroRunning ? <Pause size={18} /> : <Play size={18} />} onClick={togglePomodoro}>
                {pomodoroRunning ? 'Pause' : 'Start'}
              </ControlButton>
              <ControlButton label="Skip" icon={<SkipForward size={18} />} onClick={skipPomodoro}>
                Skip
              </ControlButton>
              <ControlButton label="Reset" icon={<RefreshCcw size={18} />} onClick={restartPomodoro}>
                Reset
              </ControlButton>
            </div>

          </div>
        ) : (
          <div className="stopwatch-card">
            <div className="stopwatch-ring">
              <svg className="ring-svg" viewBox="0 0 340 340" aria-hidden="true">
                <circle className="ring-track" cx={ringCenter} cy={ringCenter} r={ringRadius} />
                <circle
                  className="ring-progress"
                  cx={ringCenter}
                  cy={ringCenter}
                  r={ringRadius}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
                <circle className="ring-marker" cx={markerX} cy={markerY} r="8" />
              </svg>
              <div className="ring-inner">
                <TimeDisplay totalMs={stopwatchMs} />
              </div>
            </div>

            <div className="stopwatch-controls">
              <ControlButton
                label={stopwatchRunning ? 'Pause' : 'Start'}
                icon={stopwatchRunning ? <Pause size={18} /> : <Play size={18} />}
                onClick={() => setStopwatchRunning((running) => !running)}
              >
                {stopwatchRunning ? 'Pause' : 'Start'}
              </ControlButton>
              <ControlButton
                label="Reset"
                icon={<RefreshCcw size={18} />}
                onClick={() => {
                  setStopwatchMs(0)
                  setStopwatchRunning(false)
                }}
              >
                Reset
              </ControlButton>
            </div>
          </div>
        )}
      </section>

      {view === 'pomodoro' && (
        <TaskManagement 
          tasks={tasks}
          setTasks={setTasks}
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
          onSelectTask={handleTaskSelect}
          onClearActiveTask={() => handleTaskSelect(null)}
          onTaskCompleted={(task) => {
            setPomodoroRunning(false);
            setCompletionPromptTask(task);
            setActiveTaskId(null);
          }}
        />
      )}
    </main>
  )
}

export default App
