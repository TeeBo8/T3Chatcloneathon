import { Skeleton } from "@/components/ui/skeleton";

export function ChatHistorySkeleton() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Squelette du bouton "New Chat" avec couleur visible */}
      <Skeleton className="h-10 w-full mb-4 bg-primary/10" />
      
      {/* Squelette pour plusieurs lignes de l'historique */}
      <div className="flex-1 flex-col-reverse overflow-y-auto space-y-1">
        {/* On crée plusieurs squelettes de différentes largeurs pour simuler des titres de chat */}
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-full rounded-md bg-primary/10" />
        </div>
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-4/5 rounded-md bg-primary/10" />
        </div>
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-full rounded-md bg-primary/10" />
        </div>
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-3/4 rounded-md bg-primary/10" />
        </div>
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-5/6 rounded-md bg-primary/10" />
        </div>
        <div className="group relative flex items-center">
          <Skeleton className="h-8 w-2/3 rounded-md bg-primary/10" />
        </div>
      </div>
    </div>
  );
} 