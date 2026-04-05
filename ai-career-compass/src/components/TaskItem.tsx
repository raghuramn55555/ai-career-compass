import { Check, Clock, Zap, PlayCircle } from 'lucide-react';

interface TaskItemProps {
  title: string;
  xp: number;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  youtubeUrl?: string;
  onToggle: () => void;
}

const priorityColors = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-accent/10 text-accent',
  low: 'bg-primary/10 text-primary',
};

const TaskItem = ({ title, xp, time, completed, priority, youtubeUrl, onToggle }: TaskItemProps) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${completed ? 'bg-primary/5 border-primary/20' : 'border-border hover:border-primary/30'}`}>
    {/* Checkbox */}
    <button
      onClick={onToggle}
      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
    >
      {completed && <Check className="h-3 w-3 text-primary-foreground" />}
    </button>

    {/* Title + meta */}
    <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
      <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>{title}</p>
      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-accent" />{xp} XP</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span>
      </div>
    </div>

    {/* Priority badge */}
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityColors[priority]}`}>{priority}</span>

    {/* YouTube link */}
    {youtubeUrl && (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => { e.stopPropagation(); if (!completed) onToggle(); }}
        title="Watch on YouTube & mark done"
        className="flex-shrink-0 h-7 w-7 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
      >
        <PlayCircle className="h-4 w-4 text-white" />
      </a>
    )}
  </div>
);

export default TaskItem;
