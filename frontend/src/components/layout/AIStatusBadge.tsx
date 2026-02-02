import { useSystemStatus } from '@/hooks/useSystem';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function AIStatusBadge() {
  const { data: status, isLoading, isError } = useSystemStatus();

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-2 bg-slate-50">
        <Loader2 className="h-3 w-3 animate-spin text-slate-500"/> 
        <span className="text-slate-500">Checking AI...</span>
      </Badge>
    );
  }

  if (isError || !status) {
    return (
      <Badge variant="destructive" className="gap-2">
        <XCircle className="h-3 w-3"/> 
        API Error
      </Badge>
    );
  }

  const isOnline = status.ollama.available;

  return (
    <div className="flex items-center gap-2 animate-in fade-in duration-500">
      <Badge 
        variant="outline"
        className={`gap-1.5 transition-colors ${
          isOnline 
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        }`}
      >
        {isOnline ? (
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-red-500" />
        )}
        <span className="font-medium">AI System {isOnline ? 'Active' : 'Offline'}</span>
      </Badge>
      
      {isOnline && status.ollama.model && (
        <Badge variant="secondary" className="gap-1.5 shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
          <Bot className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-mono text-xs">{status.ollama.model}</span>
        </Badge>
      )}
    </div>
  );
}
